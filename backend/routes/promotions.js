const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/promotionsController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/', ctrl.getPubliques);
router.post('/verifier', authMiddleware, ctrl.verifierCode);
router.get('/mes', authMiddleware, roleMiddleware('gestionnaire'), ctrl.getMes);
router.post('/', authMiddleware, roleMiddleware('gestionnaire'), ctrl.create);
router.put('/:id', authMiddleware, roleMiddleware('gestionnaire'), ctrl.update);
router.delete('/:id', authMiddleware, roleMiddleware('gestionnaire'), ctrl.remove);

module.exports = router;
