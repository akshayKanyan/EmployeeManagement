const passport = require("passport");
const debug = require("debug")("app:google-strategy");
const chalk = require("chalk");
const { Strategy } = require("passport-google-oauth20");
const { clientID, clientSecret } = require("../keys");

module.exports = function localStrategy(db) {
  passport.use(
    new Strategy(
      {
        clientID,
        clientSecret,
        callbackURL: "/auth/google/callback"
      },
      (accessToken, refreshToken, profile, done) => {
        try {
          (async function mongo() {
            const collection = await db.collection("user");
            let user;
            const userAdded = await collection.updateOne(
              {
                googleId: profile.id
              },
              {
                $set: { googleId: profile.id }
              },
              { upsert: true }
            );
            if (userAdded) {
              user = await collection.findOne({ googleId: profile.id });
            }
            if (user && user.googleId) {
              done(null, user);
            } else {
              done(null, false);
            }
          })();
        } catch (err) {
          debug(chalk.red(err));
          done(null, false);
        }
      }
    )
  );
};
