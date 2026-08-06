// Serwer sygnalizacyjny PeerJS dla gry "Statki".
// Wdrożenie: Render / Railway / Fly.io (Node.js).
// 1) npm install
// 2) uruchomienie: npm start (albo node server.js)
// Platforma sama ustawia zmienną PORT i daje publiczny adres HTTPS,
// np. https://peer-statki.onrender.com — ten adres wpisz w grze
// w zmienną PEER_SERVER (statki.html) albo użyj parametru ?peer=...
const { PeerServer } = require("peer");

const PORT = process.env.PORT || 9000;

const server = PeerServer({
  port: PORT,
  host: "0.0.0.0",
  path: "/",
  proxied: true,
});

server.on("connection", client => {
  console.log("Połączono:", client.getId());
});

server.on("disconnect", client => {
  console.log("Rozłączono:", client.getId());
});

console.log("Serwer PeerJS nasłuchuje na porcie", PORT);
