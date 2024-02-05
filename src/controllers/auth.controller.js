const { Router } = require("express");
const Users = require("../models/users.model");
const passport = require("passport");
const router = Router();
const {
  useValidPassword,
  createHash,
} = require("../utils/crypt.password.util");

router.post(
  "/",
  passport.authenticate("login", { failureRedirect: "/auth/fail-login" }),
  async (req, res) => {
    try {
      req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        role: req.user.role,
      };

      const redirectURL = "/api/products";
      res.status(200).json({
        message: "Login successful",
        user: req.session.user,
        redirectURL,
      });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ status: "error", message: "Internal Server Error" });
    }
  }
);

router.get("/fail-login", (req, res) => {
  res.json({ status: "error", error: "Login failed" });
});

router.get("/logout", (req, res) => {
  console.log("logout");
  try {
    req.session.destroy((err) => {
      if (err) {
        console.log("err");
        console.log(err);
        return res.json({ error: err });
      }
      console.log("redirect");
      res.redirect("/api/login");
    });
  } catch (error) {
    console.error("Error al destruir la sesión:", error);
    res.json({ error: "Error al destruir la sesión" });
  }
});

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user: email"] }, (req, res) => {})
);

router.get(
  "/githubcallback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  (req, res) => {
    req.session.user = req.user;
    res.redirect("/api/products");
  }
);

module.exports = router;
