// Statyczny serwer gry (do testów online przez tunel cloudflared).
// Uruchamiany przez tools/start-online.ps1. Serwuje katalog projektu.
const http = require("http");
const fs = require("fs");
const path = require("path");
const root = path.normalize(path.join(__dirname, ".."));
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
};
http
  .createServer((req, res) => {
    let p = decodeURIComponent(req.url.split("?")[0]);
    if (p === "/") p = "/statki.html";
    const file = path.normalize(path.join(root, p));
    if (!file.startsWith(root)) { res.writeHead(403); res.end(); return; }
    fs.readFile(file, (err, data) => {
      if (err) { res.writeHead(404); res.end("not found"); return; }
      res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" });
      res.end(data);
    });
  })
  .listen(8000, () => console.log("static server on 8000"));
