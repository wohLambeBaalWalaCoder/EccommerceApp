const express = require('express');
const router = express.Router();
const {
  getProducts,
  getFeaturedProducts,
  getCategories,
  getProductById,
  getProductBySlug
} = require('../controllers/productController');

// Product routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/categories', getCategories);
router.get('/slug/:slug', getProductBySlug);
router.get('/:id', getProductById);

module.exports = router;
