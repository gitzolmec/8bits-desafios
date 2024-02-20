const express = require("express");
const router = require("./router/index");
const app = express();
const handlebars = require("express-handlebars");
const mongoConnect = require("./db");
const cookieParser = require("cookie-parser");
const session = require("express-session");

const MongoStore = require("connect-mongo");
const { dbUser, dbPassword, dbHost, dbName } = require("./configs/db.config");
const initializePassport = require("./configs/passport.config");
const passport = require("passport");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(process.cwd() + "/public"));
app.use(
  session({
    secret: "8-bits",

    resave: false,
    saveUninitialized: false,
  })
);

initializePassport();
app.use(passport.initialize());

app.engine("handlebars", handlebars.engine());

app.set("view engine", process.cwd() + "/views");
app.set("view engine", "handlebars");

router(app);
mongoConnect();

module.exports = app;
