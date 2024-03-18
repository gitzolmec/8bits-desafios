const { Router } = require("express");

const router = Router();
const {
  getAllProducts,
  getProductById,
  getClientInfo,
  updateProduct,
  deleteProduct,
  addProduct,
} = require("../../services/product.service");
const generateProducts = require("../../utils/products-mock.util");
const CustomError = require("../../handlers/errors/custom.error");
const PRODUCT_ERRORS = require("../../handlers/errors/product-error-types");
const {
  productIdNotFound,
} = require("../../handlers/errors/generate-error-info");
const EErrors = require("../../handlers/errors/enum.error");

router.get("/mockingproducts", async (req, res) => {
  try {
    const products = await generateProducts();
    res.json({ message: products });
  } catch (error) {
    console.log(error);
    res.status(400).json({ status: "error", message: "Not Found" });
  }
});

module.exports = router;
