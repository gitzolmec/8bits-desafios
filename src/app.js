const { port } = require("./configs/server.config");
const { Server } = require("socket.io");
const app = require("./server");

const httpServer = app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

const io = new Server(httpServer);
io.on("connection", (socket) => {
  console.log(socket.id);
});

module.exports = {
  io,
};
