const express = require("express");
const router = require("./router/index");
const app = express();
const handlebars = require("express-handlebars");
const mongoConnect = require("./db");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const path = require("path");
const MongoStore = require("connect-mongo");

const initializePassport = require("./configs/passport.config");
const passport = require("passport");
const { winstonLogger } = require("./middlewares/logger.middleware");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(process.cwd() + "/src/public"));
app.use(
  session({
    secret: "8-bits",

    resave: false,
    saveUninitialized: false,
  })
);
app.use(winstonLogger);

initializePassport();
app.use(passport.initialize());

app.engine("handlebars", handlebars.engine());

app.set("views", process.cwd() + "/src/views");
app.set("view engine", "handlebars");

router(app);
mongoConnect();

module.exports = app;
