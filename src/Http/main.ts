import { createServer, type IncomingMessage, type ServerResponse } from "http";

const port = Number(process.env.PORT ?? "3000");
const version = process.env.APP_VERSION ?? process.env.npm_package_version ?? "0.0.0";

const server = createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    sendJson(response, 405, { error: "Method not allowed" });
    return;
  }

  const path = requestPath(request);

  if (path === "/health") {
    sendJson(response, 200, { status: "ok" });
    return;
  }

  if (path === "/version") {
    sendJson(response, 200, { name: "vehicle-fleet-ddd-cqrs", version });
    return;
  }

  sendJson(response, 404, { error: "Not found" });
});

server.listen(port, () => {
  console.log(`fleet runtime listening on port ${port}`);
});

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

function requestPath(request: IncomingMessage): string {
  return new URL(request.url ?? "/", "http://localhost").pathname;
}

function sendJson(
  response: ServerResponse,
  statusCode: number,
  body: Record<string, string>,
): void {
  response.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(body));
}

function shutdown(): void {
  server.close(() => {
    process.exit(0);
  });
}
