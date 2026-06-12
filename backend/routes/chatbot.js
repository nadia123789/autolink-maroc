// routes/chatbot.js
const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/chatbotController');

// Import flexible — s'adapte à tous les formats d'export
const authModule = require('../middleware/auth');
const authMiddleware = 
  authModule.authMiddleware ||
  authModule.authenticateToken ||
  authModule.verifyToken ||
  authModule.protect ||
  (typeof authModule === 'function' ? authModule : null);

// Suggestions publiques
router.get('/suggestions', ctrl.getSuggestions);

// Chat — connecté ou non
router.post('/', (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ') && authMiddleware) {
    return authMiddleware(req, res, () => next()); // toujours continuer
  }
  next();
}, ctrl.chat);

module.exports = router;