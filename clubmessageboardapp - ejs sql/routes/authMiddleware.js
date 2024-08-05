module.exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res
      .status(401)
      .json({ msg: "You are not authorized to access this resource." });
  }
};

module.exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.redirect("/login");
  }
};

module.exports.isMember = (req, res, next) => {
  if (
    req.isAuthenticated() &&
    (req.user.member === true || req.user.admin === true)
  ) {
    next();
  } else {
    res.status(401).json({
      msg: "You are not authorized to access this resource as you are not a member.",
    });
  }
};

module.exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.admin === true) {
    next();
  } else {
    res.status(401).json({
      msg: "You are not authorized to access this resource as you are not an administrator.",
    });
  }
};
