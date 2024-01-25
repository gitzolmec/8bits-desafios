const Carts = require("../../models/carts.model");

class cartDao {
  async getCarts() {
    return await Carts.find({}, { __v: 0 }).populate("products.id");
  }

  async getCartById(id) {
    return await Carts.findOne({ _id: id }, { __v: 0 })
      .populate("products.id")
      .lean();
  }

  async addCart() {
    try {
      const carritoVacio = new Carts({
        products: [],
      });

      return await Carts.create(carritoVacio);
    } catch (error) {
      console.error(error);
      throw new Error("Error al crear el carrito");
    }
  }

  async addProductToCart(cartId, productId, quantity) {
    try {
      // Buscar el carrito por ID
      const cart = await Carts.findOne({ _id: cartId });

      if (!cart) {
        throw new Error("Carrito no encontrado");
      }

      // Verificar si el producto ya existe en el carrito
      const existingProductIndex = cart.products.findIndex((product) =>
        product.id.equals(productId)
      );

      if (existingProductIndex === -1) {
        cart.products.push({ id: productId, quantity: quantity });
      } else {
        cart.products[existingProductIndex].quantity += quantity;
      }

      // Guardar el carrito actualizado en la base de datos
      await cart.save();
    } catch (error) {
      console.error(error);
      throw new Error("Error al agregar el producto al carrito");
    }
  }

  async updateCartWithProductList(cartId, productsList) {
    try {
      const cart = await Carts.findOne({ _id: cartId });
      if (!cart) {
        throw new Error("Carrito no encontrado");
      }
      productsList.forEach((product) => {
        const { id, quantity } = product;

        // Busca el índice del producto en el carrito
        const productIndex = cart.products.findIndex((p) => p.id === id);

        if (productIndex !== -1) {
          // Si el producto ya existe, actualiza la cantidad
          cart.products[productIndex].quantity += quantity;
        } else {
          // Si el producto no existe, agrégalo al carrito
          cart.products.push({ id, quantity });
        }
      });
      await cart.save();
    } catch (error) {
      console.error(error);
      throw new Error(
        "Error al actualizar el carrito con la lista de productos"
      );
    }
  }

  async updateProductQuantityInCart(cartId, productId, quantity) {
    try {
      const cart = await Carts.findOne({ _id: cartId });
      if (!cart) {
        throw new Error("Carrito no encontrado");
      }

      // Busca el índice del producto en el carrito
      const productIndex = cart.products.findIndex(
        (p) => p.id._id.toString() === productId
      );

      if (productIndex !== -1) {
        // Si el producto existe, actualiza la cantidad
        cart.products[productIndex].quantity = quantity;
        // Guarda los cambios en el carrito
        await cart.save();
      } else {
        throw new Error("Producto no encontrado en el carrito");
      }
    } catch (error) {
      console.error(error);
      throw new Error(
        "Error al actualizar la cantidad del producto en el carrito"
      );
    }
  }

  async deleteProductFromCart(cartId, productId) {
    try {
      const cart = await Carts.findOne({ _id: cartId }).populate("products.id");
      if (!cart) {
        throw new Error("Carrito no encontrado");
      }
      const productIndex = cart.products.findIndex((product) =>
        product.id.equals(productId)
      );

      if (productIndex === -1) {
        throw new Error("Producto no encontrado en el carrito");
      }
      cart.products.splice(productIndex, 1);
      await cart.save();
      return cart;
    } catch (error) {
      console.error(error);
      throw new Error("Error al eliminar el producto del carrito");
    }
  }

  async deleteCart(cartId) {
    try {
      const cart = await Carts.findOne({ _id: cartId });
      if (!cart) {
        throw new Error("Carrito no encontrado");
      }
      cart.products = [];
      await cart.save();
    } catch (err) {
      console.log(err);
    }
  }
}

module.exports = cartDao;
