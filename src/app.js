const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

const morganOptions = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOptions));
app.use(cors());
app.use(helmet());

app.get("/", (req, res) => {
  res.send("The good stuff");
});

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    response = { message: error.message, error };
  }
  console.log(error);
  res.status(500).json(response);
});

module.exports = app;
