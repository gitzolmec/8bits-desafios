const productController = require("../controllers/products.controller.js");
const cartController = require("../controllers/carts.controller.js");
const chatController = require("../controllers/chat.controller.js")

const router = (app) => {
  app.use("/api/products", productController);
  app.use("/api/carts", cartController);
  app.use("/api/chat", chatController);
};

module.exports = router;
