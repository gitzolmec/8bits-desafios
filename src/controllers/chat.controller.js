const { Router } = require("express");
const userAuthMiddleware = require("../middlewares/user-validation.middleware");
const passportCall = require("../utils/passport-call.util");

const router = Router();

router.get("/", passportCall("jwt"), userAuthMiddleware, async (req, res) => {
  res.render("chat.handlebars");
});

module.exports = router;
