const { Router } = require("express");
const Users = require("../models/users.model");
const adminAuthMiddleware = require("../middlewares/admin-validation.middleware");
const router = Router();
const passport = require("passport");

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

router.get("/list", adminAuthMiddleware, async (req, res) => {
  try {
    const list = [];
    const user = await Users.find({}, { __v: 0 });
    user.forEach((element) => {
      const first_name = element.first_name;
      const last_name = element.last_name;
      const email = element.email;
      const role = element.role;
      list.push({ first_name, last_name, email, role });
    });
    console.log(list);
    res.render("users-list.handlebars", { list });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "success", message: "Internal Server Error" });
  }
});

router.get("/fail-register", (req, res) => {
  console.log("Falló registro");
  res.status(400).json({ status: "error", error: "Bad request" });
});
module.exports = router;
