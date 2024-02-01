const { port } = require("./configs/server.config");
const { Server } = require("socket.io");
const app = require("./server");
const chatDAOMongo = require("./DAO/Mongo/chat-dao.mongo");
const cartDaoMongo = require("./DAO/Mongo/cart-dao.mongo");
const productDaoMongo = require("./DAO/Mongo/product-dao.mongo");
const mongoose = require("mongoose");

const chats = [];
const chat = new chatDAOMongo();
const cart = new cartDaoMongo();
const product = new productDaoMongo();

const httpServer = app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

const io = new Server(httpServer);
io.on("connection", (socket) => {
  socket.on("newUser", (data) => {
    socket.broadcast.emit("userConnected", data);
    console.log("usuario", data);
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
