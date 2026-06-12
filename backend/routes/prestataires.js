const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/prestatairesController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', authMiddleware, roleMiddleware('gestionnaire', 'admin'), ctrl.create);
router.put('/:id', authMiddleware, roleMiddleware('gestionnaire', 'admin'), ctrl.update);

module.exports = router;
