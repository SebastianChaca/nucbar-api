const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const router = express.Router();

router
  .route('/stock')
  .get(productController.stockProducts, productController.getProducts);

router.route('/products-stats').get(productController.getProductsStats);

router
  .route('/')
  .get(productController.getProducts)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    productController.createProduct
  );

router
  .route('/:id')
  .get(productController.getProduct)
  .patch(productController.updateProduct)
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    productController.deleteProduct
  );

module.exports = router;
