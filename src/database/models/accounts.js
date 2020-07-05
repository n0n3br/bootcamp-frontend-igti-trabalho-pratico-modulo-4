const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
  conta: { type: Number, required: true },
  agencia: { type: Number, required: true },
  name: { type: String, required: true },
  balance: { type: Number, required: true, min: 0 },
});

module.exports = mongoose.model("Account", schema);
