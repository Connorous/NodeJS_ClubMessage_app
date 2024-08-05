var express = require("express");
var router = express.Router();

const user_controller = require("../controllers/usercontroller");

var authorizor = require("./authMiddleware");

router.get("/login", user_controller.login_get);

router.get("/register", user_controller.register_get);

router.post("/register", user_controller.register_post);

router.get(
  "/create-user",
  authorizor.isAdmin,
  authorizor.isAdmin,
  user_controller.new_user_get
);

router.post("/create-user", authorizor.isAdmin, user_controller.new_user_post);

router.get("/users", authorizor.isAdmin, user_controller.list_users);

router.get(
  "/edit-user-privileges/:id",
  authorizor.isAdmin,
  user_controller.user_edit_get
);

router.post(
  "/edit-user-privileges/:id",
  authorizor.isAdmin,
  user_controller.user_edit_post
);

router.get(
  "/delete-user/:id",
  authorizor.isAdmin,
  user_controller.user_delete_get
);

router.post(
  "/delete-user/:id",
  authorizor.isAdmin,
  user_controller.user_delete_post
);

module.exports = router;
