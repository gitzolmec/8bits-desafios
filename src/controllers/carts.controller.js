const { Router } = require("express");
const router = Router();
const cartDAOFl = require("../DAO/Arrays/cart-dao.file");
const cartDaoMongo = require("../DAO/Mongo/cart-dao.mongo");
const authMiddleware = require("../middlewares/auth.middleware.js");
const passportCall = require("../utils/passport-call.util.js");
const totalQuantity = require("../utils/total-quantity.util.js");
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
      console.log("Creando carrito");
      const cart = await cartManager.addCart();
      const idcart = cart._id;
      console.log("Carrito creado:", idcart);
      res.json({ idcart });
    } catch (err) {
      errorHandler(err, res);
    }
  });

  router.get("/", passportCall("jwt"), async (req, res) => {
    try {
      const cart = await cartManager.getCarts();
      res.json({ cart });
    } catch (err) {
      errorHandler(err, res);
    }
  });

  router.get("/:cid", passportCall("jwt"), async (req, res) => {
    try {
      const tokenid = req.user.id;

      const userInfo = await user.getUserById(tokenid);
      const { first_name, last_name, cartId } = userInfo;

      const cart = await cartManager.getCartById(cartId);
      const totalQuantity = await cartManager.totalQuantity(cartId);

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
      }
    } catch (err) {
      errorHandler(err, res);
    }
  });

  router.post("/:cid/products/:pid", async (req, res) => {
    // Agregar un producto al carrito
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;
      const quantity = req.body.quantity || 1;

      await cartManager.addProductToCart(cartId, productId, quantity);

      res.json({
        message: `Producto con ID ${productId} agregado al carrito ${cartId}: `,
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

      await cartManager.updateCartWithProductList(cartId, productsList);

      res.json({
        message: `carrito con ID ${cartId} actualizado con exito: `,
      });
    } catch (err) {
      errorHandler(err, res);
    }
  });

  router.put("/:cid/products/:pid", async (req, res) => {
    // Agregar un producto al carrito
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;
      const quantity = req.body.quantity;

      await cartManager.updateProductQuantityInCart(
        cartId,
        productId,
        quantity
      );

      res.json({
        message: `carrito con ID ${cartId} actualizado con exito: `,
      });
    } catch (err) {
      errorHandler(err, res);
    }
  });

  router.delete("/:cid/products/:pid", async (req, res) => {
    // Agregar un producto al carrito
    try {
      const cartId = req.params.cid;
      const productId = req.params.pid;

      const deletedProduct = await cartManager.deleteProductFromCart(
        cartId,
        productId
      );

      res.json({
        message: `Producto con ID ${productId} eliminado con exito del carrito ${cartId}`,
        deletedProduct,
      });
    } catch (err) {
      errorHandler(err, res);
    }
  });
  router.delete("/:cid", async (req, res) => {
    try {
      const cartId = req.params.cid;

      const deleted = await cartManager.deleteCart(cartId);

      res.json({
        message: `Carrito con ID ${cartId} vaciado con exito`,
      });
    } catch (err) {
      errorHandler(err, res);
    }
  });
})();

module.exports = router;
