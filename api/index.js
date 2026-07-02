// Vercel serverless function entry point for TanStack Start SSR
import server from "../dist/server/server.js";

export default async function handler(req, res) {
  // Convert Node.js IncomingMessage to Web Request
  const protocol = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const url = `${protocol}://${host}${req.url}`;

  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((v) => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  let body = undefined;
  if (req.method !== "GET" && req.method !== "HEAD") {
    body = await new Promise((resolve) => {
      const chunks = [];
      req.on("data", (chunk) => chunks.push(chunk));
      req.on("end", () => resolve(Buffer.concat(chunks)));
    });
  }

  const request = new Request(url, {
    method: req.method,
    headers,
    body: body && body.length > 0 ? body : undefined,
  });

  const response = await server.fetch(request, {}, {});

  // Copy status and headers to Node.js response
  res.statusCode = response.status;
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  const arrayBuffer = await response.arrayBuffer();
  res.end(Buffer.from(arrayBuffer));
}
