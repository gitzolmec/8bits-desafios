function adminAuthMiddleware(req, res, next) {
  const { user } = req.session;
  const { role } = user;
  if (role === "admin") {
    console.log(role);
    return next();
  }
  res.redirect("/api/error-401");
}

module.exports = adminAuthMiddleware;
