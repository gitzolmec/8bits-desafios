const Carts = require("../models/carts.model");
async function totalQuantity(cartId) {
  try {
    const cart = await Carts.findOne({ _id: cartId });
    if (!cart) {
      throw new Error("Carrito no encontrado");
    }
    const currentCart = cart.products;
    let quantity = 0;

    currentCart.forEach((product) => {
      quantity += product.quantity;
    });

    return quantity;
  } catch (err) {
    console.log(err);
  }
  return 0; // Default value if cart is not found or has no products.
}
module.exports = totalQuantity;
