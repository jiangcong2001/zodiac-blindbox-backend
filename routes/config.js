const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.use(adminMiddleware);
router.get('/', configController.getConfig);
router.put('/', configController.updateConfig);

module.exports = router;
