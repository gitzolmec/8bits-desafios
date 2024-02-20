const socket = io("http://localhost:8080");
socket.on("cartUpdated", (cart, totalProducts, view) => {
  const products = cart.products;
  if (view) {
    console.log(totalProducts, products);
    document.getElementById("carritoContenedor").textContent = totalProducts;
    return;
  }

  products.forEach((product) => {
    document.getElementById(`quantity-${product.id}`).textContent =
      product.quantity;
  });

  document.getElementById("carritoContenedor").textContent = totalProducts;
});

socket.on("oneProductDeleted", (cart, totalProducts) => {
  const Products = cart.products;

  Products.forEach((product) => {
    document.getElementById(`quantity-${product.id}`).textContent =
      product.quantity;
  });
  document.getElementById("carritoContenedor").textContent = totalProducts;
});

socket.on("ProductDeleted", (productId, totalProducts) => {
  document.getElementById(`product-${productId}`).remove();
  document.getElementById("carritoContenedor").textContent = totalProducts;
});
function addProductFromFront(productId, cartId) {
  return addProduct(productId, cartId);
}
function deleteProductFromFront(productId) {
  return deleteProduct(productId);
}
function deleteOneProduct(productId, cartId) {
  return deleteProductById(productId, cartId);
}

async function addProduct(productId, cartId) {
  try {
    const socket = io("http://localhost:8080");

    const quantity = 1;
    const newProductId = productId;

    await new Promise((resolve) =>
      socket.emit("addProd", { cartId, newProductId, quantity }, resolve)
    );
  } catch (error) {
    console.error(error);
  }
}

async function addProductToView(productId, cartId) {
  try {
    const socket = io("http://localhost:8080");

    const quantity = 1;
    const newProductId = productId;
    const page = "detailView";
    await new Promise((resolve) =>
      socket.emit("addProdToView", { cartId, newProductId, quantity }, resolve)
    );
    alert("Producto agregado correctamente");
  } catch (error) {
    console.error(error);
  }
}

async function deleteProduct(productId, cartId) {
  try {
    const socket = io("http://localhost:8080");

    const quantity = 1;
    const newProductId = productId;

    await new Promise((resolve) =>
      socket.emit("deleteProd", { cartId, newProductId }, resolve)
    );
  } catch (error) {
    console.error(error);
  }
}

async function deleteProductById(productId, cartId) {
  try {
    const socket = io("http://localhost:8080");

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
