const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const cartCollection = "cart";

const cartSchema = new mongoose.Schema({
  products: [
    {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "products" },

      quantity: { type: Number },
    },
  ],
});
cartSchema.plugin(mongoosePaginate);
const Carts = mongoose.model(cartCollection, cartSchema);

module.exports = Carts;
