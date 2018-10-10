const http = require('http');
const util = require('util');
const fs = require('fs');
const open = util.promisify(fs.open);
const path = require('path');

const server = http.createServer();

server.on(`request`, (req, res) => {
  const url = req.url || ``;
  console.log(`got request to: ${url}`);
  console.log(req.headers);

  res.statusCode = 200;
  res.setHeader(`Access-Control-Allow-Origin`, `*`);
  res.setHeader(`Access-Control-Allow-Methods`, `GET, HEAD, POST, OPTIONS`);
  res.setHeader(`Access-Control-Allow-Headers`, `Content-Type, Accept`);
  res.setHeader(`Access-Control-Max-Age`, `3600`);
  if (url.endsWith(`mp4`)) {
    const filePath = path.join(__dirname, 'video/test.mp4');
    const stat = fs.statSync(filePath);

    res.writeHead(200, {
      'Content-Type': 'video/mp4',
      'Content-Length': stat.size
    });

    const readStream = fs.createReadStream(filePath);
    // We replaced all the event handlers with a simple call to readStream.pipe()
    readStream.pipe(res);
  } else {
    res.setHeader('Content-Type', 'text/plain');
    res.end('Hello World\n');
  }
});

const PORT = 8080;
const HOSTNAME = `127.0.0.1`;
server.listen(PORT, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});
