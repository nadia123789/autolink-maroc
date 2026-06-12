const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/technicienController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware, roleMiddleware('technicien'));

router.get('/',                              ctrl.getMesInterventions);
router.put('/:id/statut',                   ctrl.updateStatut);
router.post('/:id/pieces',                  ctrl.ajouterPiece);
router.get('/:id/pieces-disponibles',       ctrl.getPiecesDispo);
router.post('/:id/anomalie',                ctrl.signalerAnomalie);

module.exports = router;
