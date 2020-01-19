const passport = require("passport");

module.exports = function passportConfig(app, db) {
  require("./strategies/google.strategy")(db);
  require("./strategies/local.strategy")(db);

  app.use(passport.initialize());
  app.use(passport.session());

  //store the user in session
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  //retrieves user from the session
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};
