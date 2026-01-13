const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const port = Number(process.env.PORT) || 3000;
const rootDir = __dirname;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
};

function sendFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("Server error.");
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "text/plain; charset=utf-8" });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url || "/");
  const safePath = decodeURIComponent(parsedUrl.pathname || "/");

  if (safePath === "/" || safePath === "/index.html") {
    sendFile(res, path.join(rootDir, "index.html"));
    return;
  }

  const requestedPath = path.join(rootDir, safePath);
  if (!requestedPath.startsWith(rootDir)) {
    res.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Bad request.");
    return;
  }

  fs.stat(requestedPath, (err, stats) => {
    if (!err && stats.isFile()) {
      sendFile(res, requestedPath);
      return;
    }

    sendFile(res, path.join(rootDir, "index.html"));
  });
});

server.listen(port, () => {
  console.log(`Bee City Builder running on http://localhost:${port}`);
});
