function authMiddleware(req, res, next) {
  if (req.session.user) return next();

  res.redirect("/api/login");
}

module.exports = authMiddleware;
