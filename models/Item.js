const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  photoURL: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  availableStock: { type: Number, required: true },
});

const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
