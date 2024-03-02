const ProductDAO = require("../DAO/Mongo/product-dao.mongo");

const Products = new ProductDAO();

const getAllProducts = async (limit, page, sort, category) => {
  return await Products.getProducts(limit, page, sort, category);
};

module.exports = { getAllProducts };
