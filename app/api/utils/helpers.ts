import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_RESPONSE_HEADERS, DUMMY_URL_FOR_TESTING } from "./constants";

const generateNextResponse = (body: object, status = 200) => {
  return NextResponse.json(body, {
    status,
    headers: DEFAULT_RESPONSE_HEADERS,
  });
};

// generateNextRequest generates a NextRequest object with the given body. Use for testing.
const generateNextRequest = (body: object) => {
  const request = new NextRequest(new Request(DUMMY_URL_FOR_TESTING), {});
  const params = request.nextUrl.searchParams;
  Object.entries(body).forEach(([key, value]) => {
    params.set(key, value);
  });
  return request;
};

export { generateNextResponse, generateNextRequest };
