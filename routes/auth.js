const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/user/info', authMiddleware, authController.getUserInfo);
router.put('/user/profile', authMiddleware, authController.updateProfile);

module.exports = router;
