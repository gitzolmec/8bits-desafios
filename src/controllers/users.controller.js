const { Router } = require("express");
const Users = require("../models/users.model");
const adminAuthMiddleware = require("../middlewares/admin-validation.middleware");
const router = Router();

router.post("/", async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    const newUserInfo = {
      first_name,
      last_name,
      email,
      password,
    };
    const redirectURL = "/api/login";
    const user = await Users.create(newUserInfo);

    res.json({ status: "success", message: user, redirectURL });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ status: "success", message: "Internal Server Error" });
  }
});

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

module.exports = router;
