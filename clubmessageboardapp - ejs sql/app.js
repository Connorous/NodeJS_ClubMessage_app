var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const compression = require("compression");
const helmet = require("helmet");
require("dotenv").config();

const session = require("express-session");
const passport = require("./appPassport");

const bodyParser = require("body-parser");

var indexRouter = require("./routes/index");
var userRouter = require("./routes/users");

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  })
);

// Set up rate limiter: maximum of twenty requests per minute
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100,
});
// Apply rate limiter to all requests
app.use(limiter);

app.use(compression());

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
  })
);
app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  //console.log(res.locals.currentUser);
  next();
});

// view engine setup
app.engine("ejs", require("express-ejs-extend"));
app.set("views", path.join(__dirname, "views"));
app.set("layout", "./views.layout");
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

const mongoDBUrl = process.env.MONGODB_URI;

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

app.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

app.use("/", indexRouter);
app.use("/", userRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
