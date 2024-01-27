function addProductFromFront(productId) {
  return addProduct(productId);
}
function deleteProductFromFront(productId) {
  return deleteProduct(productId);
}
function deleteOneProduct(productId) {
  return deleteProductById(productId);
}

async function addProduct(productId) {
  try {
    const socket = io("http://localhost:8080");

    const cartId = document.getElementById("cartId").textContent;
    const quantity = 1;
    const newProductId = productId;
    console.log(newProductId, "new");
    // Utiliza await para asegurarte de que la emisión se realice antes de continuar
    await new Promise((resolve) =>
      socket.emit("addProd", { cartId, newProductId, quantity }, resolve)
    );
  } catch (error) {
    console.error(error);
    // Puedes manejar el error aquí según tus necesidades
  }
}

async function addProductToView(productId) {
  try {
    const socket = io("http://localhost:8080");
    const cartId = "65b1382cab83dedd9755ccd4";
    const quantity = 1;
    const newProductId = productId;

    console.log(newProductId, "new"); // Utiliza await para asegurarte de que la emisión se realice antes de continuar
    await new Promise((resolve) =>
      socket.emit("addProd", { cartId, newProductId, quantity }, resolve)
    );
    alert("Producto agregado correctamente");
  } catch (error) {
    console.error(error);
    // Puedes manejar el error aquí según tus necesidades
  }
}

async function deleteProduct(productId) {
  try {
    const socket = io("http://localhost:8080");
    const cartId = "65b1382cab83dedd9755ccd4";
    const quantity = 1;
    const newProductId = productId;
    console.log(newProductId, "new", "carro", cartId); // Utiliza await para asegurarte de que la emisión se realice antes de continuar
    console.log(newProductId, "new"); // Utiliza await para asegurarte de que la emisión se realice antes de continuar
    await new Promise((resolve) =>
      socket.emit("deleteProd", { cartId, newProductId }, resolve)
    );
    alert("Producto eliminado correctamente");
  } catch (error) {
    console.error(error);
    // Puedes manejar el error aquí según tus necesidades
  }
}

async function deleteProductById(productId) {
  try {
    const socket = io("http://localhost:8080");
    const cartId = "65b1382cab83dedd9755ccd4";
    const quantity = 1;
    const newProductId = productId;
    // Utiliza await para asegurarte de que la emisión se realice antes de continuar
    await new Promise((resolve) =>
      socket.emit(
        "deleteProductFromView",
        { cartId, newProductId, quantity },
        resolve
      )
    );
    alert("Producto eliminado correctamente");
  } catch (error) {
    console.error(error);
    // Puedes manejar el error aquí según tus necesidades
  }
}
