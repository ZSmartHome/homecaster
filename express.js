const express = require(`express`);
const app = express();
const port = 8080;

app.use(express.static(`./www`));

const fs = require(`fs`);

const options = {};

const passphrase = process.env.password;
if (passphrase) {
  options.pfx = fs.readFileSync(`./cert`);
  options.passphrase = passphrase;
}

const serverType = passphrase ? require(`https`) : require(`http`);
const server = serverType.createServer(options, app);

server.listen(port, () => console.log(`App is ready at http://localhost:${port}!`));
