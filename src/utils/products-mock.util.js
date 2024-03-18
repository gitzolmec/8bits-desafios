const { faker } = require("@faker-js/faker");
const products = require("../test/products-test");

const generateProducts = () => {
  const products = [];

  for (let i = 0; i < 100; i++) {
    products.push(generateProduct());
    products[i].N = products.length;
  }
  return products;
};

const generateProduct = () => {
  return {
    _id: faker.database.mongodbObjectId(),
    title: faker.helpers.arrayElement([...products]),
    description: faker.commerce.productDescription(),
    price: faker.commerce.price(),
    thumbnail: faker.image.url(),
    code: faker.number.int(999999),
    stock: faker.number.int(99),
    category: faker.helpers.arrayElement(["Nintendo", "PS5"]),
    status: true,
    id: faker.number.int(5),
  };
};

module.exports = generateProducts;
