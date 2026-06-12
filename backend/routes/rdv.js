// routes/rdv.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/rdvController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', ctrl.getMesRdv);
router.get('/:id', ctrl.getById);
router.post('/', roleMiddleware('client'), ctrl.create);
router.put('/:id/statut', roleMiddleware('gestionnaire', 'technicien', 'admin'), ctrl.updateStatut);
router.delete('/:id', roleMiddleware('client'), ctrl.annuler);

module.exports = router;
