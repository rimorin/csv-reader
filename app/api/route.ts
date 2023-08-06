import { Parser } from "csv-parse";
import Axios from "axios";
import { Redis } from "ioredis";
import {
  CACHE_EXPIRY_SECONDS,
  DEFAULT_INITIAL_PAGE,
  MANDATORY_HEADERS,
  STREAM_TIMEOUT_MS,
} from "./utils/constants";
import { DEFAULT_PAGE_SIZES } from "../utils/constants";
import { generateNextResponse } from "./utils/helpers";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const parameters = req.nextUrl.searchParams;
  const url = parameters.get("url");
  const limit = parseInt(
    parameters.get("limit") || DEFAULT_PAGE_SIZES[1].toString()
  );
  const page = parseInt(
    parameters.get("page") || DEFAULT_INITIAL_PAGE.toString()
  );
  const filter = parameters.get("filter");

  const redisCachingService = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    username: process.env.REDIS_USERNAME || "",
    password: process.env.REDIS_PASSWORD || "",
  });

  try {
    // check if url is valid
    if (!url) {
      return generateNextResponse({ error: "url is required" }, 400);
    }

    // check if url contains link to csv file
    if (!url.endsWith(".csv")) {
      return generateNextResponse(
        { error: "url should be a link to csv file" },
        400
      );
    }

    // check if limit is valid
    if (limit < 0) {
      return generateNextResponse(
        { error: "limit should be greater than 0" },
        400
      );
    }

    if (limit > DEFAULT_PAGE_SIZES[DEFAULT_PAGE_SIZES.length - 1]) {
      return generateNextResponse(
        {
          error: `limit should be less than or equal to ${
            DEFAULT_PAGE_SIZES[DEFAULT_PAGE_SIZES.length - 1]
          }`,
        },
        400
      );
    }

    // check if page is valid
    if (page < 1) {
      return generateNextResponse(
        { error: "page should be greater than 0" },
        400
      );
    }

    // check if cache for the url, page, limit and filter is present
    const responseKey = `${url}-${page}-${limit}-${filter}`;
    const cacheResponse = await redisCachingService.get(responseKey);
    if (cacheResponse) {
      return generateNextResponse(JSON.parse(cacheResponse));
    }

    // check if total number of lines for the csv remote file is present in cache
    const totalKey = `${url}-total`;
    let totalNoOfLines = 0;
    const urlCacheTotal = await redisCachingService.get(totalKey);
    if (urlCacheTotal) {
      totalNoOfLines = parseInt(urlCacheTotal);
    } else {
      const response = await Axios.get(url);
      const csvString = response.data;
      totalNoOfLines = csvString.split("\n").length - 1;
      // this is a memory intensive operation. So, cache the total number of lines for the csv remote file
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
        // if filter is not present, return all records
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
      return generateNextResponse({ error: "No records found" }, 404);
    }

    // check if mandatory headers are present
    const isMandatoryHeadersPresent = MANDATORY_HEADERS.every((header) =>
      Object.keys(records[0]).includes(header)
    );
    if (!isMandatoryHeadersPresent) {
      return generateNextResponse(
        { error: "Mandatory headers are missing" },
        400
      );
    }

    const responseData = {
      results: records,
      pageCount:
        totalNoOfLines % limit === 0
          ? totalNoOfLines / limit
          : Math.floor(totalNoOfLines / limit) + 1,
    };

    // cache response for future use. Cache will expire in 1 hour
    await redisCachingService.set(
      responseKey,
      JSON.stringify(responseData),
      "EX",
      CACHE_EXPIRY_SECONDS
    );

    return generateNextResponse(responseData);
  } catch (error: any) {
    return generateNextResponse(
      { error: error.message || "Internal server error" },
      500
    );
  } finally {
    redisCachingService.disconnect();
  }
}
