const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  cartId: { type: String, required: true },
  userId: { type: String, required: true },
  items: [
    {
      itemId: { type: String, required: true },
      quantity: { type: Number, required: true },
    },
  ],
});

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart;
