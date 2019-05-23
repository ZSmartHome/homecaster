const express = require(`express`);
const app = express();
const port = 8080;

app.use(express.static(`./www`));

const fs = require(`fs`);

const options = {};

const passphrase = process.env.password;
const secure = passphrase !== undefined;
if (secure) {
  options.pfx = fs.readFileSync(`./cert/default.pfx`);
  options.passphrase = passphrase;
}

const serverType = secure ? require(`https`) : require(`http`);
const server = serverType.createServer(options, app);

server.listen(port, () => console.log(`App is ready at http${secure ? `s` : ``}://localhost:${port}!`));
