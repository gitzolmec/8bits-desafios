const productController = require("../controllers/products.controller.js");
const cartController = require("../controllers/carts.controller.js");

const router = (app) => {
  app.use("/api/products", productController);

  app.use("/api/carts", cartController);
};

module.exports = router;
