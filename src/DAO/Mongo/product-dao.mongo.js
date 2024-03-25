const { logger } = require("../../middlewares/logger.middleware");
const Products = require("../../models/products.model");
const mongoosePaginate = require("mongoose-paginate-v2");

class ProductDAO {
  async getProducts(limit, qpage, sort, category) {
    try {
      limit = limit ? limit : 6;
      sort = sort ? sort : "asc";
      qpage = qpage ? qpage : 1;
      category = category ? category : "";

      const options = {
        sort: { price: sort },
        limit: limit,
        page: qpage,
        lean: true,
      };
      const query = category ? { status: true, category } : { status: true };

      const {
        docs,
        totalPages,
        page,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
      } = await Products.paginate(query, options);
      let parameters = { limit: limit, sort: sort };
      let products = docs;
      let productObj = {
        totalPages,
        page,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
        ...parameters,
      };
      products.push(productObj);

      return products;
    } catch (error) {
      logger.error("Error al obtener los productos desde MongoDB");

      throw error;
    }
  }

  async getProductById(id) {
    try {
      const product = await Products.findOne({ _id: id });

      return product;
    } catch (error) {
      logger.error("Error al obtener el producto desde MongoDB: ", error);
    }
  }

  async addProduct(productInfo) {
    return await Products.create(productInfo);
  }

  async updateProduct(id, productInfo) {
    return await Products.updateOne({ _id: id }, productInfo);
  }

  async deleteProduct(id) {
    return await Products.updateOne({ _id: id }, { $set: { status: false } });
  }
}
module.exports = ProductDAO;
