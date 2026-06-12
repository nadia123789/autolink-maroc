// routes/avis.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/avisController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/prestataire/:id', ctrl.getByPrestataire);
router.post('/', authMiddleware, roleMiddleware('client'), ctrl.create);
router.post('/:id/reponse', authMiddleware, roleMiddleware('gestionnaire'), ctrl.repondre);

module.exports = router;
