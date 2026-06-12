// routes/dashboard.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/gestionnaire', authMiddleware, roleMiddleware('gestionnaire'), ctrl.gestionnaire);
router.get('/admin', authMiddleware, roleMiddleware('admin'), ctrl.admin);

module.exports = router;
