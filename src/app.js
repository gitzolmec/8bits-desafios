const { port } = require("./configs/server.config");
const { Server } = require("socket.io");
const app = require("./server");
const chatDAOMongo = require("./DAO/Mongo/chat-dao.mongo");

const chats =[]
const chat = new chatDAOMongo();

const httpServer = app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});

const io = new Server(httpServer);
io.on("connection", (socket) => {
  console.log(socket.id);

  socket.on('newUser', data => {
    socket.broadcast.emit('userConnected', data)
    console.log('usuario',data);
    socket.emit('messageLogs', chats)
    
  })

  socket.on('message', async data => {
    
    await chat.getMessages(data.username, data.message);
    
    const message = await chat.getAllMessages()
    
    io.emit('messageLogs', message)
  })
});



module.exports = {
  io,
};
