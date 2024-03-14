const mongoose = require("mongoose");

const ticketCollection = "ticket";

const ticketSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  purchase_datetime: { type: Date, default: Date.now },
  details: [{ title: { type: String }, count: { type: Number } }],
  amount: { type: Number, required: true },
  purchaser: { type: String, required: true },
});

const Tickets = mongoose.model(ticketCollection, ticketSchema);

module.exports = Tickets;
