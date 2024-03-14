const UserDao = require("../DAO/Mongo/user-dao.mongo");
const formatDate = require("../utils/format-date.util");

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

  const purchaseHistory = await Users.getPurchases(id);

  purchaseHistory.forEach((element) => {
    const defaultDate = element.purchase_datetime;

    const date = formatDate(defaultDate);
    element.purchase_datetime = date;
  });

  return purchaseHistory;
};

module.exports = { getUserById, updateUser, getPurchases };
