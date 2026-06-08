const { createHash, createHmac } = require("node:crypto");

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Authorization, Content-Type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify(body),
  };
}

function handleOptions(event) {
  if (event.httpMethod !== "OPTIONS") return null;
  return {
    statusCode: 204,
    headers: CORS_HEADERS,
    body: "",
  };
}

function getEnvStatus() {
  const supabasePublishableKey = getSupabasePublishableKey();

  return {
    cloudflareAccountId: Boolean(process.env.CLOUDFLARE_ACCOUNT_ID),
    r2BucketName: Boolean(process.env.R2_BUCKET_NAME),
    r2AccessKeyId: Boolean(process.env.R2_ACCESS_KEY_ID),
    r2SecretAccessKey: Boolean(process.env.R2_SECRET_ACCESS_KEY),
    r2PublicBaseUrl: Boolean(process.env.R2_PUBLIC_BASE_URL),
    supabaseUrl: Boolean(process.env.SUPABASE_URL),
    supabasePublishableKey: Boolean(supabasePublishableKey),
    readyForR2Upload: Boolean(
      process.env.CLOUDFLARE_ACCOUNT_ID
        && process.env.R2_BUCKET_NAME
        && process.env.R2_ACCESS_KEY_ID
        && process.env.R2_SECRET_ACCESS_KEY,
    ),
  };
}

function getSupabasePublishableKey() {
  return (
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

function requireR2Config() {
  if (!getEnvStatus().readyForR2Upload) {
    throw Object.assign(new Error("Cloudflare R2 config is missing."), { statusCode: 500 });
  }
}

function parseBody(event) {
  if (!event.body) return {};
  return JSON.parse(event.isBase64Encoded ? Buffer.from(event.body, "base64").toString("utf8") : event.body);
}

async function requireAuthenticatedUser(event) {
  const authorization = event.headers.authorization || event.headers.Authorization || "";
  if (!authorization.startsWith("Bearer ")) {
    throw Object.assign(new Error("Vui lòng đăng nhập để thao tác ảnh."), { statusCode: 401 });
  }

  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = getSupabasePublishableKey();

  if (!supabaseUrl || !supabaseKey) {
    throw Object.assign(
      new Error("Supabase auth config is missing on the server. Add SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY in Netlify environment variables, then redeploy."),
      { statusCode: 500 },
    );
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: supabaseKey,
      Authorization: authorization,
    },
  });

  if (!response.ok) {
    throw Object.assign(new Error("Phiên đăng nhập không hợp lệ hoặc đã hết hạn."), { statusCode: 401 });
  }

  return response.json();
}

function hmac(key, value, encoding) {
  return createHmac("sha256", key).update(value).digest(encoding);
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

function rfc3986(value) {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function encodeKey(key) {
  return key.split("/").map(rfc3986).join("/");
}

function sanitizeFileName(name) {
  const safeName = String(name || "image")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return safeName || `image-${Date.now()}`;
}

function getTimestamp() {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  return {
    amzDate,
    dateStamp: amzDate.slice(0, 8),
  };
}

function signRequest({ method, storageKey, expiresSeconds = 300 }) {
  requireR2Config();

  const { amzDate, dateStamp } = getTimestamp();
  const scope = `${dateStamp}/auto/s3/aws4_request`;
  const credential = `${process.env.R2_ACCESS_KEY_ID}/${scope}`;
  const host = `${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const pathname = `/${process.env.R2_BUCKET_NAME}/${encodeKey(storageKey)}`;
  const signedHeaders = "host";
  const queryEntries = [
    ["X-Amz-Algorithm", "AWS4-HMAC-SHA256"],
    ["X-Amz-Credential", credential],
    ["X-Amz-Date", amzDate],
    ["X-Amz-Expires", String(expiresSeconds)],
    ["X-Amz-SignedHeaders", signedHeaders],
  ].sort(([a], [b]) => (a < b ? -1 : 1));
  const canonicalQuery = queryEntries
    .map(([key, value]) => `${rfc3986(key)}=${rfc3986(value)}`)
    .join("&");
  const canonicalRequest = [
    method,
    pathname,
    canonicalQuery,
    `host:${host}\n`,
    signedHeaders,
    "UNSIGNED-PAYLOAD",
  ].join("\n");
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    scope,
    hash(canonicalRequest),
  ].join("\n");
  const dateKey = hmac(`AWS4${process.env.R2_SECRET_ACCESS_KEY}`, dateStamp);
  const regionKey = hmac(dateKey, "auto");
  const serviceKey = hmac(regionKey, "s3");
  const signingKey = hmac(serviceKey, "aws4_request");
  const signature = hmac(signingKey, stringToSign, "hex");

  return `https://${host}${pathname}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

function presignR2Upload({ fileName, folder, expiresSeconds = 300 }) {
  const safeFolder = String(folder || "products")
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9/_-]+/g, "-")
    .toLowerCase();
  const storageKey = `${safeFolder}/${Date.now()}-${sanitizeFileName(fileName)}`;
  const publicBaseUrl = process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "") || "";

  return {
    upload_url: signRequest({ method: "PUT", storageKey, expiresSeconds }),
    storage_key: storageKey,
    public_url: publicBaseUrl ? `${publicBaseUrl}/${storageKey}` : "",
    bucket: process.env.R2_BUCKET_NAME,
    expires_in: expiresSeconds,
  };
}

function presignR2Delete(storageKey) {
  return signRequest({ method: "DELETE", storageKey, expiresSeconds: 120 });
}

module.exports = {
  handleOptions,
  getEnvStatus,
  json,
  parseBody,
  presignR2Delete,
  presignR2Upload,
  requireAuthenticatedUser,
};
