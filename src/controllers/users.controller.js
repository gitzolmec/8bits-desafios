const { Router } = require("express");
const Users = require("../models/users.model");
const adminAuthMiddleware = require("../middlewares/admin-validation.middleware");
const router = Router();
const passport = require("passport");
const passportCall = require("../utils/passport-call.util");
const {
  getUserById,
  getPurchases,
  getUserListForAdmins,
} = require("../services/users.service");
const totalQuantity = require("../utils/total-quantity.util");
const UserResponseDto = require("../DTO/user-info");
const adminValidation = require("../utils/admin-validation.util");

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
      const tokenid = req.user.id;
      const userInfo = await getUserById(tokenid);
      const userInfoDto = new UserResponseDto(userInfo);
      const list = await getUserListForAdmins();

      res.render("users-list.handlebars", { list, userInfoDto });
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
    const userInfo = await getUserById(tokenid);
    const userInfoDto = new UserResponseDto(userInfo);
    const totalProducts = await totalQuantity(userInfoDto.cartId);
    const userValidation = adminValidation(userInfoDto.role);

    res.render("user-detail.handlebars", {
      userInfoDto,
      userValidation,
      totalProducts,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "error", message: "Not Found" });
  }
});

router.get("/purchaseHistory", passportCall("jwt"), async (req, res) => {
  try {
    const purchaseHistory = await getPurchases(req);

    res.render("purchase-history.handlebars", { purchaseHistory });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "error", message: "Not Found" });
  }
});
module.exports = router;
