const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/', auth, orderController.createOrder);
router.get('/', auth, orderController.getUserOrders);
router.get('/all', auth, admin, orderController.getAllOrders);
router.get('/:id', auth, orderController.getOrder);
router.put('/:id/status', auth, admin, orderController.updateOrderStatus);

module.exports = router;
