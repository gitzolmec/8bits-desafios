const ProductDAO = require("../DAO/Mongo/product-dao.mongo");
const { logger } = require("../middlewares/logger.middleware");
const totalQuantity = require("../utils/total-quantity.util");
const { getUserById } = require("./users.service");

const Products = new ProductDAO();

const getAllProducts = async (req) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
    const sort = req.query.sort || 1;
    const page = req.query.page ? parseInt(req.query.page) : 1;
    const category = req.query.category || "";
    const products = await Products.getProducts(limit, page, sort, category);
    const paginationInfo = products[products.length - 1];
    const Pages = paginationInfo.totalPages;
    // Acceder a las propiedades de paginación
    const totalPages = paginationInfo.totalPages;
    const pages = paginationInfo.page;
    const hasPrevPage = paginationInfo.hasPrevPage;
    const hasNextPage = paginationInfo.hasNextPage;
    const prevPage = paginationInfo.prevPage;
    const nextPage = paginationInfo.nextPage;
    const pLimit = paginationInfo.limit;
    let pSort = 0;
    if (sort == 1) {
      pSort = "asc";
    } else {
      pSort = "desc";
    }
    return {
      products,
      totalPages,
      pages,
      hasPrevPage,
      hasNextPage,
      prevPage,
      nextPage,
      pLimit,
      pSort,
    };
  } catch (error) {
    logger.fatal(error);
  }
};

const addProduct = async (productInfo) => {
  return await Products.addProduct(productInfo);
};
const getProductById = async (id) => {
  return await Products.getProductById(id);
};

const updateProduct = async (id, productInfo) => {
  return await Products.updateProduct(id, productInfo);
};
const getClientInfo = async (req) => {
  try {
    const tokenid = req.user.id;
    if (!tokenid) {
      return res.redirect("/login");
    }

    const userInfo = await getUserById(tokenid);
    const cartId = userInfo.cartId;
    const totalProducts = await totalQuantity(cartId);

    const { first_name, last_name, role } = userInfo;
    let adminValidation = "";
    if (role == "admin") {
      adminValidation = "admin";
    }

    return {
      first_name,
      last_name,
      role,
      adminValidation,
      totalProducts,
      cartId,
    };
  } catch (error) {
    logger.error(error);
  }
};

const deleteProduct = async (id) => {
  return await Products.deleteProduct(id);
};

module.exports = {
  getAllProducts,
  getProductById,
  getClientInfo,
  updateProduct,
  deleteProduct,
  addProduct,
};
