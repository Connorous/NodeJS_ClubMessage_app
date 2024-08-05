const User = require("../models/user");
const passport = require("../appPassport");
const bcrypt = require("bcryptjs");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all users.
exports.list_users = asyncHandler(async (req, res, next) => {
  const allUsers = await User.find({}, "email displayname member admin")
    .sort({ email: 1 })
    .exec();
  res.render("user_list", {
    title: "All Users",
    user_list: allUsers,
  });
});

// Display user login form on GET.
exports.login_get = asyncHandler(async (req, res, next) => {
  res.render("user_form", { title: "Log In", user: res.locals.currentUser });
});

// Display user create form on GET.
exports.register_get = asyncHandler(async (req, res, next) => {
  res.render("user_form", { title: "Register" });
});

// Handle user create on POST.
exports.register_post = [
  // Validate and sanitize fields.
  body("email", "Email must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("displayname", "Displayname must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("password", "password must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("confirmpassowrd", "confirm password must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("confirmpassowrd", "Both passwords must match").custom(
    (value, { req }) => {
      return value === req.body.password;
    }
  ),

  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      res.render("user_form", {
        title: "Register",
        errors: errors.array(),
      });
    } else {
      // Data from form is valid.
      // Check if User with same email or displayname already exists.
      const emailExists = await User.findOne({
        email: req.body.email,
      })
        .collation({ locale: "en", strength: 2 })
        .exec();
      const displayNameExists = await User.findOne({
        displayname: req.body.displayname,
      })
        .collation({ locale: "en", strength: 2 })
        .exec();
      if (emailExists) {
        // User exists, redisplay form
        res.render("user_form", {
          title: "Register",
          message: "User with the email provided already exists",
        });
      } else if (displayNameExists) {
        // User exists, redisplay form
        res.render("user_form", {
          title: "Register",
          message: "User with the display name provided already exists",
        });
      } else {
        // Create a User object with escaped and trimmed data. Encrypting the user's password
        try {
          var password = req.body.password;
          bcrypt.hash(password, 10, async (err, hashedPassword) => {
            // if err, do something
            // otherwise, store hashedPassword in DB

            const user = new User({
              email: req.body.email,
              displayname: req.body.displayname,
              password: hashedPassword,
              admin: false,
              member: false,
            });
            const newUser = await user.save();
            res.redirect("/");
          });
        } catch (err) {
          return next(err);
        }
      }
    }
  }),
];

// Display user create form on GET.
exports.new_user_get = asyncHandler(async (req, res, next) => {
  res.render("new_user_form", { title: "Create New User", admin: true });
});

// Handle user create on POST.
exports.new_user_post = [
  // Validate and sanitize fields.
  body("email", "Email must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("displayname", "Displayname must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("password", "password must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("confirmpassowrd", "Both passwords must match")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("confirmpassowrd").custom((value, { req }) => {
    return value === req.body.password;
  }),

  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      res.render("new_user_form", {
        title: "Create New User",
        errors: errors.array(),
      });
    } else {
      // Data from form is valid.
      // Check if User with same email or displayname already exists.
      const emailExists = await User.findOne({
        email: req.body.email,
      })
        .collation({ locale: "en", strength: 2 })
        .exec();
      const displayNameExists = await User.findOne({
        displayname: req.body.displayname,
      })
        .collation({ locale: "en", strength: 2 })
        .exec();
      if (emailExists) {
        // User exists, redisplay form
        res.render("new_user_form", {
          title: "Create New User",
          message: "User with the email provided already exists",
          admin: true,
        });
      } else if (displayNameExists) {
        // User exists, redisplay form
        res.render("new_user_form", {
          title: "Create New User",
          message: "User with the display name provided already exists",
          admin: true,
        });
      } else {
        // Create a User object with escaped and trimmed data. Encrypting the user's password
        try {
          var password = req.body.password;
          bcrypt.hash(password, 10, async (err, hashedPassword) => {
            // if err, do something
            // otherwise, store hashedPassword in DB

            const user = new User({
              email: req.body.email,
              displayname: req.body.displayname,
              password: hashedPassword,
              admin: Boolean(req.body.admin),
              member: Boolean(req.body.member),
            });
            const newUser = await user.save();
            res.redirect("/users");
          });
        } catch (err) {
          return next(err);
        }
      }
    }
  }),
];

// Display user delete form on GET.
exports.user_delete_get = asyncHandler(async (req, res, next) => {
  // Get user
  var user = await User.findById(req.params.id).exec();
  console.log(user);
  if (user === null) {
    // No results.
    const err = new Error("User not found");
    err.status = 404;
    return next(err);
  }

  res.render("user_delete", {
    title: "Delete User",
    user: user,
    adminuser: res.locals.currentUser,
  });
});

// Handle user delete on POST.
exports.user_delete_post = asyncHandler(async (req, res, next) => {
  //delete user from database
  await User.findByIdAndDelete(req.params.id);
  res.redirect("/users");
});

// Display item update form on GET.
exports.user_edit_get = asyncHandler(async (req, res, next) => {
  var user = await User.findById(req.params.id).exec();

  if (user === null) {
    // No results.
    const err = new Error("User not found");
    err.status = 404;
    return next(err);
  }

  res.render("user_edit", {
    title: "Edit User Privileges",
    user: user,
  });
});

// Handle item update on POST.
exports.user_edit_post = asyncHandler(async (req, res, next) => {
  // Extract the validation errors from a request.
  const errors = validationResult(req);
  //get user original user
  const userBefore = await User.findById(req.params.id);
  //if user exists continue
  if (userBefore) {
    // Create a User object with escaped and trimmed data.
    const user = new User({
      _id: userBefore._id,
      email: userBefore.email,
      displayname: userBefore.displayname,
      password: userBefore.password,
      admin: Boolean(req.body.admin),
      member: Boolean(req.body.member),
    });
    //Update the record.
    const editedUser = await User.findByIdAndUpdate(req.params.id, user, {});
    // Redirect to users page.
    res.redirect("/users");
  }
  // redirect to users list
  else {
    res.redirect("/users");
  }
});
