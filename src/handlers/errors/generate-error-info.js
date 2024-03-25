const generateUserErrorInfo = (user) => {
  return `One or more properties were incomplete or note valid.
    List of required properties:
    * name   : needs to be a string, received ${user.first_name},
    * lastname   : needs to be a string, received ${user.last_name},
    * email   : needs to be a string, received ${user.email},
    * age   :needs to be a date, received ${user.age},
    `;
};

const deleteProductErrorInfo = (id) => {
  return `The product with id ${id} does not exist`;
};

const productIdNotFound = (id) => {
  return `The product with id ${id} does not exist`;
};

const createProductErrorInfo = (
  title,
  description,
  price,
  thumbnail,
  code,
  stock,
  status,
  category
) => {
  return `One or more properties were incomplete or note valid.
    List of required properties:
    * title   : needs to be a string, received ${title},
    * description   : needs to be a string, received ${description},
    * price   : needs to be a number, received ${price},
    * thumbnail   : needs to be a string, received ${thumbnail},
    * code   : needs to be a string, received ${code},
    * stock   : needs to be a number, received ${stock},
    * status   : needs to be a boolean, received ${status},
    * category   : needs to be a string, received ${category},
    `;
};

const updateProductErrorInfo = (
  title,
  description,
  price,
  thumbnail,
  code,
  stock,
  status,
  category
) => {
  return `One or more properties were incomplete or note valid.
    List of required properties:
    * title   : needs to be a string, received ${title},
    * description   : needs to be a string, received ${description},
    * price   : needs to be a string, received ${price},   : needs to be a string, received ${title},
    * description   : needs to be a string, received ${description},
    * thumbnail   : needs to be a string, received ${thumbnail},
    * code   : needs to be a string, received ${code},
    * stock   : needs to be a number, received ${stock},
    * status   : needs to be a boolean, received ${status},
    * category   : needs to be a string, received ${category},
    `;
};

module.exports = {
  generateUserErrorInfo,
  deleteProductErrorInfo,
  productIdNotFound,
  createProductErrorInfo,
  updateProductErrorInfo,
};
