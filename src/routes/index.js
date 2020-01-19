const express = require("express");
const router = express.Router();
function Routes(app, db) {
  const homePageRoutes = require("./homePageRoute")({ db });
  const authRoute = require("./authRoute")({ db });
  app.use("/home", homePageRoutes);
  app.use("/auth", authRoute);
}
module.exports = Routes;
