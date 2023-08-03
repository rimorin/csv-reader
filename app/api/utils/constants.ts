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

export {
  STREAM_TIMEOUT_MS,
  DEFAULT_RESPONSE_HEADERS,
  CACHE_EXPIRY_SECONDS,
  MANDATORY_HEADERS,
};
