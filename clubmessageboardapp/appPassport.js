const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user");

const bcrypt = require("bcryptjs");

const appPassport = new passport.Passport();

const strategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  },
  async (email, password, done) => {
    try {
      const user = await User.findOne({ email: email });
      if (!user) {
        return done(null, false, { message: "Incorrect email" });
      }
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
);

appPassport.use("local", strategy);

appPassport.serializeUser((user, done) => {
  done(null, user.id);
});

appPassport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = appPassport;
