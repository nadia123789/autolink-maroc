const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/notificationsController');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', ctrl.getMes);
router.put('/lire-tout', ctrl.lireTout);
router.put('/:id/lire', ctrl.lireUne);
router.delete('/:id', ctrl.supprimer);

module.exports = router;
