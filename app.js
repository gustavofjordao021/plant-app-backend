require("dotenv").config();

const path = require("path");
const cors = require("cors");
const logger = require("morgan");
const helmet = require("helmet");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const app_name = require("./package.json").name;
const debug = require("debug")(
  `${app_name}:${path.basename(__filename).split(".")[0]}`
);

const app = express();

// CORS setup
app.use(
  cors({
    credentials: true,
    preflightContinue: true,
    optionsSuccessStatus: 200,
    origin: process.env.REACT_APP_CLIENT_POINT,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "HEAD", "PATCH", "DELETE"],
  })
);

// Middleware Setup
app.use(helmet());
app.use(logger("dev"));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// require("./configs/db.config.js");
// require("./configs/session.config.js")(app);

// Route setup
app.use("/", require("./routes/index"));

module.exports = app;
