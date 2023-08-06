/** @jest-environment node */
import { NextResponse } from "next/server";
import { GET } from "./route";
import { DEFAULT_PAGE_SIZES } from "../utils/constants";
import { generateNextRequest } from "./utils/helpers";

jest.mock("axios");
jest.mock("ioredis", () => {
  return {
    __esModule: true,
    Redis: jest.fn().mockImplementation(() => {
      return {
        disconnect: jest.fn(),
        set: jest.fn(),
        get: jest.fn(),
      };
    }),
  };
});

describe("GET /api", () => {
  it("test missing url", async () => {
    const response = (await GET(
      generateNextRequest({ url: "" })
    )) as NextResponse;

    const error = await response.json();
    expect(error.error).toBe("url is required");
    expect(response.status).toBe(400);
  });
  it("test invalid url", async () => {
    const response = (await GET(
      generateNextRequest({ url: "https://www.google.com" })
    )) as NextResponse;
    const error = await response.json();
    expect(error.error).toBe("url should be a link to csv file");
    expect(response.status).toBe(400);
  });
  // test missing limit
  it("test minimum limit", async () => {
    const response = (await GET(
      generateNextRequest({
        url: "https://www.google.com/dummy.csv",
        limit: -1,
      })
    )) as NextResponse;
    const error = await response.json();
    expect(error.error).toBe("limit should be greater than 0");
    expect(response.status).toBe(400);
  });
  it("test max limit", async () => {
    const response = (await GET(
      generateNextRequest({
        url: "https://www.google.com/dummy.csv",
        limit: DEFAULT_PAGE_SIZES[DEFAULT_PAGE_SIZES.length - 1] + 1,
      })
    )) as NextResponse;
    const error = await response.json();
    expect(error.error).toBe(
      `limit should be less than or equal to ${
        DEFAULT_PAGE_SIZES[DEFAULT_PAGE_SIZES.length - 1]
      }`
    );
    expect(response.status).toBe(400);
  });

  // check if page is invalid
  it("test invalid page", async () => {
    const response = (await GET(
      generateNextRequest({
        url: "https://www.google.com/dummy.csv",
        page: 0,
      })
    )) as NextResponse;
    const error = await response.json();
    expect(error.error).toBe("page should be greater than 0");
    expect(response.status).toBe(400);
  });
});
