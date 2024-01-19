// chat.js

document.addEventListener("DOMContentLoaded", function () {
  const socket = io("http://localhost:8080");
  const chatBox = document.getElementById("chatBox");
  const messageLogs = document.getElementById("messageLogs");
  let username;

  const getUsername = async () => {
    try {
      username = await Swal.fire({
        title: "Bienvenido al CoderChat",
        text: "Ingresa tu usuario para identificarte",
        input: "text",
        icon: "success",
      });

      socket.emit("newUser", { username: username.value });

      socket.on("userConnected", (user) => {
        Swal.fire({
          text: `Se acaba de conectar ${user.username}`,
          toast: true,
          position: "top-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          icon: "success",
        });
      });

      chatBox.addEventListener("keyup", handleEnterKey);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEnterKey = (e) => {
    if (e.key === "Enter") {
      const data = {
        username: username.value,
        message: chatBox.value,
      };
      chatBox.value = "";

      socket.emit("message", data);
    }
  };

  const renderMessages = (chats) => {
    let messages = "";
    chats.forEach((chat) => {
      messages += `<p>${chat.user} dice: ${chat.message}</p>`;
    });

    messageLogs.innerHTML = messages;
  };

  getUsername();

  socket.on("messageLogs", renderMessages);
});
