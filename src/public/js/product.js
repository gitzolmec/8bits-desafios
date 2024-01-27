// Conexión al servidor de Socket.io
const socket = io("http://localhost:8080");

function addProductFromFront(productId) {
  console.log(productId, "front");

  return addProducts(productId);
}

async function addProducts(productId) {
  try {
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

socket.on("updateProducts", (products) => {
  console.log("Productos actualizados:", products);

  updateProductList(products);
});

socket.on("addProduct", function (product) {
  // Llamar a la función para agregar un nuevo producto a la lista
  addProduct(product);
});

// async function addProducts(productId) {
//   try {
//     const socket = io("http://localhost:8080");

//     const cartId = document.getElementById("cartId").textContent;
//     const quantity = 1;
//     const newProductId = productId;
//     console.log(newProductId, "new");
//     // Utiliza await para asegurarte de que la emisión se realice antes de continuar
//     await new Promise((resolve) =>
//       socket.emit("addProd", { cartId, newProductId, quantity }, resolve)
//     );
//   } catch (error) {
//     console.error(error);
//     // Puedes manejar el error aquí según tus necesidades
//   }
// }

// Función para agregar un nuevo producto a la lista
function addProduct(product) {
  // Obtener el contenedor de la lista de productos
  const productListContainer = document.getElementById("product-list");
  // Llamar a la función para agregar el producto a la vista
  addProductToView(product, productListContainer);
}

// Función para agregar un producto a la vista
function addProductToView(product, container) {
  // Crear la tarjeta del producto y agregarla al contenedor
  const productCard = createProductCard(product);
  container.appendChild(productCard);
}

// Función para actualizar la lista de productos
function updateProductList(products) {
  console.log("Actualizando lista de productos:", products);
  const productListContainer = document.getElementById("product-list");

  // Limpiar la lista actual
  productListContainer.innerHTML = "";
  console.log(products);
  // Crear y agregar tarjetas de producto para cada producto en la nueva lista
  products.forEach((product) => {
    const productCard = createProductCard(product);
    productListContainer.appendChild(productCard);
  });
}

// Función para crear la tarjeta de un producto
function createProductCard(product) {
  if (
    !product._id ||
    !product.thumbnail ||
    !product.title ||
    !product.description ||
    !product.price
  ) {
    return null; // No crear la tarjeta si falta algún campo importante
  }
  const productCard = document.createElement("div");
  productCard.className = "card mt-3 mx-2"; // Clases Bootstrap para tarjetas
  productCard.style.width = "18rem";

  const productImage = document.createElement("img");
  productImage.src = product.thumbnail;
  productImage.className = "card-img-top mt-2 img-info";
  productImage.setAttribute(
    "onclick",
    `location.href='/api/products/details/${product._id}'`
  );
  productImage.alt = "Card image cap";

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const productTitle = document.createElement("h5");
  productTitle.className = "card-title";
  productTitle.textContent = product.title;

  const productDescription = document.createElement("p");
  productDescription.className = "card-text";
  productDescription.textContent = product.description;

  const productPrice = document.createElement("p");
  productPrice.className = "card-text";
  productPrice.textContent = `Precio: $${product.price}`;

  const addButton = document.createElement("button");
  addButton.className = "btn btn-primary me-2";
  addButton.id = product._id;
  addButton.textContent = "Agregar";
  addButton.setAttribute("onclick", `addProductFromFront('${product._id}')`);

  cardBody.appendChild(productTitle);
  cardBody.appendChild(productDescription);
  cardBody.appendChild(productPrice);
  cardBody.appendChild(addButton);

  productCard.appendChild(productImage);
  productCard.appendChild(cardBody);

  return productCard;
}
