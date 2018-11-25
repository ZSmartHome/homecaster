const http = require(`http`);
const util = require(`util`);
const fs = require(`fs`);
const open = util.promisify(fs.open);
const path = require(`path`);

const server = http.createServer();

const sendFile = (res, path, type) => {
  const filePath = path.join(__dirname,);
  const stat = fs.statSync(filePath);

  res.setHeader(`Content-Type`, type);
  res.setHeader(`Content-Length`, stat.size);
  res.writeHead(200);

  const readStream = fs.createReadStream(filePath);
  // We replaced all the event handlers with a simple call to readStream.pipe()
  readStream.pipe(res);
};

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
    sendFile(res, `video/test.mp4`, `video/mp4`);
  } else if (url.endsWith(`vtt`)) {
    sendFile(res, `video/video.vtt`, `text/vtt`);
  } else {
    res.setHeader(`Content-Type`, `text/plain`);
    res.end(`Hello World\n`);
  }
});

const PORT = 8080;
const HOSTNAME = `127.0.0.1`;
server.listen(PORT, () => {
  console.log(`Server running at http://${HOSTNAME}:${PORT}/`);
});