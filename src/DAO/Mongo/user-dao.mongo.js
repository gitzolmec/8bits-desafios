const Users = require("../../models/users.model");

class UserDao {
  async getUserById(id) {
    return await Users.findById(id);
  }
  async updateUser(id, purchaseId) {
    return await Users.findByIdAndUpdate(id, {
      $push: { purchase_history: purchaseId },
    });
  }

  async getPurchases(id) {
    const purchases = await Users.findById(id)
      .populate("purchase_history")
      .lean();

    const purchaseHistory = purchases.purchase_history;

    return purchaseHistory;
  }

  async deleteUser(id) {
    return await Users.findByIdAndDelete(id);
  }
}

module.exports = UserDao;
