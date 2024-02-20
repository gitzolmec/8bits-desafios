const { Router } = require("express");
const adminAuthMiddleware = require("../middlewares/admin-validation.middleware");
const authMiddleware = require("../middlewares/auth.middleware");
const router = Router();

router.get("/login", (req, res) => {
  res.render("login.handlebars");
});

router.get("/signup", (req, res) => {
  res.render("signup.handlebars");
});

router.get("/error-401", (req, res) => {
  console.log("Error 401");
  res.render("unauthorized-page.handlebars");
});

module.exports = router;
