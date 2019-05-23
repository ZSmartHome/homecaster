const http = require(`http`);

const handler = require(`./server-handler`);

const server = http.createServer();

server.on(`request`, handler);

const PORT = 8080;
const HOSTNAME = `127.0.0.1`;
server.listen(PORT, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
