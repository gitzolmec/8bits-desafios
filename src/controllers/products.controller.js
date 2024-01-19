const { Router } = require("express");
const router = Router();
const productDAOfl = require("../DAO/Arrays/product-dao.file.js");

const HTTP_RESPONSES = require("../constants/http-responses.constants.js");
const productDAOMongo = require("../DAO/Mongo/product-dao.mongo.js");

let productManager;

// Función para manejar errores y enviar una respuesta con un código de estado 500
const errorHandler = (err, res) => {
  if (err.statusCode === HTTP_RESPONSES.NOT_FOUND) {
    res.status(HTTP_RESPONSES.NOT_FOUND).json({ error: "Product not found" });
    return;
  }

  res
    .status(HTTP_RESPONSES.INTERNAL_SERVER_ERROR)
    .json({ error: "Internal Server Error" });
};

// Inicialización del ProductManager y definición de rutas
(async () => {
  productManager = await new productDAOMongo();
 // productManager = await new productDAOfl("controllers/products.json"); 



  // Obtener todos los productos y renderizar la vista home.handlebars
  router.get("/", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const products = await productManager.getProducts(limit);
      res.render("home.handlebars", { products });
    } catch (err) {
      errorHandler(err, res);
    }
  });
  

  // Obtener todos los productos y renderizar la vista realtimeproducts.handlebars
  router.get("/realtimeproducts", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const products = await productManager.getProducts(limit);
      res.render("home.handlebars", { products });
    } catch (err) {
      errorHandler(err, res);
    }
  });

  // Obtener un producto por su ID
  router.get("/:pid", async (req, res) => {
    try {
      const pid = req.params.pid;

      const product = await productManager.getProductById(pid);
      console.log(product);
      if (product) {
        res.json({ product });
      } else {
        res
          .status(HTTP_RESPONSES.NOT_FOUND)
          .json({ error: "Producto no encontrado" });
      }
    } catch (err) {
      errorHandler(err, res);
    }
  });

  // Agregar un nuevo producto
  router.post("/", async (req, res) => {
    try {
      console.log("Request body:", req.body);
      const { title, description, price, thumbnail, code, stock, status } =
        req.body;
        
      if (
        !title ||
        !description ||
        !price ||
        !thumbnail ||
        !code ||
        !stock ||
        !status
      ) {
        throw new Error("Todos los campos son obligatorios");
      }
      const newProductInfo = {
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        status,
      };
      console.log(newProductInfo);
     const newProduct = await productManager.addProduct(newProductInfo)

      res.json({ message: "Producto agregado con éxito" });
    } catch (err) {
      console.error("Error:", err);
      errorHandler(err, res);
    }
  });

  // Actualizar un producto por su ID
  router.put("/:pid", async (req, res) => {
    try {
      const pid = req.params.pid;

      const updatedFields = req.body;
      const product = await productManager.getProductById(pid);
      if (!product) {
        let err = new Error("Producto no encontrado");
        err.statusCode = HTTP_RESPONSES.NOT_FOUND;
        throw err;
      }
      const update = await productManager.updateProduct(pid, updatedFields);

      res.json({
        message: `Producto con ID ${pid} actualizado con éxito`,
        update,
      });
    } catch (err) {
      errorHandler(err, res);
    }
  });

  // Eliminar un producto por su ID
  router.delete("/:pid", async (req, res) => {
    try {
      const pid = req.params.pid;

      const deleted = (await productManager.deleteProduct(pid)) ? true : false;

      if (!deleted) {
        console.log(deleted);
        return res.status(HTTP_RESPONSES.NOT_FOUND).json({
          message: "Producto no encontrado",
        });
      }

      res.json({
        message: `Producto con ID ${pid} eliminado con éxito`,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Error al eliminar producto",
      });
    }
  });

  // Agregar un nuevo producto en tiempo real
  router.post("/realtimeproducts", async (req, res) => {
    try {
      console.log("Request body:", req.body);
      const { title, description, price, thumbnail, code, stock, status } =
        req.body;
        
      if (
        !title ||
        !description ||
        !price ||
        !thumbnail ||
        !code ||
        !stock ||
        !status
      ) {
        throw new Error("Todos los campos son obligatorios");
      }
      const newProductInfo = {
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        status,
      };
      console.log(newProductInfo);
     const newProduct = await productManager.addProduct(newProductInfo)

      res.json({ message: "Producto agregado con éxito" });
    } catch (err) {
      console.error("Error:", err);
      errorHandler(err, res);
    }
  });

  // Eliminar un producto en tiempo real por su ID
  router.delete("/realtimeproducts/:pid", async (req, res) => {
    try {
      const pid = req.params.pid

      const deletedProduct = productManager.getProductById(pid);
      const deleted = (await productManager.deleteProduct(pid)) ? true : false;

      if (!deleted) {
        console.log(deleted);
        return res.status(404).json({
          message: "Producto no encontrado",
        });
      }

      const { io } = require("../app");
      console.log("Antes de emitir 'updateProducts'");
      io.emit("updateProducts", { deleted: true, _id: pid });
      console.log("Después de emitir 'updateProducts'");

      res.json({
        message: `Producto con ID ${pid} eliminado con éxito`,
        product: deletedProduct,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Error al eliminar producto",
      });
    }
  });
})();



module.exports = router;
