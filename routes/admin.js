const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.use(adminMiddleware);
router.get('/dashboard', adminController.dashboard);
router.get('/users', adminController.users);
router.get('/payments', adminController.payments);

module.exports = router;
