const { Router } = require("express");
const router = Router();
const productDAOfl = require("../DAO/Arrays/product-dao.file.js");
const HTTP_RESPONSES = require("../constants/http-responses.constants.js");
const productDAOMongo = require("../DAO/Mongo/product-dao.mongo.js");

const passportCall = require("../utils/passport-call.util.js");

let productManager;

const {
  getAllProducts,
  getClientInfo,
  getProductById,
} = require("../services/product.service.js");
const adminAuthMiddleware = require("../middlewares/admin-validation.middleware.js");
// Función para manejar errores y enviar una respuesta con un código de estado 500
const errorHandler = (err, res) => {
  if (err.statusCode === HTTP_RESPONSES.NOT_FOUND) {
    res.status(HTTP_RESPONSES.NOT_FOUND).json({ error: "Product not found" });
    return;
  }

  res
    .status(HTTP_RESPONSES.INTERNAL_SERVER_ERROR)
    .json({ error: "Internal Server Errores" });
};

// Inicialización del ProductManager y definición de rutas
(async () => {
  productManager = await new productDAOMongo();

  // productManager = await new productDAOfl("controllers/products.json");

  // Obtener todos los productos y renderizar la vista home.handlebars
  router.get("/", passportCall("jwt"), async (req, res) => {
    try {
      const tokenid = req.user.id;
      if (!tokenid) {
        res.redirect("/login");
      }
      const {
        first_name,
        last_name,
        role,
        adminValidation,
        totalProducts,
        cartId,
      } = await getClientInfo(req); //obtiene los datos del cliente logueado
      const {
        products,
        totalPages,
        pages,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
        pLimit,
        pSort,
      } = await getAllProducts(req); //obtiene los productos y los datos de paginacion

      res.render("home.handlebars", {
        products,
        totalPages,
        pages,
        hasPrevPage,
        hasNextPage,
        prevPage,
        nextPage,
        pLimit,
        pSort,
        first_name,
        last_name,
        role,
        adminValidation,
        cartId,
        totalProducts,
      });
    } catch (err) {
      //errorHandler(err, res);
      console.log(err);
    }
  });

  // Obtener un producto por su ID
  router.get("/:pid", passportCall("jwt"), async (req, res) => {
    try {
      const pid = req.params.pid;

      const product = await getProductById(pid);

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
  router.post(
    "/",
    passportCall("jwt"),
    adminAuthMiddleware,
    async (req, res) => {
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

        const newProduct = await productManager.addProduct(newProductInfo);

        res.json({ message: "Producto agregado con éxito" });
      } catch (err) {
        console.error("Error:", err);
        errorHandler(err, res);
      }
    }
  );

  // Actualizar un producto por su ID
  router.put(
    "/:pid",
    passportCall("jwt"),
    adminAuthMiddleware,
    async (req, res) => {
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
    }
  );

  // Eliminar un producto por su ID
  router.delete(
    "/:pid",
    passportCall("jwt"),
    adminAuthMiddleware,
    async (req, res) => {
      try {
        const pid = req.params.pid;

        const deleted = (await productManager.deleteProduct(pid))
          ? true
          : false;

        if (!deleted) {
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
    }
  );

  // Agregar un nuevo producto en tiempo real
  router.post(
    "/realtimeproducts",
    passportCall("jwt"),
    adminAuthMiddleware,
    async (req, res) => {
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
        const newProduct = await productManager.addProduct(newProductInfo);

        io.emit("addProduct", newProduct);
        res.render("realTimeProducts.handlebars");
      } catch (err) {
        console.error("Error:", err);
        errorHandler(err, res);
      }
    }
  );

  // Eliminar un producto en tiempo real por su ID
  router.delete(
    "/realtimeproducts/:pid",
    passportCall("jwt"),
    adminAuthMiddleware,
    async (req, res) => {
      try {
        const pid = req.params.pid;

        // Obtener la información del producto antes de eliminarlo
        const deletedProduct = await productManager.getProductById(pid);

        if (!deletedProduct) {
          return res.status(404).json({
            message: "Producto no encontrado",
          });
        }

        // Eliminar el producto
        const deleted = await productManager.deleteProduct(pid);

        const newProductList = await productManager.getProducts();
        const { io } = require("../app.js");
        // Emitir el evento 'updateProductList' para actualizar la lista de productos
        io.emit("updateProducts", newProductList);
        res.render("realTimeProducts.handlebars");
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
    }
  );

  router.get("/details/:pid", passportCall("jwt"), async (req, res) => {
    try {
      const productId = req.params.pid;

      const {
        first_name,
        last_name,
        role,
        cartId,
        totalProducts,
        adminValidation,
      } = await getClientInfo(req);

      const product = await getProductById(productId);

      const productrender = [product];
      const { _id, title, description, price, thumbnail, code, stock, status } =
        productrender[0];

      res.render("product.handlebars", {
        _id,
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        status,
        first_name,
        last_name,
        role,
        cartId,
        totalProducts,
        adminValidation,
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Hubo un error");
    }
  });
})();

module.exports = router;
