const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const postgresconnection = require("./postgresDB");

const bcrypt = require("bcryptjs");

const appPassport = new passport.Passport();

const strategy = new LocalStrategy(
  {
    usernameField: "email",
    passwordField: "password",
  },
  async (email, password, done) => {
    try {
      const { rows } = await postgresconnection.query(
        `Select * FROM public.users WHERE email = ($1)`,
        [email]
      );
      const user = rows[0];
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
    const { rows } = await postgresconnection.query(
      `Select * FROM public.users WHERE id = ($1)`,
      [id]
    );
    const user = rows[0];
    done(null, user);
  } catch (err) {
    done(err);
  }
});

module.exports = appPassport;
