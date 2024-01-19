const { Router } = require("express");
const router = Router();
const cartDAOFl = require("../DAO/Arrays/cart-dao.file");
let cartManager;

const errorHandler = (err, res) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
};

(async () => {
  cartManager = await new cartDAOFl("controllers/carts.json");

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

  router.get("/", (req, res) => {
    // Obtener productos del carrito por su ID
    const cartId = parseInt(req.params.cid);
    const cart = cartManager.getCarts();

    if (cart) {
      res.json({ cart });
    } else {
      res.status(404).json({ error: "Carrito no encontrado" });
    }
  });

  router.get("/:cid", (req, res) => {
    // Obtener productos del carrito por su ID
    const cartId = parseInt(req.params.cid);
    const cart = cartManager.getCartById(cartId);

    if (cart) {
      res.json({ cart });
    } else {
      res.status(404).json({ error: "Carrito no encontrado" });
    }
  });

  router.post("/:cid/product/:pid", async (req, res) => {
    // Agregar un producto al carrito
    try {
      const cartId = parseInt(req.params.cid);
      const productId = parseInt(req.params.pid);
      const quantity = parseInt(req.body.quantity) || 1;

      await cartManager.addProductToCart(cartId, productId, quantity);

      res.json({
        message: `Producto con ID ${productId} agregado al carrito ${cartId}`,
      });
    } catch (err) {
      errorHandler(err, res);
    }
  });
})();

module.exports = router;
