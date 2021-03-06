const passport = require("passport");
const User = require("../../models/User.model");
const FacebookStrategy = require("passport-facebook").Strategy;

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "https://plant-app-test.herokuapp.com/auth/success/facebook",
      profileFields: ["emails", "name", "picture.type(large)"],
    },
    async function (accessToken, refreshToken, profile, done) {
      const { email } = profile._json;
      const { name, photos, provider } = profile;
      await User.findOne({ email: email }).then(async (user) => {
        if (!user) {
          if (!photos) {
            const user = await User.create({
              provider,
              username: name.givenName,
              firstName: name.givenName,
              lastName: name.familyName,
              email,
            });
            done(null, user);
          } else {
            const user = await User.create({
              provider,
              username: name.givenName,
              firstName: name.givenName,
              lastName: name.familyName,
              email,
              avatar: photos[0].value,
            });
            done(null, user);
          }
        } else {
          done(null, user);
        }
      });
    }
  )
);
