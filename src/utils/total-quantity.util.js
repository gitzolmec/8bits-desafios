const { logger } = require("../middlewares/logger.middleware");
const Carts = require("../models/carts.model");
async function totalQuantity(cartId) {
  try {
    const cart = await Carts.findOne({ _id: cartId });
    if (!cart) {
      logger.warn("Carrito no encontrado");
      throw new Error("Carrito no encontrado");
    }
    const currentCart = cart.products;
    let quantity = 0;

    currentCart.forEach((product) => {
      quantity += product.quantity;
    });

    return quantity;
  } catch (err) {
    logger.error(err);
  }
  return 0; //
}
module.exports = totalQuantity;
