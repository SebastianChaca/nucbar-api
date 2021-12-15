const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

router.post('/mercadopago', checkoutController.mercadopago);

module.exports = router;
