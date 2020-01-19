const debug = require("debug")("app:signup");
const chalk = require("chalk");
const passport = require("passport");
const express = require("express");
const authRouter = express.Router();

function authRoute({ db }) {
  authRouter
    .route("/signup")
    .get((req, res) => {
      res.render("signup", {
        isLoggedIn: req.user
      });
    })
    .post((req, res) => {
      debug(chalk.redBright(JSON.stringify(req.body)));
      let { username, password } = req.body || {};

      (async function addUser() {
        try {
          const collection = await db.collection("user");
          const results = await collection.insertOne({ username, password });
          req.login(results.ops[0], () => {
            res.redirect("/home");
          });
        } catch (err) {
          debug(err);
          res.send("error connecting");
        }
      })();
    });

  authRouter
    .route("/signin")
    .get((req, res) => {
      res.render("signIn", {
        isLoggedIn: req.user
      });
    })
    .post(
      passport.authenticate("local", {
        successRedirect: "/home",
        failureRedirect: "/auth/signin"
      })
    );

  authRouter.route("/logout").get((req, res) => {
    req.logout();
    res.redirect("/auth/signIn");
  });

  authRouter.route("/google").get(
    passport.authenticate("google", {
      scope: ["profile", "email"]
    })
  );
  authRouter
    .route("/google/callback")
    .get(
      passport.authenticate("google", { failureRedirect: "/auth/signIn" }),
      (req, res) => {
        res.redirect("/home");
      }
    );
  return authRouter;
}

module.exports = authRoute;
