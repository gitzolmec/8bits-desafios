const { Router } = require("express");
const router = Router();
const cartDAOFl = require("../DAO/Arrays/cart-dao.file");
const cartDaoMongo = require("../DAO/Mongo/cart-dao.mongo");

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
      res.json({ cart });
    } catch (err) {
      errorHandler(err, res);
    }
  });

  router.get("/", async (req, res) => {
    try {
      const cart = await cartManager.getCarts();
      res.json({ cart });
    } catch (err) {
      errorHandler(err, res);
    }
  });

  router.get("/:cid", async (req, res) => {
    try {
      const cartId = req.params.cid;

      const cart = await cartManager.getCartById(cartId);

      if (cart) {
        // Mapear los productos y agregar la propiedad quantity
        const products = cart.products.map((p) => ({
          ...p.id,
          quantity: p.quantity, // Agregar la propiedad quantity
        }));

        res.render("cart.handlebars", { products, cartId });
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
      //console.log(deletedProduct);
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
      console.log(deleted);
      res.json({
        message: `Carrito con ID ${cartId} vaciado con exito`,
      });
    } catch (err) {
      errorHandler(err, res);
    }
  });
})();

module.exports = router;
