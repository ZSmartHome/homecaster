const http = require('http');
const util = require('util');

const server = http.createServer();

server.on(`request`, (req, res) => {
  console.log(`got request to: ${req.url}`);
  console.log(req.headers);

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World\n');
});

const PORT = 8080;
const HOSTNAME = `127.0.0.1`;
server.listen(PORT, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});