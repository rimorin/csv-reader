import { Parser } from "csv-parse";
import Axios from "axios";
import { Redis } from "ioredis";
import {
  CACHE_EXPIRY_SECONDS,
  DEFAULT_RESPONSE_HEADERS,
  MANDATORY_HEADERS,
  STREAM_TIMEOUT_MS,
} from "./utils/constants";
import { NextResponse } from "next/server";
import { DEFAULT_PAGE_SIZES } from "../utils/constants";
import { generateNextResponse } from "./utils/helpers";

export async function POST(req: Request) {
  const { url, filter, page = 1, limit = 10 } = await req.json();

  const redisCachingService = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    username: process.env.REDIS_USERNAME || "",
    password: process.env.REDIS_PASSWORD || "",
  });

  try {
    // check if url is valid
    if (!url) {
      return generateNextResponse("url is required", 400);
    }

    // check if url contains link to csv file
    if (!url.endsWith(".csv")) {
      return generateNextResponse("url should be a link to csv file", 400);
    }

    // check if limit is valid
    if (!limit || limit < 0) {
      return generateNextResponse("limit should be greater than 0", 400);
    }

    if (!limit || limit > DEFAULT_PAGE_SIZES[DEFAULT_PAGE_SIZES.length - 1]) {
      return generateNextResponse(
        `limit should be less than or equal to ${
          DEFAULT_PAGE_SIZES[DEFAULT_PAGE_SIZES.length - 1]
        }`,
        400
      );
    }

    // check if page is valid
    if (page < 1) {
      return generateNextResponse("page should be greater than 0", 400);
    }

    const responseKey = `${url}-${page}-${limit}-${filter}`;
    const cacheResponse = await redisCachingService.get(responseKey);
    if (cacheResponse) {
      return NextResponse.json(JSON.parse(cacheResponse), {
        headers: DEFAULT_RESPONSE_HEADERS,
      });
    }

    const totalKey = `${url}-total`;
    let totalNoOfLines = 0;
    const urlCacheTotal = await redisCachingService.get(totalKey);
    if (urlCacheTotal) {
      totalNoOfLines = parseInt(urlCacheTotal);
    } else {
      const response = await Axios.get(url);
      const csvString = response.data;
      totalNoOfLines = csvString.split("\n").length - 1;
      await redisCachingService.set(
        totalKey,
        totalNoOfLines.toString(),
        "EX",
        CACHE_EXPIRY_SECONDS
      );
    }

    const records: any[] = [];

    const from = (page - 1) * limit;
    const to = from + limit;

    const parser = new Parser({
      columns: true,
      relax_quotes: true,
      trim: true,
      from: from,
      to: to,
      on_record(record, _) {
        if (!filter) return record;
        const isFilterValuePresentInRecord =
          Object.values(record).findIndex(
            (value) =>
              typeof value === "string" &&
              value.toLowerCase().includes(filter.toLowerCase())
          ) > -1;
        if (isFilterValuePresentInRecord) return record;
        return null;
      },
    });

    const streamResponse = await Axios.get(url, {
      responseType: "stream",
      timeout: STREAM_TIMEOUT_MS,
    });

    streamResponse.data.pipe(parser);
    for await (const record of parser) {
      records.push(record);
    }

    // check if records are present
    if (records.length === 0) {
      return generateNextResponse("No records found", 404);
    }

    // check if mandatory headers are present
    const isMandatoryHeadersPresent = MANDATORY_HEADERS.every((header) =>
      Object.keys(records[0]).includes(header)
    );
    if (!isMandatoryHeadersPresent) {
      return generateNextResponse("Mandatory headers are missing", 400);
    }

    const responseData = {
      results: records,
      pageCount:
        totalNoOfLines % limit === 0
          ? totalNoOfLines / limit
          : Math.floor(totalNoOfLines / limit) + 1,
    };

    await redisCachingService.set(
      responseKey,
      JSON.stringify(responseData),
      "EX",
      CACHE_EXPIRY_SECONDS
    );

    return NextResponse.json(responseData);
  } catch (error: any) {
    return generateNextResponse(error.message || "Internal server error", 500);
  } finally {
    redisCachingService.disconnect();
  }
}
