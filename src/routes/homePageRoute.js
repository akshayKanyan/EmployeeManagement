const debug = require("debug")("app:homePageRoute");
const chalk = require("chalk");
const express = require("express");
const homePageRouter = express.Router();

function homePageRoute({ router, db }) {
  homePageRouter.use((req, res, next) => {
    if (req.user) {
      next();
    } else {
      res.redirect("/auth/signin");
    }
  });

  homePageRouter
    .route("/")
    .get((req, res) => {
      (async function getEmployeesList() {
        const collection = await db.collection("employees");
        await collection.find().toArray((err, items) => {
          if (err) {
            debug(chalk.red(err));
            res.send("error");
          } else {
            res.render("home", {
              employees: items || [],
              isLoggedIn: req.user,
              filterApplied: false
            });
          }
        });
      })();
    })
    .post((req, res) => {
      (async function filteremployees() {
        const collection = await db.collection("employees");
        let {
          EmpName,
          Location,
          Manager,
          TotalExp,
          Post,
          TechStack,
          isAvailable = false
        } = req.body || {};
        TechStack = TechStack ? TechStack.split(",") : [];
        let query = [];
        if (EmpName) {
          query.push({ EmpName });
        }
        if (Location) {
          query.push({ Location });
        }
        if (Manager) {
          query.push({ Manager });
        }
        if (TotalExp) {
          query.push({ TotalExp: TotalExp - 0 });
        }
        if (Post) {
          query.push({ Post });
        }
        if (TechStack && TechStack.length) {
          query.push({ TechStack: { $in: TechStack } });
        }
        if (isAvailable) {
          query.push({ isAvailable });
        }
        await collection
          .find(
            query.length
              ? {
                  $and: query
                }
              : {}
          )
          .toArray((err, items) => {
            if (err) {
              debug(chalk.red(err));
              res.send("error");
            } else {
              if (query.length) {
                res.render("home", {
                  employees: items || [],
                  isLoggedIn: req.user,
                  filterApplied: query.length
                });
              } else {
                res.redirect("/home");
              }
            }
          });
      })();
    });

  homePageRouter
    .route("/createemployee")
    .get((req, res) => {
      res.render("createEmployee", {
        isLoggedIn: req.user
      });
    })
    .post((req, res) => {
      (async function createEmployee() {
        const collection = await db.collection("employees");
        let {
          EmpName,
          Location,
          Manager,
          TotalExp,
          Post,
          TechStack,
          isAvailable = false
        } = req.body || {};
        TechStack = TechStack.split(",");
        collection.insert(
          [
            {
              EmpName,
              Location,
              Manager,
              TotalExp,
              Post,
              TechStack,
              isAvailable
            }
          ],
          (err, done) => {
            if (err) {
              debug(chalk.red(err));
            } else {
              res.redirect("/home");
            }
          }
        );
      })();
    });

  homePageRouter.route("/filteremployees").post((req, res) => {
    res.redirect(307, "/home");
  });

  return homePageRouter;
}

module.exports = homePageRoute;
