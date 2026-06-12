const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware, roleMiddleware('admin'));
router.get('/stats', ctrl.getStats);
router.get('/users', ctrl.getUsers);
router.post('/users', ctrl.createUser);
router.put('/users/:id/statut', ctrl.toggleUserStatut);
router.put('/users/:id/role', ctrl.changeRole);
router.delete('/users/:id', ctrl.deleteUser);
router.get('/prestataires', ctrl.getPrestataires);
router.put('/prestataires/:id/verifier', ctrl.verifierPrestataire);
router.put('/prestataires/:id/activer', ctrl.togglePrestataire);

module.exports = router;
