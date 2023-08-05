import { NextResponse } from "next/server";
import { DEFAULT_RESPONSE_HEADERS } from "./constants";

const generateNextResponse = (body: object, status = 200) => {
  return NextResponse.json(body, {
    status,
    headers: DEFAULT_RESPONSE_HEADERS,
  });
};

export { generateNextResponse };
