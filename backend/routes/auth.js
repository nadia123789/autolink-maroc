// routes/auth.js
const express = require('express');
const router = express.Router();
const { inscription, connexion, getProfil } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

router.post('/inscription', inscription);
router.post('/connexion', connexion);
router.get('/profil', authMiddleware, getProfil);

module.exports = router;
