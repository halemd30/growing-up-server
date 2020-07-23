const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");

const app = express();

const morganOptions = NODE_ENV === "production" ? "tiny" : "normal";

app.use(morgan());
app.use(cors());
app.use(helmet());
