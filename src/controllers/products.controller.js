const { Router } = require("express");
const router = Router();
const productDAOfl = require("../DAO/Arrays/product-dao.file.js");
const HTTP_RESPONSES = require("../constants/http-responses.constants.js");
const productDAOMongo = require("../DAO/Mongo/product-dao.mongo.js");
const authMiddleware = require("../middlewares/auth.middleware.js");
const passportCall = require("../utils/passport-call.util.js");
const totalQuantity = require("../utils/total-quantity.util.js");

let productManager;
const usersDao = require("../DAO/Mongo/user-dao.mongo.js");
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
  user = await new usersDao();
  // productManager = await new productDAOfl("controllers/products.json");

  // Obtener todos los productos y renderizar la vista home.handlebars
  router.get("/", passportCall("jwt"), async (req, res) => {
    try {
      const tokenid = req.user.id;
      if (!tokenid) {
        res.redirect("/login");
      }
      const userInfo = await user.getUserById(tokenid);
      const cartId = userInfo.cartId;
      const totalProducts = await totalQuantity(cartId);
      const limit = req.query.limit ? parseInt(req.query.limit) : undefined;
      const sort = req.query.sort || 1;
      const page = req.query.page ? parseInt(req.query.page) : 1;
      const category = req.query.category || "";

      const { first_name, last_name, role, _id } = userInfo;
      let adminValidation = "";
      if (role == "admin") {
        adminValidation = "admin";
      }

      const products = await productManager.getProducts(
        limit,
        page,
        sort,
        category
      );
      const paginationInfo = products[products.length - 1];
      const Pages = paginationInfo.totalPages;

      if (page < 1 || page > Pages) {
        // Página fuera del rango, lanzar un error o redireccionar a una página de error
        return res.render("errorPage.handlebars", {
          error: "Página no encontrada",
        });
      }
      // Acceder a las propiedades de paginación
      const totalPages = paginationInfo.totalPages;
      const pages = paginationInfo.page;
      const hasPrevPage = paginationInfo.hasPrevPage;
      const hasNextPage = paginationInfo.hasNextPage;
      const prevPage = paginationInfo.prevPage;
      const nextPage = paginationInfo.nextPage;
      const pLimit = paginationInfo.limit;
      let pSort = 0;
      if (sort == 1) {
        pSort = "asc";
      } else {
        pSort = "desc";
      }

      // Imprimir o utilizar las propiedades

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
  router.get("/:pid", authMiddleware, async (req, res) => {
    try {
      const pid = req.params.pid;

      const product = await productManager.getProductById(pid);

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

      const newProduct = await productManager.addProduct(newProductInfo);

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
      const newProduct = await productManager.addProduct(newProductInfo);

      io.emit("addProduct", newProduct);
      res.render("realTimeProducts.handlebars");
    } catch (err) {
      console.error("Error:", err);
      errorHandler(err, res);
    }
  });

  // Eliminar un producto en tiempo real por su ID
  router.delete("/realtimeproducts/:pid", async (req, res) => {
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
  });

  router.get("/details/:pid", passportCall("jwt"), async (req, res) => {
    try {
      const tokenid = req.user.id;

      const userInfo = await user.getUserById(tokenid);

      const productId = req.params.pid;

      const { first_name, last_name, role, cartId } = userInfo;
      const totalProducts = await totalQuantity(cartId);
      const product = await productManager.getProductById(productId);

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
      });
    } catch (error) {
      console.log(error);
      res.status(500).send("Hubo un error");
    }
  });
})();

module.exports = router;
