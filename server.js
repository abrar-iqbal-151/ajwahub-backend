const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: function(origin, callback) {
    callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ MongoDB Error:', err));

// Routes
app.use('/api', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api', require('./routes/admin'));
app.use('/api', require('./routes/content'));
app.use('/api', require('./routes/home'));
app.use('/api', require('./routes/upload'));
app.use('/api', require('./routes/shopProducts'));
app.use('/api', require('./routes/wishlist'));
app.use('/api', require('./routes/giftOrders'));
app.use('/api', require('./routes/giftBoxes'));
app.use('/api', require('./routes/contact'));
app.use('/api', require('./routes/ai'));
app.use('/api', require('./routes/orders'));
app.use('/api', require('./routes/videos'));
app.use('/api', require('./routes/premiumProducts'));
app.use('/api/stripe', require('./routes/stripe'));

app.get('/', (req, res) => {
  res.json({
    message: 'AjwaHub Backend API is running!',
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
