const express = require("express");
const chalk = require("chalk");
const debug = require("debug")("app");
const morgan = require("morgan");
const path = require("path");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const { MongoClient } = require("mongodb");

const app = express();
const mongoURL = "mongodb://localhost:27017";
const PORT = process.env.PORT || 3001;

MongoClient.connect(mongoURL, (err, client) => {
  if (err) {
    debug(chalk.red(err));
  } else {
    const db = client.db("employeeDB");

    //middleware
    app.use(morgan("tiny"));
    app.use((req, res, next) => {
      res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
      next();
    });

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(session({ secret: "employeesManagement@" }));
    require("./src/config/passport.js")(app, db);
    app.use(express.static(path.join(__dirname, "public")));
    app.use(
      "/css",
      express.static(path.join(__dirname, "/node_modules/bootstrap/dist/css"))
    );
    app.use(
      "/js",
      express.static(path.join(__dirname, "/node_modules/bootstrap/dist/js"))
    );
    app.use(
      "/js",
      express.static(path.join(__dirname, "/node_modules/jquery/dist"))
    );
    app.use(function(req, res, next) {
      if (!req.user)
        res.header(
          "Cache-Control",
          "private, no-cache, no-store, must-revalidate"
        );
      next();
    });

    //routes
    app.all("/", function(req, res) {
      res.redirect("/home");
    });
    require("./src/routes")(app, db);

    app.set("views", "./src/views");
    app.set("view engine", "ejs");

    app.listen(PORT, () => {
      debug(`listening on port ${chalk.green(PORT)}`);
    });
  }
});
