const express = require('express');
const jwt = require('jsonwebtoken');
const { Hero, Product, Review, Feature, DeliveryMap, AboutSection, PaymentIcons, AiSection } = require('../models/Content');


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
    const feature = {
      key: 'feature1',
      title: 'Why Choose AjwaHub?',
      description: 'We bring you the finest handpicked dates and dry fruits straight from the source. Every product is carefully selected for freshness, taste, and nutritional value.',
      features: [
        { icon: '✅', text: '100% Natural & Pure' },
        { icon: '📦', text: 'Premium Packaging' },
        { icon: '🚚', text: 'Fast Delivery Across Pakistan' },
        { icon: '⭐', text: 'Trusted by 50,000+ Customers' }
      ],
      images: ['/Product 1.png', '/Product 2.png', '/Product 3.png', '/Product 4.png']
    };
    const products = [
      { id: 1, name: 'Brown Dates', arabicName: 'عجوة بني', price: 1200, weight: '1kg', rating: 4.8, stock: true, image: '/Product 1.png', description: '🌟 Premium Brown dates - naturally sweet, nutrient-rich, perfect for daily wellness.', discount: '50% OFF', storageNote: 'To maintain freshness and softness, store dates in the refrigerator after receiving the parcel....', weights: [
        { label: '1kg Special Box', savings: '' },
        { label: '500g Mini Box', savings: '' },
        { label: '2kg Briefcase Box', savings: '(Save Rs 500)' },
        { label: '3kg Saudi Box', savings: '(Save Rs 700)' },
        { label: '5kg Family Carton', savings: '(Save Rs 1500)' }
      ]},
      { id: 2, name: 'Ajwa Dates', arabicName: 'عجوة', price: 1800, weight: '1kg', rating: 4.7, stock: true, image: '/Product 2.png', description: '👑 Sacred Ajwa dates from Madinah - naturally sweet and luxuriously soft.', discount: '50% OFF', storageNote: 'To maintain freshness and softness, store dates in the refrigerator after receiving the parcel....', weights: [
        { label: '1kg Special Box', savings: '' },
        { label: '500g Mini Box', savings: '' },
        { label: '2kg Briefcase Box', savings: '(Save Rs 500)' },
        { label: '3kg Saudi Box', savings: '(Save Rs 700)' },
        { label: '5kg Family Carton', savings: '(Save Rs 1500)' }
      ]},
      { id: 3, name: 'Deglet Dates', arabicName: 'دجلة', price: 1000, weight: '1kg', rating: 4.5, stock: true, image: '/Product 3.png', description: '✨ Golden translucent Deglet Noor - delicate sweetness with chewy texture.', discount: '50% OFF', storageNote: 'To maintain freshness and softness, store dates in the refrigerator after receiving the parcel....', weights: [
        { label: '1kg Special Box', savings: '' },
        { label: '500g Mini Box', savings: '' },
        { label: '2kg Briefcase Box', savings: '(Save Rs 500)' },
        { label: '3kg Saudi Box', savings: '(Save Rs 700)' },
        { label: '5kg Family Carton', savings: '(Save Rs 1500)' }
      ]},
      { id: 4, name: 'Zahidi Dates', arabicName: 'زاهدي', price: 900, weight: '1kg', rating: 4.4, stock: true, image: '/Product 4.png', description: '🥇 Premium golden Zahidi dates - firm texture with rich, caramel-like flavor.', discount: '50% OFF', storageNote: 'To maintain freshness and softness, store dates in the refrigerator after receiving the parcel....', weights: [
        { label: '1kg Special Box', savings: '' },
        { label: '500g Mini Box', savings: '' },
        { label: '2kg Briefcase Box', savings: '(Save Rs 500)' },
        { label: '3kg Saudi Box', savings: '(Save Rs 700)' },
        { label: '5kg Family Carton', savings: '(Save Rs 1500)' }
      ]},
      { id: 5, name: 'Almonds', arabicName: 'لوز', price: 1500, weight: '1kg', rating: 4.6, stock: true, image: '/Product 5.png', description: '🌰 Crunchy premium almonds - heart-healthy protein powerhouse.', discount: '50% OFF', storageNote: 'Store in a cool, dry place to maintain crunchiness.', weights: [
        { label: '1kg Special Box', savings: '' },
        { label: '500g Mini Box', savings: '' }
      ]},
      { id: 6, name: 'Cashews', arabicName: 'كاجو', price: 1800, weight: '1kg', rating: 4.7, stock: true, image: '/Product 6.png', description: '🥜 Buttery smooth cashews - creamy texture with rich taste.', discount: '50% OFF', storageNote: 'Store in a cool, dry place.', weights: [
        { label: '1kg Special Box', savings: '' },
        { label: '500g Mini Box', savings: '' }
      ]}
    ];
    const reviews = [
      { name: 'Ahmed Khan', text: 'Best quality dates! Fresh and delivered on time.', rating: 5 },
      { name: 'Fatima Ali', text: 'Amazing packaging and premium quality. Highly recommended!', rating: 5 },
      { name: 'Muhammad Hassan', text: 'Excellent service and authentic products. Very helpful team.', rating: 5 },
      { name: 'Sara Ahmed', text: 'Perfect taste and freshness. Will order again!', rating: 4.8 }
    ];

    const aiSection = {
      key: 'aiSection1',
      badge: 'AI POWERED WELLNESS',
      title: 'Personalized Health with AjwaHub Intelligence',
      description: 'Step into the future of nutrition. Our proprietary AI analyzes your wellness goals to recommend the perfect date varieties and nutritional plans tailored specifically for your lifestyle.',
      video: '/ai-preview.mp4',
      features: [
        { icon: '🤖', title: 'Smart Recommendations', text: 'AI-driven product selection based on your health profile.' },
        { icon: '🧠', title: 'Nutritional Insights', text: 'Deep data on mineral content and health benefits.' },
        { icon: '⚡', title: 'Instant Assistance', text: '24/7 support for all your health and product queries.' },
        { icon: '📈', title: 'Wellness Tracking', text: 'Monitor your journey towards a healthier life.' }
      ]
    };

    for (const h of heroes) await Hero.findOneAndUpdate({ key: h.key }, h, { upsert: true });
    await Feature.findOneAndUpdate({ key: feature.key }, feature, { upsert: true });
    await AiSection.findOneAndUpdate({ key: aiSection.key }, aiSection, { upsert: true });
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
    const { name, arabicName, price, discount, stock, description, rating, image, detailImage, weight, category, storageNote, weights } = req.body;
    if (!name || !price) return res.status(400).json({ message: 'Name and price required' });
    const last = await Product.findOne().sort({ id: -1 });
    const newId = last ? last.id + 1 : 1;
    const product = await Product.create({ 
      id: newId, 
      name, 
      arabicName: arabicName || '',
      price, 
      discount: discount || '', 
      stock: stock !== undefined ? stock : true, 
      description: description || '', 
      rating: rating || 4.5, 
      image: image || '', 
      detailImage: detailImage || '', 
      weight: weight || '1kg', 
      category: category || 'dates',
      storageNote: storageNote || '',
      weights: weights || []
    });
    res.status(201).json({ message: 'Product added', product });
  } catch { res.status(500).json({ message: 'Error adding product' }); }
});

router.put('/content/product/:id', verifyAdmin, async (req, res) => {
  try {
    const { name, arabicName, price, discount, stock, description, rating, image, detailImage, category, storageNote, weights } = req.body;
    const product = await Product.findOneAndUpdate(
      { id: req.params.id },
      { name, arabicName, price, discount, stock, description, rating, image, detailImage, category, storageNote, weights },
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

// ── FEATURE ──
router.get('/content/feature', async (req, res) => {
  try {
    let feature = await Feature.findOne({ key: 'feature1' });
    if (!feature) {
      feature = await Feature.create({
        key: 'feature1',
        title: 'Why Choose AjwaHub?',
        description: 'We bring you the finest handpicked dates and dry fruits straight from the source. Every product is carefully selected for freshness, taste, and nutritional value.',
        images: ['/Product 1.png', '/Product 2.png', '/Product 3.png', '/Product 4.png'],
        features: [
          { icon: '✅', text: '100% Natural & Pure' },
          { icon: '📦', text: 'Premium Packaging' },
          { icon: '🚚', text: 'Fast Delivery Across Pakistan' },
          { icon: '⭐', text: 'Trusted by 50,000+ Customers' }
        ]
      });
    }
    res.json({ feature });
  } catch { res.status(500).json({ message: 'Error fetching feature' }); }
});

router.put('/content/feature', verifyAdmin, async (req, res) => {
  try {
    const { title, description, images, features } = req.body;
    const feature = await Feature.findOneAndUpdate(
      { key: 'feature1' },
      { title, description, images, features },
      { new: true, upsert: true }
    );
    res.json({ message: 'Feature updated', feature });
  } catch { res.status(500).json({ message: 'Error updating feature' }); }
});

// ── DELIVERY MAP ──
router.get('/content/delivery-map', async (req, res) => {
  try {
    let deliveryMap = await DeliveryMap.findOne({ key: 'deliveryMap1' });
    if (!deliveryMap) {
      deliveryMap = await DeliveryMap.create({
        key: 'deliveryMap1',
        title: 'We Deliver Across Pakistan',
        mapImage: '/pakistan-delivery-map.png'
      });
    }
    res.json({ deliveryMap });
  } catch { res.status(500).json({ message: 'Error fetching delivery map' }); }
});

router.put('/content/delivery-map', verifyAdmin, async (req, res) => {
  try {
    const { title, mapImage } = req.body;
    const deliveryMap = await DeliveryMap.findOneAndUpdate(
      { key: 'deliveryMap1' },
      { title, mapImage },
      { new: true, upsert: true }
    );
    res.json({ message: 'Delivery map updated', deliveryMap });
  } catch { res.status(500).json({ message: 'Error updating delivery map' }); }
});

// ── ABOUT SECTION ──
router.get('/content/about', async (req, res) => {
  try {
    let about = await AboutSection.findOne({ key: 'about1' });
    if (!about) {
      about = await AboutSection.create({
        key: 'about1',
        title: 'How Our Dates Are Grown',
        paragraphs: [
          'Our premium dates are cultivated by skilled farmers who have perfected the art of date farming over generations. The journey begins with carefully selected date palm trees planted in nutrient-rich soil.',
          'Farmers meticulously water the palms using traditional irrigation methods, ensuring each tree receives the perfect amount of moisture. The dates are hand-pollinated during the flowering season to guarantee the best quality fruit.',
          'As the dates ripen under the warm sun, they develop their natural sweetness and rich flavor. Each date is carefully harvested by hand at peak ripeness, then sorted and packaged to preserve its freshness and nutritional value.',
          "From farm to your table, we ensure every date meets our strict quality standards, bringing you the authentic taste of nature's finest superfood."
        ],
        images: ['/dates-farming.jpg', '/Product 1.png', '/Product 2.png', '/Product 3.png']
      });
    }
    res.json({ about });
  } catch { res.status(500).json({ message: 'Error fetching about section' }); }
});

router.put('/content/about', verifyAdmin, async (req, res) => {
  try {
    const { title, paragraphs, images } = req.body;
    const about = await AboutSection.findOneAndUpdate(
      { key: 'about1' },
      { title, paragraphs, images },
      { new: true, upsert: true }
    );
    res.json({ message: 'About section updated', about });
  } catch { res.status(500).json({ message: 'Error updating about section' }); }
});

// ── PAYMENT ICONS ──
router.get('/content/payment-icons', async (req, res) => {
  try {
    let payment = await PaymentIcons.findOne({ key: 'payment1' });
    if (!payment) payment = await PaymentIcons.create({ key: 'payment1', icons: [] });
    res.json({ icons: payment.icons });
  } catch { res.status(500).json({ message: 'Error fetching payment icons' }); }
});

// ── AI SECTION ──
router.get('/content/ai-section', async (req, res) => {
  try {
    let ai = await AiSection.findOne({ key: 'aiSection1' });
    if (!ai) {
      ai = await AiSection.create({
        key: 'aiSection1',
        badge: 'AI POWERED WELLNESS',
        title: 'Personalized Health with AjwaHub Intelligence',
        description: 'Step into the future of nutrition. Our proprietary AI analyzes your wellness goals to recommend the perfect date varieties and nutritional plans tailored specifically for your lifestyle.',
        video: '/ai-preview.mp4',
        features: [
          { icon: '🤖', title: 'Smart Recommendations', text: 'AI-driven product selection based on your health profile.' },
          { icon: '🧠', title: 'Nutritional Insights', text: 'Deep data on mineral content and health benefits.' },
          { icon: '⚡', title: 'Instant Assistance', text: '24/7 support for all your health and product queries.' },
          { icon: '📈', title: 'Wellness Tracking', text: 'Monitor your journey towards a healthier life.' }
        ]
      });
    }
    res.json({ aiSection: ai });
  } catch { res.status(500).json({ message: 'Error fetching AI section' }); }
});

router.put('/content/ai-section', verifyAdmin, async (req, res) => {
  try {
    const { badge, title, description, video, features } = req.body;
    const ai = await AiSection.findOneAndUpdate(
      { key: 'aiSection1' },
      { badge, title, description, video, features },
      { new: true, upsert: true }
    );
    res.json({ message: 'AI section updated', aiSection: ai });
  } catch { res.status(500).json({ message: 'Error updating AI section' }); }
});

router.put('/content/payment-icons', verifyAdmin, async (req, res) => {
  const { icons } = req.body;
  const payment = await PaymentIcons.findOneAndUpdate(
    { key: 'payment1' },
    { icons },
    { new: true, upsert: true }
  );
  res.json({ message: 'Payment icons updated', icons: payment.icons });
});


module.exports = router;
