const Carts = require("../../models/carts.model");

class cartDao {

  async getCarts() {
    return await Carts.find();
  }

  async getCartById(id) {
    return await Carts.findOne({_id:id});
  } 

  async addCart() {
    try {
      
      const carritoVacio = new Carts({
        products: []
      });

    
     return await Carts.create(carritoVacio);

      
    } catch (error) {
      console.error(error);
      throw new Error('Error al crear el carrito');
    }
  }

  async addProductToCart(cartId, productId, quantity) {
    try {
      // Buscar el carrito por ID
      const cart = await Carts.findOne({ _id: cartId });

      if (!cart) {
        throw new Error('Carrito no encontrado');
      }

      // Verificar si el producto ya existe en el carrito
      const existingProductIndex = cart.products.findIndex(product => product.id === productId);

      if (existingProductIndex !== -1) {
        // Si el producto ya existe, incrementar la cantidad
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        // Si el producto no existe, agregarlo al carrito
        cart.products.push({
          id: productId,
          quantity: quantity
        });
      }

      // Guardar el carrito actualizado en la base de datos
      await cart.save();

    } catch (error) {
      console.error(error);
      throw new Error('Error al agregar el producto al carrito');
    }
  }
}

module.exports = cartDao;