const { Router } = require("express");
const Users = require("../models/users.model");
const adminAuthMiddleware = require("../middlewares/admin-validation.middleware");
const router = Router();
const passport = require("passport");
const passportCall = require("../utils/passport-call.util");
const { getUserById, getPurchases } = require("../services/users.service");
const totalQuantity = require("../utils/total-quantity.util");
const UserResponseDto = require("../DTO/user-info");

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
    console.log("llegamos");
    const tokenid = req.user.id;

    const userInfo = await getUserById(tokenid);
    const { role, cartId } = userInfo;
    const totalProducts = await totalQuantity(cartId);

    let adminValidation = "";
    if (role == "admin") {
      adminValidation = "admin";
    }
    const userInfoDto = new UserResponseDto(userInfo);
    console.log(userInfoDto);
    res.render("user-detail.handlebars", {
      userInfoDto,
      role,
      adminValidation,
      totalProducts,
      cartId,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "error", message: "Not Found" });
  }
});

router.get("/purchaseHistory", passportCall("jwt"), async (req, res) => {
  try {
    const purchaseHistory = await getPurchases(req);
    const details = purchaseHistory.map((item) => item.details);

    purchaseHistory.forEach((item) => {
      item.details = item.details.map((detail) => detail.title);
    });
    console.log(purchaseHistory);
    res.render("purchase-history.handlebars", { purchaseHistory });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "error", message: "Not Found" });
  }
});
module.exports = router;
