const passport = require("../appPassport");
const bcrypt = require("bcryptjs");
const postgresconnection = require("../postgresDB");

const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");

// Display list of all users.
exports.list_users = asyncHandler(async (req, res, next) => {
  const { rows } = await postgresconnection.query("SELECT * FROM public.users");
  const allUsers = [];
  for (var i = 0; i < rows.length; i++) {
    allUsers.push({
      id: rows[i].id,
      email: rows[i].email,
      displayname: rows[i].displayname,
      password: rows[i].password,
      admin: rows[i].admin,
      member: rows[i].member,
    });
  }
  res.render("user_list", {
    title: "All Users",
    user_list: allUsers,
  });
});

// Display user login form on GET.
exports.login_get = asyncHandler(async (req, res, next) => {
  res.render("user_form", {
    title: "Log In",
    errors: false,
    message: null,
  });
});

// Display user create form on GET.
exports.register_get = asyncHandler(async (req, res, next) => {
  res.render("user_form", { title: "Register", errors: false, message: null });
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
  body("confirmpassword", "confirm password must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("confirmpassword", "Both passwords must match").custom(
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
        message: null,
      });
    } else {
      // Data from form is valid.
      // Check if User with same email or displayname already exists.
      const emailExists = await postgresconnection.query(
        `SELECT EXISTS (Select 1 FROM public.users WHERE 'email' = ($1)) AS user_exists `,
        [req.body.email]
      );
      const displayNameExists = await postgresconnection.query(
        `SELECT EXISTS (Select 1 FROM public.users WHERE 'displayname' = ($1)) AS user_exists `,
        [req.body.displayname]
      );
      if (emailExists.user_exists) {
        // User exists, redisplay form
        res.render("user_form", {
          title: "Register",
          message: "User with the email provided already exists",
        });
      } else if (displayNameExists.user_exists) {
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
            const newUser = await postgresconnection.query(
              `INSERT INTO public.users(email, displayname, password, admin, member) VALUES ($1, $2, $3, $4, $5)`,
              [
                req.body.email,
                req.body.displayname,
                hashedPassword,
                false,
                false,
              ]
            );

            res.redirect("/");
          });
        } catch (err) {
          console.log(err);
          return next(err);
        }
      }
    }
  }),
];

// Display user create form on GET.
exports.new_user_get = asyncHandler(async (req, res, next) => {
  res.render("new_user_form", {
    title: "Create New User",
    admin: true,
    errors: false,
    message: null,
  });
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
      const emailExists = await postgresconnection.query(
        `SELECT EXISTS (Select 1 FROM public.users WHERE 'email' = ($1)) AS user_exists `,
        [req.body.email]
      );
      const displayNameExists = await postgresconnection.query(
        `SELECT EXISTS (Select 1 FROM public.users WHERE 'displayname' = ($1)) AS user_exists `,
        [req.body.displayname]
      );
      if (emailExists.user_exists) {
        // User exists, redisplay form
        res.render("new_user_form", {
          title: "Create New User",
          message: "User with the email provided already exists",
        });
      } else if (displayNameExists.user_exists) {
        // User exists, redisplay form
        res.render("new_user_form", {
          title: "Create New User",
          message: "User with the display name provided already exists",
        });
      } else {
        // Create a User object with escaped and trimmed data. Encrypting the user's password
        try {
          var password = req.body.password;
          bcrypt.hash(password, 10, async (err, hashedPassword) => {
            // if err, do something
            // otherwise, store hashedPassword in DB

            const newUser = await postgresconnection.query(
              `INSERT INTO public.users(email, displayname, password, admin, member) VALUES ($1, $2, $3, $4, $5)`,
              [
                req.body.email,
                req.body.displayname,
                hashedPassword,
                Boolean(req.body.admin),
                Boolean(req.body.member),
              ]
            );
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

  const { rows } = await postgresconnection.query(
    `Select * FROM public.users WHERE id = ($1)`,
    [req.params.id]
  );
  const user = rows[0];

  if (!user) {
    // No results.
    const err = new Error("User not found");
    err.status = 404;
    return next(err);
  }

  res.render("user_delete", {
    title: "Delete User",
    user: user,
    adminuser: res.locals.currentUser,
    errors: false,
  });
});

// Handle user delete on POST.
exports.user_delete_post = asyncHandler(async (req, res, next) => {
  //delete user from database
  await postgresconnection.query(`DELETE FROM public.users WHERE id = ($1) `, [
    req.params.id,
  ]);
  res.redirect("/users");
});

// Display item update form on GET.
exports.user_edit_get = asyncHandler(async (req, res, next) => {
  const { rows } = await postgresconnection.query(
    `Select * FROM public.users WHERE id = ($1)`,
    [req.params.id]
  );
  const user = rows[0];
  if (!user) {
    // No results.
    const err = new Error("User not found");
    err.status = 404;
    return next(err);
  }

  res.render("user_edit", {
    title: "Edit User Privileges",
    user: user,
    errors: false,
  });
});

// Handle item update on POST.
exports.user_edit_post = asyncHandler(async (req, res, next) => {
  // Extract the validation errors from a request.
  const errors = validationResult(req);
  //get user original user
  var { rows } = await postgresconnection.query(
    `Select * FROM public.users WHERE id = ($1)`,
    [req.params.id]
  );
  const userBefore = rows[0];
  //if user exists continue
  if (userBefore) {
    //Update the record.
    var updateUser = await postgresconnection.query(
      `UPDATE public.users SET admin=($1), member=($2) WHERE id = ($3)`,
      [Boolean(req.body.admin), Boolean(req.body.member), req.params.id]
    );

    // Redirect to users page.
    res.redirect("/users");
  }
  // redirect to users list
  else {
    res.redirect("/users");
  }
});
