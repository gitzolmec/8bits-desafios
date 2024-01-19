const fs = require("fs").promises;

class CartManager {
  constructor(filePath) {
    this.path = filePath;
    this.carts = [];
    this.nextId = 1;
    return (async () => {
      await this.loadCarts();
      return this;
    })();
  }

  // Cargar carritos desde el archivo
  loadCarts = async () => {
    try {
      const data = await fs.readFile(this.path);
      this.carts = JSON.parse(data);
      this.nextId =
        this.carts.reduce((maxId, cart) => Math.max(maxId, cart.id), 0) + 1;
    } catch (error) {
      this.carts = [];
    }
  };

  // Guardar carritos en el archivo
  saveCarts = async () => {
    try {
      const data = JSON.stringify(this.carts, null, 2);
      await fs.writeFile(this.path, data);
    } catch (error) {
      console.error("Error al guardar carritos:", error.message);
    }
  };

  // Agregar un nuevo carrito
  addCart = async () => {
    const cart = {
      id: this.nextId++,
      products: [],
    };
    this.carts.push(cart);
    await this.saveCarts();
    console.log(`Carrito con ID ${cart.id} creado con éxito.`);
    return cart;
  };

  // Obtener todos los carritos
  getCarts = () => this.carts;

  // Obtener un carrito por su ID
  getCartById = (id) => {
    const cart = this.carts.find((cart) => cart.id === id);

    if (!cart) {
      console.error("Carrito no encontrado.");
    }

    return cart;
  };

  // Agregar un producto al carrito
  addProductToCart = async (cartId, productId, quantity = 1) => {
    const cart = this.carts.find((cart) => cart.id === cartId);

    if (!cart) {
      console.error("Carrito no encontrado.");
      return;
    }

    const existingProduct = cart.products.find((item) => item.id === productId);

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ id: productId, quantity });
    }

    await this.saveCarts();
    console.log(
      `Producto con ID ${productId} agregado al carrito ${cartId} con éxito.`
    );
  };
}

module.exports = CartManager;
