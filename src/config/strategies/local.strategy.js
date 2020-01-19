const passport = require("passport");
const debug = require("debug")("app:local-strategy");
const { Strategy } = require("passport-local");

module.exports = function localStrategy(db) {
  passport.use(
    new Strategy(
      {
        usernameField: "username",
        passwordField: "password"
      },
      (username, password, done) => {
        (async function mongo() {
          const collection = await db.collection("user");
          const user = await collection.findOne({ username });
          if (user && user.password === password) {
            done(null, user);
          } else {
            done(null, false);
          }
        })();
      }
    )
  );
};
