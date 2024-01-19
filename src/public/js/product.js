document.addEventListener("DOMContentLoaded", function () {
  // Conexión al servidor de Socket.io
  const socket = io("http://localhost:8080");

  // Escuchar el evento 'updateProducts' emitido desde el servidor
  socket.on("updateProducts", function (data) {
    // Llamar a la función para actualizar la lista de productos
    updateProductList(data);
  });

  // Escuchar el evento 'addProduct' emitido desde el servidor al agregar un producto
  socket.on("addProduct", function (product) {
    // Llamar a la función para agregar un nuevo producto a la lista
    addProduct(product);
  });

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
  function updateProductList(data) {
    if (data.deleted) {
      // Eliminar el producto de la lista
      const deletedProductElement = document.getElementById(
        `product-${data._id}`
      );
      if (deletedProductElement) {
        deletedProductElement.remove();
      }
    }
  }

  // Función para crear la tarjeta de un producto
  function createProductCard(product) {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    productCard.id = `product-${product._id}`;

    const productImage = document.createElement("img");
    productImage.src = product.thumbnail;
    productImage.className = "product-image";
    productImage.alt = "Producto";

    const productDetails = document.createElement("div");
    productDetails.className = "product-details";

    const productTitle = document.createElement("h5");
    productTitle.className = "product-title";
    productTitle.textContent = product.title;

    const productDescription = document.createElement("p");
    productDescription.className = "product-description";
    productDescription.textContent = product.description;

    const productPrice = document.createElement("p");
    productPrice.className = "product-price";
    productPrice.textContent = `Precio: $${product.price}`;

    productDetails.appendChild(productTitle);
    productDetails.appendChild(productDescription);
    productDetails.appendChild(productPrice);

    productCard.appendChild(productImage);
    productCard.appendChild(productDetails);

    return productCard;
  }
});
