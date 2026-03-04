const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/dashboard', auth, admin, adminController.getDashboardStats);
router.get('/notifications', auth, admin, adminController.getNotifications);
router.put('/notifications/:id/read', auth, admin, adminController.markNotificationRead);
router.put('/notifications/read-all', auth, admin, adminController.markAllNotificationsRead);
router.get('/users', auth, admin, adminController.getAllUsers);
router.put('/users/:id/role', auth, admin, adminController.updateUserRole);
router.delete('/users/:id', auth, admin, adminController.deleteUser);

module.exports = router;
