const UserDao = require("../DAO/Mongo/user-dao.mongo");
const formatDate = require("../utils/format-date.util");
const totalQuantity = require("../utils/total-quantity.util");

const Users = new UserDao();

const getUserById = async (tokenId) => {
  return await Users.getUserById(tokenId);
};

const updateUser = async (id, data) => {
  return await Users.updateUser(id, data);
};

const getPurchases = async (req) => {
  const tokenid = req.user.id;

  const userId = await getUserById(tokenid);
  const id = userId._id;
  const { role, first_name, last_name, cartId } = userId;
  const quantity = await totalQuantity(cartId);
  const purchaseHistory = await Users.getPurchases(id);

  purchaseHistory.forEach((element) => {
    const defaultDate = element.purchase_datetime;

    const date = formatDate(defaultDate);
    element.purchase_datetime = date;
  });

  return { purchaseHistory, role, first_name, last_name, quantity };
};

const deleteUser = async (id) => {
  return await Users.deleteUser(id);
};

const getUserListForAdmins = async () => {
  return await Users.getUserListForAdmins();
};

module.exports = {
  getUserById,
  updateUser,
  getPurchases,
  deleteUser,
  getUserListForAdmins,
};
