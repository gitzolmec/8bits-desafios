
const Products = require("../../models/products.model");

class ProductDAO {
  async getProducts(limit) {
    try {
      let query = Products.find({ status: true }).lean();
  
      if (limit) {
        query = query.limit(limit);
      }
  
      const products = await query.exec();
      console.log('productos cargados desde mongo');
      return products;
    } catch (error) {
      throw error;
    }
  }

  async getProductById(id) {
    return await Products.findOne({_id: id});
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
module.exports = ProductDAO

