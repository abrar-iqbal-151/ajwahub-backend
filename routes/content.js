const express = require('express');
const jwt = require('jsonwebtoken');
const { Hero, Product, Review } = require('../models/Content');

const router = express.Router();

const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret-key');
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ── INITIALIZE ──
router.post('/content/initialize', verifyAdmin, async (req, res) => {
  try {
    const heroCount = await Hero.countDocuments();
    const productCount = await Product.countDocuments();
    const reviewCount = await Review.countDocuments();
    if (heroCount > 0 || productCount > 0 || reviewCount > 0) {
      return res.json({ message: 'already exists' });
    }

    const heroes = [
      { key: 'hero1', title: 'Best Ajwa Dates', text: 'Enjoy the sweet taste of real Ajwa dates from Madinah. We pick each date by hand to make sure they are fresh, sweet, and healthy. These dates have been loved by people for many years. Try the best quality dates from nature.', video: '/video(1).mp4' },
      { key: 'hero2', title: 'Many Types', text: 'Check out our different types of dates. We have sweet Sukkari dates that taste like honey, and rich Lahori dates with traditional flavor. Each type has its own special taste and is good for your health. See how good quality makes a difference.', video: '/video(3).mp4' }
    ];
    const products = [
      { id: 1, name: 'Ajwa Dates', price: 1200, weight: '1kg', rating: 4.8, stock: true, image: '/Product 1.png', description: '🌟 Sacred Ajwa dates from Madinah - naturally sweet, nutrient-rich, perfect for daily wellness.', discount: '50% OFF' },
      { id: 2, name: 'Medjool Dates', price: 1800, weight: '1kg', rating: 4.7, stock: true, image: '/Product 2.png', description: '👑 King of dates - large, soft, and luxuriously sweet Medjool variety.', discount: '50% OFF' },
      { id: 3, name: 'Deglet Dates', price: 1000, weight: '1kg', rating: 4.5, stock: true, image: '/Product 3.png', description: '✨ Golden translucent Deglet Noor - delicate sweetness with chewy texture.', discount: '50% OFF' },
      { id: 4, name: 'Zahidi Dates', price: 900, weight: '1kg', rating: 4.4, stock: true, image: '/Product 4.png', description: '🥇 Premium golden Zahidi dates - firm texture with rich, caramel-like flavor.', discount: '50% OFF' },
      { id: 5, name: 'Almonds', price: 1500, weight: '1kg', rating: 4.6, stock: true, image: '/Product 5.png', description: '🌰 Crunchy premium almonds - heart-healthy protein powerhouse for daily snacking.', discount: '50% OFF' },
      { id: 6, name: 'Cashews', price: 1800, weight: '1kg', rating: 4.7, stock: true, image: '/Product 6.png', description: '🥜 Buttery smooth cashews - creamy texture with rich, satisfying taste.', discount: '50% OFF' },
      { id: 7, name: 'Walnuts', price: 2000, weight: '1kg', rating: 4.5, stock: true, image: '/Product 7.png', description: '🧠 Brain-shaped walnuts - omega-3 rich halves for mental wellness.', discount: '50% OFF' },
      { id: 8, name: 'Pistachios', price: 2500, weight: '1kg', rating: 4.8, stock: true, image: '/Product 8.png', description: '💚 Roasted green pistachios - perfectly salted, fun-to-crack premium nuts.', discount: '50% OFF' },
      { id: 9, name: 'Raisins', price: 600, weight: '1kg', rating: 4.2, stock: true, image: '/Product 9.png', description: '🍇 Sun-dried golden raisins - naturally sweet, chewy energy boosters.', discount: '50% OFF' },
      { id: 10, name: 'Dried Figs', price: 1200, weight: '1kg', rating: 4.4, stock: true, image: '/Product 10.png', description: '🌸 Soft dried figs - honey-sweet with delicate floral notes and seeds.', discount: '50% OFF' },
      { id: 11, name: 'Hazelnuts', price: 1900, weight: '1kg', rating: 4.5, stock: true, image: '/Product 11.png', description: '🌰 Crunchy hazelnut kernels - rich, buttery flavor perfect for snacking.', discount: '50% OFF' },
      { id: 12, name: 'Brazil Nuts', price: 2200, weight: '1kg', rating: 4.3, stock: true, image: '/Product 12.png', description: '🌳 Large Brazil nuts - selenium-rich, creamy texture with earthy taste.', discount: '50% OFF' },
      { id: 13, name: 'Pecans', price: 2800, weight: '1kg', rating: 4.6, stock: true, image: '/Product 13.png', description: '🍂 Buttery pecan halves - sweet, rich flavor with smooth, tender texture.', discount: '50% OFF' },
      { id: 14, name: 'Pine Nuts', price: 3500, weight: '1kg', rating: 4.7, stock: true, image: '/Product 14.png', description: '🌲 Premium pine nuts - delicate, buttery taste perfect for gourmet cooking.', discount: '50% OFF' },
      { id: 15, name: 'Macadamias', price: 3200, weight: '1kg', rating: 4.8, stock: true, image: '/Product 15.png', description: '🏝️ Creamy macadamia nuts - tropical luxury with rich, buttery crunch.', discount: '50% OFF' },
      { id: 16, name: 'Dried Apricots', price: 800, weight: '1kg', rating: 4.3, stock: true, image: '/Product 16.png', description: '🍑 Sweet dried apricots - tangy-sweet flavor with soft, chewy texture.', discount: '50% OFF' },
      { id: 17, name: 'Dates Mix', price: 1400, weight: '1kg', rating: 4.6, stock: true, image: '/Product 17.png', description: '🎯 Premium dates variety pack - multiple flavors in one convenient package.', discount: '50% OFF' },
      { id: 18, name: 'Nuts Mix', price: 2200, weight: '1kg', rating: 4.7, stock: true, image: '/Product 18.png', description: '🥜 Gourmet mixed nuts - perfect blend of premium varieties for every taste.', discount: '50% OFF' },
      { id: 19, name: 'Trail Mix', price: 1600, weight: '1kg', rating: 4.4, stock: true, image: '/Product 19.png', description: '🥾 Healthy trail mix - energizing blend of nuts, fruits, and natural goodness.', discount: '50% OFF' },
      { id: 20, name: 'Gift Box', price: 3000, weight: '1kg', rating: 4.9, stock: true, image: '/Product 20.png', description: '🎁 Luxury gift box - premium assortment beautifully packaged for special occasions.', discount: '50% OFF' }
    ];
    const reviews = [
      { name: 'Ahmed Khan', text: 'Best quality dates! Fresh and delivered on time.', rating: 5 },
      { name: 'Fatima Ali', text: 'Amazing packaging and premium quality. Highly recommended!', rating: 5 },
      { name: 'Muhammad Hassan', text: 'Excellent service and authentic products. Very helpful team.', rating: 5 },
      { name: 'Sara Ahmed', text: 'Perfect taste and freshness. Will order again!', rating: 4.8 }
    ];

    for (const h of heroes) await Hero.findOneAndUpdate({ key: h.key }, h, { upsert: true });
    await Product.insertMany(products);
    await Review.insertMany(reviews);

    res.json({ message: 'initialized' });
  } catch { res.status(500).json({ message: 'Error initializing data' }); }
});

// ── HEROES ──
router.get('/content/heroes', async (req, res) => {
  try {
    const heroes = await Hero.find();
    res.json({ heroes });
  } catch { res.status(500).json({ message: 'Error fetching heroes' }); }
});

router.put('/content/hero/:key', verifyAdmin, async (req, res) => {
  try {
    const { title, text, video } = req.body;
    const hero = await Hero.findOneAndUpdate(
      { key: req.params.key },
      { title, text, video },
      { new: true, upsert: true }
    );
    res.json({ message: 'Hero updated', hero });
  } catch { res.status(500).json({ message: 'Error updating hero' }); }
});

// ── PRODUCTS ──
router.get('/content/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ id: 1 });
    res.json({ products });
  } catch { res.status(500).json({ message: 'Error fetching products' }); }
});

router.post('/content/product', verifyAdmin, async (req, res) => {
  try {
    const { name, price, discount, stock, description, rating, image, weight, category } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Name and price required' });
    const last = await Product.findOne().sort({ id: -1 });
    const newId = last ? last.id + 1 : 1;
    const product = await Product.create({ id: newId, name, price, discount: discount || '', stock: stock !== undefined ? stock : true, description: description || '', rating: rating || 4.5, image: image || '', weight: weight || '1kg', category: category || 'dates' });
    res.status(201).json({ message: 'Product added', product });
  } catch { res.status(500).json({ message: 'Error adding product' }); }
});

router.put('/content/product/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, price, discount, stock, description, rating, image, category } = req.body;
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      { name, price, discount, stock, description, rating, image, category },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product updated', product });
  } catch { res.status(500).json({ message: 'Error updating product' }); }
});

router.delete('/content/product/:id', verifyAdmin, async (req, res) => {
  try {
    await Product.findOneAndDelete({ id: req.params.id });
    res.json({ message: 'Product deleted' });
  } catch { res.status(500).json({ message: 'Error deleting product' }); }
});

// ── REVIEWS ──
router.get('/content/reviews', async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json({ reviews });
  } catch { res.status(500).json({ message: 'Error fetching reviews' }); }
});

router.post('/content/review', verifyAdmin, async (req, res) => {
  try {
    const { name, text, rating } = req.body;
    const review = await Review.create({ name, text, rating });
    res.status(201).json({ message: 'Review added', review });
  } catch { res.status(500).json({ message: 'Error adding review' }); }
});

router.put('/content/review/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, text, rating } = req.body;
    const review = await Review.findByIdAndUpdate(req.params.id, { name, text, rating }, { new: true });
    if (!review) return res.status(404).json({ message: 'Review not found' });
    res.json({ message: 'Review updated', review });
  } catch { res.status(500).json({ message: 'Error updating review' }); }
});

router.delete('/content/review/:id', verifyAdmin, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch { res.status(500).json({ message: 'Error deleting review' }); }
});

module.exports = router;
