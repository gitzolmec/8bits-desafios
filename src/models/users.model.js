const mongoose = require("mongoose");

const userCollection = "user";

const userSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  age: Number,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  githubId: Number,
  githubUsername: String,
  gmailId: Number,
  facebookId: Number,
  cartId: mongoose.Schema.Types.ObjectId,
  purchase_history: [{ type: mongoose.Schema.Types.ObjectId, ref: "ticket" }],
});

const Users = mongoose.model(userCollection, userSchema);

module.exports = Users;
