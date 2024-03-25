const { port } = require("./src/configs/server.config");
const { Server } = require("socket.io");
const app = require("./src/server");
const chatDAOMongo = require("./src/DAO/Mongo/chat-dao.mongo");
const cartDaoMongo = require("./src/DAO/Mongo/cart-dao.mongo");
const { logger } = require("./src/middlewares/logger.middleware");

const chats = [];
const chat = new chatDAOMongo();
const cart = new cartDaoMongo();

const httpServer = app.listen(port, () => {
  logger.info(`Servidor escuchando en el puerto ${port}`);
});

const io = new Server(httpServer);
io.on("connection", (socket) => {
  socket.on("newUser", (data) => {
    socket.broadcast.emit("userConnected", data);

    socket.emit("messageLogs", chats);
  });

  socket.on("message", async (data) => {
    await chat.getMessages(data.username, data.message);

    const message = await chat.getAllMessages();

    io.emit("messageLogs", message);
  });

  socket.on("addProd", async ({ cartId, newProductId, quantity }) => {
    cartId = cartId.trim();
    await cart.addProductToCart(cartId, newProductId, quantity);
  });
  socket.on("addProdToView", async ({ cartId, newProductId, quantity }) => {
    cartId = cartId.trim();
    const view = "details";
    await cart.addProductToCart(cartId, newProductId, quantity, view);
  });

  socket.on(
    "addProductFromView",
    async ({ cartId, newProductId, quantity }) => {
      await cart.addProductToCart(cartId, newProductId, quantity);
    }
  );

  socket.on("deleteProd", async ({ cartId, newProductId }) => {
    await cart.deleteProductFromCart(cartId, newProductId);
  });
  socket.on(
    "deleteProductFromView",
    async ({ cartId, newProductId, quantity }) => {
      await cart.updateProductQuantityInCart(cartId, newProductId, quantity);
    }
  );
});

module.exports = {
  io,
};
