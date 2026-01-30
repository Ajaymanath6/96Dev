#!/usr/bin/env node
/**
 * Component helper server: GET /health, POST /generate.
 * Run: node scripts/component-helper.mjs or npm run component-helper
 * Port: 4202
 */
import http from "http";
import path from "path";
import fs from "fs";

const PORT = 4202;

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
}

async function handleGenerate(body) {
  const { componentId } = body;
  if (!componentId) return { success: false, error: "componentId required" };
  const safeId = componentId.replace(/[^a-zA-Z0-9-_]/g, "");
  const dir = path.join(process.cwd(), "src", "components", safeId);
  const filePath = path.join(dir, `${safeId}.tsx`);
  const componentPath = `src/components/${safeId}/${safeId}.tsx`;
  const componentTag = `<${safeId} />`;

  const content = `"use client";

export default function ${safeId}() {
  return <div data-component-id="${safeId}">${safeId}</div>;
}
`;

  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, content, "utf8");
    return { success: true, files: [filePath], componentPath, componentTag };
  } catch (err) {
    return { success: false, error: String(err.message) };
  }
}

const server = http.createServer(async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = req.url ?? "/";
  if (req.method === "GET" && (url === "/health" || url === "/")) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (req.method === "POST" && url === "/generate") {
    const body = await parseBody(req);
    const result = await handleGenerate(body);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(result));
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`Component helper running at http://localhost:${PORT}`);
});
