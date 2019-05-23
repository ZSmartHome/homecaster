const express = require(`express`);
const app = express();
const port = 8080;

app.use(express.static(`www`));

app.listen(port, () => console.log(`App is ready at http://localhost:${port}!`));
