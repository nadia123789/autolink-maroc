// routes/pieces.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/piecesController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware, roleMiddleware('gestionnaire', 'admin'));
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
