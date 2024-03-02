const UserDao = require("../DAO/Mongo/user-dao.mongo");

const Users = new UserDao();

const getUserById = async (tokenId) => {
  return await Users.getUserById(tokenId);
};

module.exports = { getUserById };
