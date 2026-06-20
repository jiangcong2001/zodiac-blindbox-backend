const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.post('/create', matchController.create);
router.post('/reveal', matchController.reveal);
router.get('/history', matchController.history);

module.exports = router;
