const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');
const User = require('./models/User');
const Item = require('./models/Item');
const Cart = require('./models/Cart');
const Order = require('./models/Order');

const app = express();
const port = 3001;

app.use(express.json());

const mongourl = "mongodb+srv://aghilan:aghilan@aghilan.bhm9eqb.mongodb.net/";

// Connect to MongoDB
mongoose.connect(mongourl)
  .then(() => {
    console.log("DB connected successfully");

    // After DB connection is successful, start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("DB connection error:", err);
  });


// 1. User Routes
// Create a new user
app.post('/api/users', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const userId = uuidv4();
    const newUser = new User({ userId, email, password, role });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user by email (login)
// Get user by email (login)
app.get('/api/users', async (req, res) => {
  try {
    const { email } = req.query;  // Use req.query to get the email from the query string
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// 2. Item Routes
// Create a new item
app.post('/api/items', async (req, res) => {
  try {
    const { name, description, photoURL, price, category, availableStock } = req.body;
    const itemId = uuidv4();
    const newItem = new Item({ itemId, name, description, photoURL, price, category, availableStock });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Cart Routes
// Get cart by userId
app.get('/api/cart/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add item to cart
// Add item to cart
app.post('/api/cart/:userId', async (req, res) => {
  const { userId } = req.params;
  const { itemId, quantity } = req.body;

  try {
    const item = await Item.findOne({ itemId });
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const cart = await Cart.findOne({ userId });
    if (cart) {
      const existingItemIndex = cart.items.findIndex(
        (cartItem) => cartItem.itemId === itemId
      );

      if (existingItemIndex !== -1) {
        cart.items[existingItemIndex].quantity += quantity;
      } else {
        cart.items.push({ itemId, quantity });
      }
      await cart.save();
      return res.status(200).json(cart);
    }

    const newCart = new Cart({
      cartId: uuidv4(),
      userId,
      items: [{ itemId, quantity }],
    });
    const savedCart = await newCart.save();
    res.status(201).json(savedCart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove item from cart
app.delete('/api/cart/:userId/:itemId', async (req, res) => {
  const { userId, itemId } = req.params;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter((item) => item.itemId !== itemId);
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, items } = req.body;
    const totalAmount = items.reduce(
      (total, item) => total + item.quantity * item.price,
      0
    );
    const orderId = uuidv4();
    const newOrder = new Order({ orderId, userId, items, totalAmount, status: 'Pending' });
    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get order by orderId
app.get('/api/orders/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId });
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all orders for a user
app.get('/api/orders/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId });
    res.status(200).json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update order status (e.g., when completed)
app.put('/api/orders/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;

  try {
    const updatedOrder = await Order.findOneAndUpdate(
      { orderId },
      { status },
      { new: true }
    );
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route not found' });
});
app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message });
});
