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

    const details = purchaseHistory.map((item) => item.details);

    purchaseHistory.forEach((item) => {
      item.details = item.details.map((detail) => detail.title);
    });

    return purchaseHistory;
  }

  async deleteUser(id) {
    return await Users.findByIdAndDelete(id);
  }

  async getUserListForAdmins() {
    const list = [];
    const user = await Users.find({}, { __v: 0 });
    user.forEach((users) => {
      const first_name = users.first_name;
      const last_name = users.last_name;
      const email = users.email;
      const role = users.role;
      list.push({ first_name, last_name, email, role });
    });

    return list;
  }
}

module.exports = UserDao;
