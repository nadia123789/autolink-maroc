// routes/vehicules.js
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/vehiculesController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware);
router.get('/', ctrl.getMesVehicules);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);

module.exports = router;
