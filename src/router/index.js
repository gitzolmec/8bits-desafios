const productController = require("../controllers/products.controller.js");
const cartController = require("../controllers/carts.controller.js");
const chatController = require("../controllers/chat.controller.js");
const authController = require("../controllers/auth.controller.js");
const usersController = require("../controllers/users.controller.js");
const viewsTemplateController = require("../controllers/views-template.controller");
const testController = require("../test/controller/product-test.controller.js");

const router = (app) => {
  app.use("/api", viewsTemplateController);
  app.use("/api/products", productController);
  app.use("/api/carts", cartController);
  app.use("/api/chat", chatController);
  app.use("/api/auth", authController);
  app.use("/api/users", usersController);
  app.use("/api/test", testController);
};

module.exports = router;
