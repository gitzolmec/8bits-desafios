const fs = require("fs").promises;

class ProductDAO {
    constructor(filePath) {
      this.path = filePath;
      this.products = [];
      this.nextId = 1;
      return (async () => {
        await this.loadProducts();
        return this;
      })();
    }
  
    // Cargar productos desde el archivo
    loadProducts = async () => {
      try {
        const data = await fs.readFile(this.path);
        this.products = JSON.parse(data);
        this.nextId =
          this.products.reduce(
            (maxId, product) => Math.max(maxId, product.id),
            0
          ) + 1;
      } catch (error) {
        console.error("Error al cargar productos:", error);
        this.products = [];
      }
    };
  
    // Guardar productos en el archivo
    saveProducts = async () => {
      try {
        const data = JSON.stringify(this.products, null, 2);
        await fs.writeFile(this.path, data);
      } catch (error) {
        console.error("Error al guardar productos:", error.message);
      }
    };
  
    // Agregar un nuevo producto
    addProduct = async (
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
      status
    ) => {
      const product = {
        id: this.nextId++,
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        status,
      };
      this.products.push(product);
      await this.saveProducts();
      console.log(`Producto '${title}' agregado con éxito.`);
    };
  
    // Obtener todos los productos
   getProducts = () => this.products.filter(product => product.status === true);
 
  
    // Obtener un producto por su ID
    getProductById = (id) => {
      const product = this.products.find((product) => product.id === id);
  
      if (!product) {
        console.error("Producto no encontrado.");
      }
  
      return product;
    };
  
    getProductByCode = (code) => {
      const product = this.products.find((product) => product.code === code);
  
      if (!product) {
        console.error(`Producto con código ${code} no encontrado.`);
      }
  
      return product;
    };
    // Actualizar un producto por su ID con nuevos campos
    updateProduct = async (id, updatedFields) => {
      try {
        const index = this.products.findIndex((product) => product.id === id);
  
        if (index === -1) {
          console.error(`Producto con ID ${id} no encontrado.`);
          return false;
        }
  
        this.products[index] = { ...this.products[index], ...updatedFields };
  
        await this.saveProducts();
        console.log(`Producto con ID ${id} actualizado con éxito.`);
        return true; // Retorna true indicando que el producto fue actualizado correctamente.
      } catch (error) {
        console.error(
          `Error al actualizar el producto con ID ${id}: ${error.message}`
        );
      }
    };
  
    // Eliminar un producto por su ID
    deleteProduct = async (id) => {
        try {
          const index = this.products.findIndex((product) => product.id === id);
    
          // Verifica si el producto con el ID especificado no fue encontrado
          if (index === -1) {
            console.error(`Producto con ID ${id} no encontrado.`);
            return false; // Retorna false si el producto no fue encontrado
          }
    
          // Elimina el producto en el índice encontrado
          this.products[index].status = false
    
          // Guarda los productos actualizados en el archivo
          await this.saveProducts();
          console.log(`Producto con ID ${id} eliminado con éxito.`);
          return true; // Retorna true indicando que el producto fue eliminado
        } catch (error) {
          console.error("Error al guardar productos:", error.message);
          return false; // Retorna false en caso de error
        }
      };
  }

module.exports = ProductDAO;
