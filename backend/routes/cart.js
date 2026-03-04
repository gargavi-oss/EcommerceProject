const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const auth = require('../middleware/auth');

router.get('/', auth, cartController.getCart);
router.post('/', auth, cartController.addToCart);
router.put('/:id', auth, cartController.updateCartItem);
router.delete('/clear', auth, cartController.clearCart);
router.delete('/:id', auth, cartController.removeFromCart);

module.exports = router;
