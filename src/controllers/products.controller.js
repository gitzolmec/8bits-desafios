const { Router } = require("express");
const router = Router();

const passportCall = require("../utils/passport-call.util.js");

const {
  getAllProducts,
  getClientInfo,
  getProductById,
  deleteProduct,
  addProduct,
} = require("../services/product.service.js");
const adminAuthMiddleware = require("../middlewares/admin-validation.middleware.js");
const {
  deleteProductErrorInfo,
  productIdNotFound,
  createProductErrorInfo,
} = require("../handlers/errors/generate-error-info.js");
const PRODUCT_ERRORS = require("../handlers/errors/product-error-types.js");
const EErrors = require("../handlers/errors/enum.error.js");
const { logger } = require("handlebars");

// Inicialización del ProductManager y definición de rutas

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
    logger.error(err);
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
      CustomError.createError({
        name: PRODUCT_ERRORS.PRODUCT_ID_NOT_FOUND,
        cause: productIdNotFound(pid),
        message: `The product with id ${pid} does not exist`,
        code: EErrors.NOT_FOUND,
      });
    }
  } catch (error) {
    res.json({ error });
    req.logger.error(`ID del producto no existe`);
  }
});

// Agregar un nuevo producto
router.post("/", passportCall("jwt"), adminAuthMiddleware, async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
      status,
      category,
    } = req.body;

    if (
      !title ||
      !description ||
      !price ||
      !thumbnail ||
      !code ||
      !stock ||
      !status ||
      !category
    ) {
      CustomError.createError({
        name: PRODUCT_ERRORS.ERROR_CREATING_PRODUCT,
        cause: createProductErrorInfo(
          title,
          description,
          price,
          thumbnail,
          code,
          stock,
          status,
          category
        ),
        message: `One or more properties were incomplete or note valid.`,
        code: EErrors.BAD_REQUEST,
      });
    }
    const newProductInfo = {
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
      status,
      category,
    };

    const newProduct = await addProduct(newProductInfo);
    req.logger.info("Producto agregado con éxito" + newProduct.title);
    res.json({ message: "Producto agregado con éxito" });
  } catch (err) {
    res.json({ err });
  }
});

// Actualizar un producto por su ID
router.put(
  "/:pid",
  passportCall("jwt"),
  adminAuthMiddleware,
  async (req, res) => {
    try {
      const pid = req.params.pid;

      const updatedFields = req.body;
      const product = await getProductById(pid);
      if (!product) {
        CustomError.createError({
          name: PRODUCT_ERRORS.ERROR_UPDATING_PRODUCT,
          cause: productIdNotFound(pid),
          message: `The product with id ${pid} does not exist`,
          code: EErrors.NOT_FOUND,
        });
      }
      const update = await updateProduct(pid, updatedFields);

      res.json({
        message: `Producto con ID ${pid} actualizado con éxito`,
        update,
      });
    } catch (err) {
      res.json({ err });
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

      const deleted = (await deleteProduct(pid)) ? true : false;

      if (!deleted) {
        CustomError.createError({
          name: PRODUCT_ERRORS.ERROR_DELETING_PRODUCT,
          cause: deleteProductErrorInfo(pid),
          message: "Error trying to delete product",
          code: EErrors.NOT_FOUND,
        });
      }

      res.json({
        message: `Producto con ID ${pid} eliminado con éxito`,
      });
    } catch (error) {
      res.json({ error });
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
      const {
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        status,
        category,
      } = req.body;

      if (
        !title ||
        !description ||
        !price ||
        !thumbnail ||
        !code ||
        !stock ||
        !status ||
        !category
      ) {
        CustomError.createError({
          name: PRODUCT_ERRORS.ERROR_CREATING_PRODUCT,
          cause: createProductErrorInfo(
            title,
            description,
            price,
            thumbnail,
            code,
            stock,
            status,
            category
          ),
          message: `One or more properties were incomplete or note valid.`,
          code: EErrors.BAD_REQUEST,
        });
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

      const newProduct = await addProduct(newProductInfo);

      io.emit("addProduct", newProduct);
      res.render("realTimeProducts.handlebars");
    } catch (err) {
      res.json({ err });
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
      const deletedProduct = await getProductById(pid);

      if (!deletedProduct) {
        CustomError.createError({
          name: PRODUCT_ERRORS.ERROR_DELETING_PRODUCT,
          cause: deleteProductErrorInfo(pid),
          message: "Error trying to delete User",
          code: EErrors.NOT_FOUND,
        });
      }

      // Eliminar el producto
      const deleted = await deleteProduct(pid);

      const newProductList = await getAllProducts();
      const { io } = require("../app.js");
      // Emitir el evento 'updateProductList' para actualizar la lista de productos
      io.emit("updateProducts", newProductList);
      res.render("realTimeProducts.handlebars");
      res.json({
        message: `Producto con ID ${pid} eliminado con éxito`,
        product: deletedProduct,
      });
    } catch (error) {
      res.json({ error });
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
    if (!product) {
      CustomError.createError({
        name: PRODUCT_ERRORS.PRODUCT_ID_NOT_FOUND,
        cause: productIdNotFound(pid),
        message: `The product with id ${pid} does not exist`,
        code: EErrors.NOT_FOUND,
      });
    }
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
    res.json({ error });
  }
});

module.exports = router;
