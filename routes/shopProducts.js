const express = require('express');
const jwt = require('jsonwebtoken');
const ShopProduct = require('../models/ShopProduct');
const router = express.Router();

const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'secret-key');
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};

const defaultProducts = [
  { id: 1, name: 'Ajwa Dates', arabicName: 'عجوة', price: 1200, weight: '1kg', rating: 4.8, stock: true, image: '/Product 1.png', description: 'Sacred dates from Madinah - Premium A++ Quality', storageNote: 'To maintain freshness and softness, store dates in the refrigerator after receiving the parcel....', category: 'dates' },
  { id: 2, name: 'Medjool Dates', arabicName: 'مجدول', price: 1800, weight: '1kg', rating: 4.7, stock: true, image: '/Product 2.png', description: 'King of dates - Large, soft, and naturally sweet', storageNote: 'To maintain freshness and softness, store dates in the refrigerator after receiving the parcel....', category: 'dates' },
  { id: 3, name: 'Deglet Dates', arabicName: 'دقلة نور', price: 1000, weight: '1kg', rating: 4.5, stock: true, image: '/Product 3.png', description: 'Golden translucent sweetness with delicate flavor', storageNote: 'To maintain freshness and softness, store dates in the refrigerator after receiving the parcel....', category: 'dates' },
  { id: 4, name: 'Zahidi Dates', arabicName: 'زهدي', price: 900, weight: '1kg', rating: 4.4, stock: true, image: '/Product 4.png', description: 'Premium golden variety with firm texture', storageNote: 'To maintain freshness and softness, store dates in the refrigerator after receiving the parcel....', category: 'dates' },
  { id: 5, name: 'Almonds', arabicName: 'لوز', price: 1500, weight: '1kg', rating: 4.6, stock: true, image: '/Product 5.png', description: 'Crunchy nutritious superfood - California Premium', storageNote: 'Store in a cool, dry place to maintain crunchiness.', category: 'dry' },
  { id: 6, name: 'Cashews', arabicName: 'كاجو', price: 1800, weight: '1kg', rating: 4.7, stock: true, image: '/Product 6.png', description: 'Buttery smooth crunch - Premium Jumbo quality', storageNote: 'Store in a cool, dry place to maintain quality.', category: 'dry' },
  { id: 7, name: 'Walnuts', arabicName: 'جوز', price: 2000, weight: '1kg', rating: 4.5, stock: true, image: '/Product 7.png', description: 'Omega-3 rich brain food - Hand-cracked halves', storageNote: 'Store in a cool, dry place.', category: 'dry' },
  { id: 8, name: 'Pistachios', arabicName: 'فستق', price: 2500, weight: '1kg', rating: 4.8, stock: true, image: '/Product 8.png', description: 'Roasted green perfection with natural flavor', storageNote: 'Store in a cool, dry place.', category: 'dry' },
  { id: 9, name: 'Raisins', arabicName: 'زبيب', price: 600, weight: '1kg', rating: 4.2, stock: true, image: '/Product 9.png', description: 'Sun-dried energy boost - naturally sweet', storageNote: 'Store in a cool place.', category: 'dry' },
  { id: 10, name: 'Dried Figs', arabicName: 'تين مجفف', price: 1200, weight: '1kg', rating: 4.4, stock: true, image: '/Product 10.png', description: 'Honey-sweet Mediterranean delight', storageNote: 'Store in a cool, dry place.', category: 'dry' },
  { id: 11, name: 'Hazelnuts', arabicName: 'بندق', price: 1900, weight: '1kg', rating: 4.5, stock: true, image: '/Product 11.png', description: 'Rich buttery kernels - perfect for snacking', storageNote: 'Store in a cool, dry place.', category: 'dry' },
  { id: 12, name: 'Brazil Nuts', arabicName: 'جوز برازيلي', price: 2200, weight: '1kg', rating: 4.3, stock: true, image: '/Product 12.png', description: 'Selenium-rich Amazonian giants', storageNote: 'Store in a cool place.', category: 'dry' },
  { id: 13, name: 'Pecans', arabicName: 'بيكان', price: 2800, weight: '1kg', rating: 4.6, stock: true, image: '/Product 13.png', description: 'Buttery sweet halves - Southern delicacy', storageNote: 'Store in a cool place.', category: 'dry' },
  { id: 14, name: 'Pine Nuts', arabicName: 'صنوبر', price: 3500, weight: '250g', rating: 4.7, stock: true, image: '/Product 14.png', description: 'Gourmet cooking essential - delicate flavor', storageNote: 'Refrigerate after opening.', category: 'dry' },
  { id: 15, name: 'Macadamias', arabicName: 'ماكاداميا', price: 3200, weight: '1kg', rating: 4.8, stock: true, image: '/Product 15.png', description: 'Tropical luxury crunch - Hawaiian paradise', storageNote: 'Store in a cool, dry place.', category: 'dry' },
  { id: 16, name: 'Dried Apricots', arabicName: 'مشمش مجفف', price: 800, weight: '1kg', rating: 4.3, stock: true, image: '/Product 16.png', description: 'Tangy-sweet chewy vitamin-packed treat', storageNote: 'Store in a cool place.', category: 'dry' },
  { id: 17, name: 'Dates Mix', arabicName: 'تشكيلة تمور', price: 1400, weight: '1kg', rating: 4.6, stock: true, image: '/Product 17.png', description: 'Premium assortment of our finest dates', storageNote: 'Refrigerate to maintain freshness.', category: 'dates' },
  { id: 18, name: 'Nuts Mix', arabicName: 'تشكيلة مكسرات', price: 2200, weight: '1kg', rating: 4.7, stock: true, image: '/Product 18.png', description: 'Gourmet blend of premium nuts', storageNote: 'Store in a cool, dry place.', category: 'dry' },
  { id: 19, name: 'Trail Mix', arabicName: 'مزيج الطاقة', price: 1600, weight: '1kg', rating: 4.4, stock: true, image: '/Product 19.png', description: 'Healthy energy blend for active lifestyle', storageNote: 'Store in a cool place.', category: 'dry' },
  { id: 20, name: 'Gift Box', arabicName: 'صندوق هدايا', price: 3000, weight: '1kg', rating: 4.9, stock: true, image: '/Product 20.png', description: 'Luxury gift assortment for special occasions', storageNote: 'Store in a cool place.', category: 'dates' }
];

// GET all
router.get('/shop-products', async (req, res) => {
  try {
    const products = await ShopProduct.find().sort({ id: 1 });
    res.json({ products });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Initialize (Now clears first)
router.post('/shop-products/initialize', verifyAdmin, async (req, res) => {
  try {
    await ShopProduct.deleteMany({});
    await ShopProduct.insertMany(defaultProducts);
    res.json({ message: 'initialized with boutique products' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add new product
router.post('/shop-products', verifyAdmin, async (req, res) => {
  try {
    const { name, price, weight, rating, stock, image, description, category, storageNote, weights, arabicName } = req.body;
    const lastProduct = await ShopProduct.findOne().sort({ id: -1 });
    const newId = lastProduct ? lastProduct.id + 1 : 1;
    const product = await ShopProduct.create({ id: newId, name, price, weight: weight || '1kg', rating: rating || 4.5, stock: stock !== undefined ? stock : true, image: image || '', description: description || '', category: category || 'dates', storageNote, weights, arabicName });
    res.status(201).json({ message: 'Product added', product });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update single product
router.put('/shop-products/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, price, weight, rating, stock, image, description, category, discount, storageNote, weights, arabicName } = req.body;
    const isMongoId = /^[a-f\d]{24}$/i.test(req.params.id);
    const query = isMongoId ? { _id: req.params.id } : { id: Number(req.params.id) };
    const product = await ShopProduct.findOneAndUpdate(
      query,
      { name, price, weight, rating, stock, image, description, category, discount, storageNote, weights, arabicName },
      { new: true }
    );
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Updated', product });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
