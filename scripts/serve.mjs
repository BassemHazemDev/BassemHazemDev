// Tiny static server for the local preview: node serve.mjs → http://localhost:4173/scripts/preview.html
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { ROOT } from "./data.mjs";

// Same policy raw.githubusercontent.com sends, so the preview fails the way GitHub would.
const CSP = "default-src 'none'; style-src 'unsafe-inline'; sandbox";
const types = { ".html": "text/html", ".svg": "image/svg+xml", ".md": "text/plain", ".png": "image/png" };
createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname)).replace(/^[\/]+/, "");
  try {
    const body = await readFile(join(ROOT, path));
    res.writeHead(200, { "content-type": types[extname(path)] ?? "application/octet-stream", "cache-control": "no-store", ...(extname(path) === ".svg" && { "content-security-policy": CSP }) });
    res.end(body);
  } catch {
    res.writeHead(404).end("not found");
  }
}).listen(4173, () => console.log("http://localhost:4173/scripts/preview.html"));
