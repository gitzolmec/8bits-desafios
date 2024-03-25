const { logger } = require("../../middlewares/logger.middleware");
const Carts = require("../../models/carts.model");
const Tickets = require("../../models/tickets.model");
const { getProductById } = require("../../services/product.service");
const formatDate = require("../../utils/format-date.util");
const totalQuantity = require("../../utils/total-quantity.util");

class cartDao {
  async getCarts() {
    const cart = await Carts.find({}, { __v: 0 }).populate("products.id");

    return cart;
  }

  async getCartById(id) {
    logger.debug(`ID del carrito: ${id}`);
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
      logger.error("Error al crear el carrito: ", error);
      throw new Error("Error al crear el carrito");
    }
  }

  async addProductToCart(cartId, productId, quantity, view) {
    try {
      // Buscar el carrito por ID

      const cart = await Carts.findOne({ _id: cartId });

      if (!cart) {
        logger.warning("Carrito no encontrado");
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
      logger.info("Producto agregado al carrito");
      const totalProducts = await totalQuantity(cartId);
      const { io } = require("../../../app");

      io.emit("cartUpdated", cart, totalProducts, view);
    } catch (error) {
      logger.error("Error al agregar el producto al carrito: ", error);
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
      logger.error(
        "Error al actualizar el carrito con la lista de productos: ",
        error
      );
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
      const productIndex = cart.products.findIndex((p) =>
        p.id.equals(productId)
      );

      if (productIndex !== -1) {
        // Si el producto existe, actualiza la cantidad
        const product = cart.products[productIndex].quantity;

        if (product > 1 && quantity) {
          cart.products[productIndex].quantity -= quantity;
        } else if (product > 1 && !quantity) {
          cart.products[productIndex].quantity -= 1;
        } else if (product <= 1) {
          this.deleteProductFromCart(cartId, productId);
        }
        await cart.save();
        const totalProducts = await totalQuantity(cartId);

        const { io } = require("../../../app");

        io.emit("oneProductDeleted", cart, totalProducts);
      } else {
        throw new Error("Producto no encontrado en el carrito");
      }
      return cart.products;
    } catch (error) {
      logger.error(
        "Error al actualizar la cantidad del producto en el carrito: ",
        error
      );
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
      logger.info("Producto eliminado del carrito");
      const totalProducts = await totalQuantity(cartId);
      const { io } = require("../../../app");

      io.emit("ProductDeleted", productId, totalProducts);

      return cart;
    } catch (error) {
      logger.error("error al eliminar el producto del carrito: ", error);
      throw new Error("Error al eliminar el producto del carrito");
    }
  }

  async deleteCart(cartId) {
    try {
      const cart = await Carts.findOne({ _id: cartId });
      if (!cart) {
        logger.warning("Carrito no encontrado");
        throw new Error("Carrito no encontrado");
      }
      cart.products = [];
      await cart.save();
      return cart;
    } catch (err) {
      logger.error("Error al eliminar el carrito: ", err);
    }
  }

  async totalQuantity(cartId) {
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
      logger.error("Error al obtener la cantidad total del carrito: ", err);
    }
    return 0;
  }

  async checkoutCart(cartId) {
    try {
      let stock = true;
      let pendingProducts = false;
      const cart = await Carts.findOne({ _id: cartId });
      const purchaseDetails = [];
      let totalprice = 0;
      if (!cart) {
        logger.warning("Carrito no encontrado");
        throw new Error("Carrito no encontrado");
      }
      const products = cart.products;
      for (const product of products) {
        const productId = product.id;
        const productDetails = await getProductById(productId);

        if (productDetails.stock === 0) {
          logger.info(
            `El producto ${productDetails.title} no tiene stock disponible. Se omitirá de la compra.`
          );
          stock = false;
        } else if (
          productDetails.stock > 0 &&
          productDetails.stock < product.quantity
        ) {
          logger.info(
            `No hay stock suficiente para el producto ${productDetails.title}`
          );
          pendingProducts = true;
          const availableStock = productDetails.stock;
          const price = productDetails.price * availableStock;
          totalprice += price;

          productDetails.stock = 0;
          productDetails.status = false;

          purchaseDetails.push({
            title: productDetails.title,
            quantity: availableStock,
            price: totalprice,
          });

          await this.updateProductQuantityInCart(
            cartId,
            productId,
            availableStock
          );

          await cart.save();
        } else {
          const price = productDetails.price * product.quantity;
          totalprice += price;
          productDetails.stock -= product.quantity;
          await this.deleteProductFromCart(cartId, productId);
          purchaseDetails.push({
            title: productDetails.title,
            quantity: product.quantity,
            price: price,
          });
        }

        productDetails.save();
      }

      if (pendingProducts === true) {
        const Products = await Carts.findById(cartId);
        const productsNotAvailable = Products.products;
        logger.warning(
          "Productos no incluidos en la compra por falta de stock: ",
          productsNotAvailable
        );
        return { purchaseDetails, totalprice, productsNotAvailable };
      }
      return { purchaseDetails, totalprice, stock };
    } catch (err) {
      logger.error("Error al realizar la compra: ", err);
    }
  }

  async createTicket(purchaser, code, amount, purchaseDetails) {
    try {
      if (amount === 0) {
        throw new Error("no hay productos para generar una compra");
      }
      const details = purchaseDetails.map((detail) => {
        return {
          title: detail.title,
        };
      });

      const ticket = await Tickets.create({
        purchaser,
        details,
        code,
        amount,
      });
      return ticket;
    } catch (err) {
      logger.error("Error al crear el ticket: ", err);
    }
    {
    }
  }
}

module.exports = cartDao;
