const Post = require("../models/post");
const asyncHandler = require("express-async-handler");

const { body, validationResult } = require("express-validator");

// Display list of all posts.
exports.post_list = asyncHandler(async (req, res, next) => {
  const allPosts = await Post.find({}, "message date")
    .sort({ date: 1 })
    .populate("author")
    .exec();

  res.render("post_list", {
    title: "Club Message Board App",
    post_list: allPosts,
    user: res.locals.currentUser,
  });
});

// Display post create form on GET.
exports.post_create_get = asyncHandler(async (req, res, next) => {
  res.render("post_form", {
    title: "Create Post",
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
    // Create a Post object with escaped and trimmed data.
    const post = new Post({
      message: req.body.message,
      date: Date.now(),
      author: req.user,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      res.render("post_form", {
        title: "Create Post",
        errors: errors.array(),
      });
    } else {
      // Data from form is valid.

      await post.save();
      // New Post saved. Redirect to home page with posts

      res.redirect("/");
    }
  }),
];

// Display post delete form on GET.
exports.post_delete_get = asyncHandler(async (req, res, next) => {
  // Get item
  const post = await Post.findById(req.params.id).populate("author").exec();

  if (post === null) {
    // No results.
    const err = new Error("Post not found");
    err.status = 404;
    return next(err);
  }

  res.render("post_delete", {
    title: "Delete Post",
    post: post,
    user: res.locals.currentUser,
  });
});

// Handle post delete on POST.
exports.post_delete_post = asyncHandler(async (req, res, next) => {
  const postToDelete = await Post.findById(req.params.id)
    .populate("author")
    .exec();
  if (
    res.locals.currentUser.email === postToDelete.author.email ||
    res.locals.currentUser.admin === true
  ) {
    //delete post from database
    await Post.findByIdAndDelete(postToDelete._id);
    res.redirect("/");
  } else {
    res.render("post_delete", {
      title: "Delete Post",
      message: "You do not have the privileges to delete this post",
      post: postToDelete,
    });
  }
});
