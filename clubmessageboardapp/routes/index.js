var express = require("express");
var router = express.Router();

const post_controller = require("../controllers/postcontroller");

var authorizor = require("./authMiddleware");

/* GET home page. */
router.get("/", post_controller.post_list);

router.get(
  "/create-post",
  authorizor.isMember,
  post_controller.post_create_get
);

router.post(
  "/create-post",
  authorizor.isMember,
  post_controller.post_create_post
);

router.get(
  "/delete-post/:id",
  authorizor.isMember,
  post_controller.post_delete_get
);

router.post(
  "/delete-post/:id",
  authorizor.isMember,
  post_controller.post_delete_post
);

module.exports = router;
