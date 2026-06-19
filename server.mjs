import { createServer } from "node:http";
import { createHmac, createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { watch } from "node:fs";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const envPath = join(root, ".env");

async function loadEnv() {
  try {
    const source = await readFile(envPath, "utf8");
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .forEach((line) => {
        const separatorIndex = line.indexOf("=");
        if (separatorIndex === -1) return;

        const key = line.slice(0, separatorIndex).trim();
        const rawValue = line.slice(separatorIndex + 1).trim();
        const value = rawValue.replace(/^['"]|['"]$/g, "");

        if (key && process.env[key] === undefined) {
          process.env[key] = value;
        }
      });
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`Could not load .env: ${error.message}`);
    }
  }
}

await loadEnv();

const port = Number(process.env.PORT || 5174);
const host = process.env.HOST || "0.0.0.0";
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".jsx": "text/babel; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

// --- Live reload (dependency-free) -----------------------------------------
// Browsers subscribe to /__livereload over Server-Sent Events; a recursive
// fs.watch on the project pushes a "reload" message (debounced) on any save.
const liveReloadClients = new Set();
const liveReloadSnippet = `
<script>
(function () {
  function connect() {
    var es = new EventSource("/__livereload");
    es.onmessage = function (event) {
      if (event.data === "reload") location.reload();
    };
    es.onerror = function () {
      es.close();
      setTimeout(connect, 1000);
    };
  }
  connect();
})();
</script>`;

let reloadTimer = null;
function notifyReload() {
  if (reloadTimer) clearTimeout(reloadTimer);
  reloadTimer = setTimeout(() => {
    for (const client of liveReloadClients) {
      client.write("data: reload\n\n");
    }
  }, 80);
}

watch(root, { recursive: true }, (_eventType, fileName) => {
  if (!fileName) return;
  const name = String(fileName);
  if (name.includes(".git") || name.includes("node_modules")) return;
  if (/\.(html|css|js|jsx|json|svg|png|webp|jpe?g)$/i.test(name)) {
    notifyReload();
  }
});

function sendJson(response, status, data) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(data));
}

function getEnvStatus() {
  return {
    cloudflareAccountId: Boolean(process.env.CLOUDFLARE_ACCOUNT_ID),
    r2BucketName: Boolean(process.env.R2_BUCKET_NAME),
    r2AccessKeyId: Boolean(process.env.R2_ACCESS_KEY_ID),
    r2SecretAccessKey: Boolean(process.env.R2_SECRET_ACCESS_KEY),
    r2PublicBaseUrl: Boolean(process.env.R2_PUBLIC_BASE_URL),
    readyForR2Upload: Boolean(
      process.env.CLOUDFLARE_ACCOUNT_ID &&
      process.env.R2_BUCKET_NAME &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY,
    ),
  };
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      try {
        const text = Buffer.concat(chunks).toString("utf8");
        resolve(text ? JSON.parse(text) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function hmac(key, value, encoding) {
  return createHmac("sha256", key).update(value).digest(encoding);
}

function hash(value) {
  return createHash("sha256").update(value).digest("hex");
}

// AWS Sigv4 uses RFC 3986 percent-encoding, which differs from encodeURIComponent
// in that `!'()*` must also be encoded.
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

// Build a Sigv4 presigned PUT URL for Cloudflare R2.
// Only `host` is in SignedHeaders, so the browser can PUT with any headers
// (including Content-Type) without invalidating the signature.
function presignR2Upload({ fileName, folder, expiresSeconds = 300 }) {
  if (!getEnvStatus().readyForR2Upload) {
    throw new Error("Cloudflare R2 config is missing.");
  }

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const scope = `${dateStamp}/auto/s3/aws4_request`;
  const credential = `${process.env.R2_ACCESS_KEY_ID}/${scope}`;

  const safeFolder = String(folder || "products")
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9/_-]+/g, "-")
    .toLowerCase();
  const storageKey = `${safeFolder}/${Date.now()}-${sanitizeFileName(fileName)}`;
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
    "PUT",
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

  const publicBaseUrl =
    process.env.R2_PUBLIC_BASE_URL?.replace(/\/$/, "") || "";
  return {
    upload_url: `https://${host}${pathname}?${canonicalQuery}&X-Amz-Signature=${signature}`,
    storage_key: storageKey,
    public_url: publicBaseUrl ? `${publicBaseUrl}/${storageKey}` : "",
    bucket: process.env.R2_BUCKET_NAME,
    expires_in: expiresSeconds,
  };
}

function presignR2Action({ method, storageKey, expiresSeconds = 120 }) {
  if (!getEnvStatus().readyForR2Upload) {
    throw new Error("Cloudflare R2 config is missing.");
  }

  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
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

async function deleteFromR2(storageKey) {
  const deleteUrl = presignR2Action({ method: "DELETE", storageKey });
  const deleteResponse = await fetch(deleteUrl, { method: "DELETE" });

  if ([200, 204, 404].includes(deleteResponse.status)) return;

  const text = await deleteResponse.text().catch(() => "");
  throw new Error(`R2 delete failed: ${deleteResponse.status} ${text}`);
}

createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);

  if (url.pathname === "/__livereload") {
    response.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    response.write("retry: 1000\n\n");
    liveReloadClients.add(response);
    request.on("close", () => liveReloadClients.delete(response));
    return;
  }

  if (url.pathname === "/api/env-status") {
    sendJson(response, 200, getEnvStatus());
    return;
  }

  if (url.pathname === "/api/r2-presign" && request.method === "POST") {
    try {
      const body = await readJsonBody(request);
      if (!body?.file_name) {
        sendJson(response, 400, { error: "Missing file_name." });
        return;
      }
      const result = presignR2Upload({
        fileName: body.file_name,
        folder: body.folder || "products",
      });
      sendJson(response, 200, result);
    } catch (error) {
      sendJson(response, 500, { error: error.message });
    }
    return;
  }

  if (url.pathname === "/api/r2-delete" && request.method === "POST") {
    try {
      const body = await readJsonBody(request);
      if (!body?.storage_key) {
        sendJson(response, 400, { error: "Missing storage_key." });
        return;
      }

      await deleteFromR2(body.storage_key);
      sendJson(response, 200, { ok: true });
    } catch (error) {
      sendJson(response, 500, { error: error.message });
    }
    return;
  }

  const cleanPath = normalize(
    url.pathname === "/" ? "/index.html" : url.pathname,
  ).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, cleanPath);

  try {
    const fileExtension = extname(filePath);

    if (fileExtension === ".html") {
      let html = await readFile(filePath, "utf8");
      html = html.includes("</body>")
        ? html.replace("</body>", `${liveReloadSnippet}\n</body>`)
        : html + liveReloadSnippet;
      response.writeHead(200, { "Content-Type": types[".html"] });
      response.end(html);
      return;
    }

    const body = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": types[fileExtension] || "application/octet-stream",
    });
    response.end(body);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}).listen(port, host, () => {
  const displayHost = host === "0.0.0.0" ? "127.0.0.1" : host;
  console.log(`AnHuyclone running at http://${displayHost}:${port}`);
});
