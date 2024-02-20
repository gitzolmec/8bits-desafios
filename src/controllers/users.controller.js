const { Router } = require("express");
const Users = require("../models/users.model");
const adminAuthMiddleware = require("../middlewares/admin-validation.middleware");
const router = Router();
const passport = require("passport");
const passportCall = require("../utils/passport-call.util");

router.post(
  "/",
  passport.authenticate("register", {
    failureRedirect: "/users/fail-register",
  }),
  async (req, res) => {
    try {
      const redirectURL = "/api/login";

      res.json({ status: "success", redirectURL });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ status: "success", message: "Internal Server Error" });
    }
  }
);

router.get(
  "/list",

  passportCall("jwt"),
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const list = [];
      const user = await Users.find({}, { __v: 0 });
      user.forEach((users) => {
        const first_name = users.first_name;
        const last_name = users.last_name;
        const email = users.email;
        const role = users.role;
        list.push({ first_name, last_name, email, role });
      });

      res.render("users-list.handlebars", { list });
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ status: "error", message: "Internal Server Error" });
    }
  }
);

router.get("/fail-register", (req, res) => {
  console.log("Falló registro");
  res.status(400).json({ status: "error", error: "Bad request" });
});

router.get("/current", passportCall("jwt"), async (req, res) => {
  try {
    const tokenid = req.user.id;

    const userInfo = await user.getUserById(tokenid);
    const { first_name, last_name, age, email, role } = userInfo;
    console.log(first_name);
    res.render("user-detail.handlebars", {
      first_name,
      last_name,
      age,
      email,
      role,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "error", message: "Not Found" });
  }
});
module.exports = router;
