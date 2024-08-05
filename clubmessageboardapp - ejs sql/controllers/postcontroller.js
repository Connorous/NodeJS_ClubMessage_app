const asyncHandler = require("express-async-handler");
const postgresconnection = require("../postgresDB");

const { body, validationResult } = require("express-validator");

// Display list of all posts.
exports.post_list = asyncHandler(async (req, res, next) => {
  const { rows } = await postgresconnection.query("SELECT * FROM public.posts");
  const allPosts = [];
  for (var i = 0; i < rows.length; i++) {
    allPosts.push({
      id: rows[i].id,
      message: rows[i].message,
      date: rows[i].date,
      author: rows[i].author,
    });
  }
  res.render("post_list", {
    title: "Club Message Board App",
    post_list: allPosts,
    user: res.locals.currentUser,
    errors: false,
  });
});

// Display post create form on GET.
exports.post_create_get = asyncHandler(async (req, res, next) => {
  res.render("post_form", {
    title: "Create Post",
    errors: false,
  });
});

// Handle post create on POST.
exports.post_create_post = [
  // Validate and sanitize fields.
  body("message", "Message must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.

  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      res.render("post_form", {
        title: "Create Post",
        errors: errors.array(),
      });
    } else {
      // Data from form is valid.

      // Create a Post object with escaped and trimmed data.
      const newPost = await postgresconnection.query(
        `INSERT INTO public.posts(message, date, author) VALUES ($1, (to_timestamp($2 / 1000.0)), $3)`,
        [req.body.message, Date.now(), req.user.email]
      );

      res.redirect("/");
    }
  }),
];

// Display post delete form on GET.
exports.post_delete_get = asyncHandler(async (req, res, next) => {
  // Get post
  const { rows } = await postgresconnection.query(
    `Select * FROM public.posts WHERE id = ($1)`,
    [req.params.id]
  );
  const post = rows[0];

  if (!post) {
    // No results.
    const err = new Error("Post not found");
    err.status = 404;
    return next(err);
  }

  res.render("post_delete", {
    title: "Delete Post",
    post: post,
    user: res.locals.currentUser,
    errors: false,
  });
});

// Handle post delete on POST.
exports.post_delete_post = asyncHandler(async (req, res, next) => {
  const { rows } = await postgresconnection.query(
    `Select * FROM public.posts WHERE id = ($1)`,
    [req.params.id]
  );
  const postToDelete = rows[0];
  if (
    res.locals.currentUser.email === postToDelete.author ||
    res.locals.currentUser.admin === true
  ) {
    //delete post from database
    await postgresconnection.query(
      `DELETE FROM public.posts WHERE id = ($1) `,
      [req.params.id]
    );
    res.redirect("/");
  } else {
    res.render("post_delete", {
      title: "Delete Post",
      message: "You do not have the privileges to delete this post",
      post: postToDelete,
      errors: false,
    });
  }
});
