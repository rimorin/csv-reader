// function to return NextResponse

import { NextResponse } from "next/server";
import { DEFAULT_RESPONSE_HEADERS } from "./constants";

const generateNextResponse = (error: string, status: number) => {
  return NextResponse.json(
    {
      error,
    },
    {
      status,
      headers: DEFAULT_RESPONSE_HEADERS,
    }
  );
};

export { generateNextResponse };
