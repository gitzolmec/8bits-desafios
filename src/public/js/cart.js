const socket = io("http://localhost:8080");
socket.on("cartUpdated", (cart) => {
  const products = cart.products;

  products.forEach((product) => {
    document.getElementById(`quantity-${product.id}`).textContent =
      product.quantity;
  });
});

socket.on("oneProductDeleted", (cart) => {
  const Products = cart.products;

  Products.forEach((product) => {
    document.getElementById(`quantity-${product.id}`).textContent =
      product.quantity;
  });
});

socket.on("ProductDeleted", (productId) => {
  document.getElementById(`product-${productId}`).remove();
});
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
    console.log("_", cartId, "_");
    await new Promise((resolve) =>
      socket.emit("addProd", { cartId, newProductId, quantity }, resolve)
    );
  } catch (error) {
    console.error(error);
  }
}

async function addProductToView(productId) {
  try {
    const socket = io("http://localhost:8080");
    const cartId = "65b1382cab83dedd9755ccd4";
    const quantity = 1;
    const newProductId = productId;

    await new Promise((resolve) =>
      socket.emit("addProd", { cartId, newProductId, quantity }, resolve)
    );
    alert("Producto agregado correctamente");
  } catch (error) {
    console.error(error);
  }
}

async function deleteProduct(productId) {
  try {
    const socket = io("http://localhost:8080");
    const cartId = "65b1382cab83dedd9755ccd4";
    const quantity = 1;
    const newProductId = productId;

    await new Promise((resolve) =>
      socket.emit("deleteProd", { cartId, newProductId }, resolve)
    );
  } catch (error) {
    console.error(error);
  }
}

async function deleteProductById(productId) {
  try {
    const socket = io("http://localhost:8080");
    const cartId = "65b1382cab83dedd9755ccd4";
    const quantity = 1;
    const newProductId = productId;
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
  }
}
