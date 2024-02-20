const Users = require("../../models/users.model");

class UserDao {
  async getUserById(id) {
    return await Users.findById(id);
  }
}

module.exports = UserDao;
