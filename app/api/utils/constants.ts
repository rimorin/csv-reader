const STREAM_TIMEOUT_MS = 5000;
const DEFAULT_RESPONSE_HEADERS = { "content-type": "application/json" };
const CACHE_EXPIRY_SECONDS = 3600;
const MANDATORY_HEADERS = [
  "InvoiceNo",
  "StockCode",
  "Description",
  "Quantity",
  "InvoiceDate",
  "UnitPrice",
  "CustomerID",
  "Country",
];
const DEFAULT_INITIAL_PAGE = 1;
const DUMMY_URL_FOR_TESTING = "https://www.whatever.com";

export {
  STREAM_TIMEOUT_MS,
  DEFAULT_RESPONSE_HEADERS,
  CACHE_EXPIRY_SECONDS,
  MANDATORY_HEADERS,
  DEFAULT_INITIAL_PAGE,
  DUMMY_URL_FOR_TESTING,
};
