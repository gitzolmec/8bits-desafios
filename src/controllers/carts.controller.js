const { Router } = require("express");
const router = Router();
const cartDaoMongo = require("../DAO/Mongo/cart-dao.mongo");

const passportCall = require("../utils/passport-call.util.js");

const {
  createTicket,
  addProductToCart,
  addCart,
  getCarts,
  getCartById,
  getCartUserInfo,
  getCartTotalQuantity,
  updateCartWithProductList,
  updateProductQuantityInCart,
  deleteProductFromCart,
  deleteCart,
  checkoutCart,
} = require("../services/carts.service.js");
const userAuthMiddleware = require("../middlewares/user-validation.middleware.js");
let cartManager;

const errorHandler = (err, res) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
};

(async () => {
  //cartManager = await new cartDAOFl("controllers/carts.json");
  cartManager = await new cartDaoMongo();
  router.post("/", async (req, res) => {
    // Crear un nuevo carrito
    try {
      const cart = await addCart();
      const idcart = cart._id;
      req.logger.debug("Carrito creado:", idcart);
      res.json({ idcart });
    } catch (err) {
      errorHandler(err, res);
    }
  });

  router.get("/", passportCall("jwt"), async (req, res) => {
    try {
      const cart = await getCarts();
      res.json({ cart });
    } catch (err) {
      errorHandler(err, res);
    }
  });

  router.get("/:cid", passportCall("jwt"), async (req, res) => {
    try {
      const tokenid = req.user.id;

      const userInfo = await getCartUserInfo(tokenid);
      const { first_name, last_name, cartId } = userInfo;

      const cart = await getCartById(cartId);

      const totalQuantity = await getCartTotalQuantity(cartId);

      if (cart) {
        // Mapear los productos y agregar la propiedad quantity
        const products = cart.products.map((p) => ({
          ...p.id,
          quantity: p.quantity, // Agregar la propiedad quantity
        }));

        res.render("cart.handlebars", {
          products,
          cartId,
          first_name,
          last_name,
          totalQuantity,
        });
      } else {
        res.status(404).json({ error: "Carrito no encontrado" });
        req.logger.error("Carrito no encontrado");
      }
    } catch (err) {
      errorHandler(err, res);
    }
  });

  router.post("/:cid/products/:pid", userAuthMiddleware, async (req, res) => {
    // Agregar un producto al carrito
    try {
      const { cartId, productId, quantity } = await addProductToCart(req);

      res.json({
        message: `Producto con ID ${productId} agregado al carrito ${cartId}, unidades agregadas: ${quantity}`,
      });
    } catch (err) {
      errorHandler(err, res);
    }
  });

  router.put("/:cid", async (req, res) => {
    // actualizar carrito con una lista de productos y cantidades.
    try {
      const cartId = req.params.cid;
      const productsList = req.body;

      await updateCartWithProductList(cartId, productsList);

      res.json({
        message: `carrito con ID ${cartId} actualizado con exito: `,
      });
    } catch (err) {
      errorHandler(err, res);
    }
  });

  router.put("/:cid/products/:pid", async (req, res) => {
    // actualizar la cantidad de un producto en el carrito
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;
      const quantity = req.body.quantity;

      await updateProductQuantityInCart(cartId, productId, quantity);

      res.json({
        message: `carrito con ID ${cartId} actualizado con exito: `,
      });
    } catch (err) {
      errorHandler(err, res);
    }
  });

  router.delete("/:cid/products/:pid", userAuthMiddleware, async (req, res) => {
    // eliminar un producto al carrito
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;

      const deletedProduct = await deleteProductFromCart(cartId, productId);

      res.json({
        message: `Producto con ID ${productId} eliminado con exito del carrito ${cartId}`,
        deletedProduct,
      });
    } catch (err) {
      errorHandler(err, res);
    }
  });
  //eliminar carrito
  router.delete("/:cid", async (req, res) => {
    try {
      const cartId = req.params.cid;

      const deleted = await deleteCart(cartId);

      res.json({
        message: `Carrito con ID ${cartId} vaciado con exito`,
      });
    } catch (err) {
      errorHandler(err, res);
    }
  });
  //finalizar compra
  router.get("/:cid/purchase", passportCall("jwt"), async (req, res) => {
    try {
      const cartId = req.params.cid;

      const { totalprice, purchaseDetails, stock } = await checkoutCart(cartId);
      if (stock === false) {
        req.logger.warning("No hay stock suficiente");
        setTimeout(() => {
          res.redirect("/api/products");
        }, 5000);

        return;
      }
      const ticket = await createTicket(req, totalprice, purchaseDetails);
      res.redirect("/api/products");
    } catch (err) {
      req.logger.error("error al completar la compra", err);
      errorHandler(err, res);
    }
  });
})();

module.exports = router;
