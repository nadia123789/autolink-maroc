const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/devisController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', roleMiddleware('gestionnaire'), ctrl.create);
router.put('/:id/envoyer', roleMiddleware('gestionnaire'), ctrl.envoyer);
router.put('/:id/repondre', roleMiddleware('client'), ctrl.repondre);
router.post('/:id/facturer', roleMiddleware('gestionnaire'), ctrl.facturer);

module.exports = router;
