const { Router } = require("express");
const Users = require("../models/users.model");
const passport = require("passport");
const router = Router();
const {
  useValidPassword,
  createHash,
} = require("../utils/crypt.password.util");
const { generateToken } = require("../utils/jwt.util");
const passportCall = require("../utils/passport-call.util.js");

router.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/auth/fail-login" }),
  async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email: email });
      const token = generateToken({ id: user._id, role: user.role });

      const redirectURL = "/api/products";
      const ms = require("ms");

      // Duración de 1 hora
      const horaEnMilisegundos = ms("1h");
      res
        .cookie("authToken", token, {
          maxAge: horaEnMilisegundos,
          httpOnly: true,
        })
        .status(200)
        .json({
          message: "Login successful",
          user: token,
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
    res.clearCookie("authToken").redirect("/api/login");
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
  passport.authenticate("github", {
    failureRedirect: "/login",
  }),
  async (req, res) => {
    const token = generateToken({ id: req.user._id, role: req.user.role });
    const ms = require("ms");

    // Duración de 1 hora
    const horaEnMilisegundos = ms("1h");
    res
      .cookie("authToken", token, {
        maxAge: horaEnMilisegundos,
        httpOnly: true,
      })
      .redirect("/api/products");
  }
);

module.exports = router;
