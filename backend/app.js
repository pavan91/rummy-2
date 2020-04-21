const express = require("express");
const bodyParser = require("body-parser");
const routes = require("./router");
const path = require("path");
const app = express();

app.use(bodyParser.json());
// app.use("/", express.static(path.join(__dirname, "src")));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, PUT, OPTIONS"
  );
  next();
});

app.enable("trust proxy");
app.use("/api/", routes);
// if (!process.env.isTestEnv) {
// app.use((req, res, next) => {
// res.sendFile(path.join(__dirname, "src", "index.html"));
// });
// }

module.exports = app;
