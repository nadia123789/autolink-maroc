const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/gestionnaireController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');

router.use(authMiddleware, roleMiddleware('gestionnaire'));

// Profil établissement
router.get('/profil', ctrl.getProfil);
router.put('/profil', ctrl.updateProfil);

// Catalogue
router.get('/prestations', ctrl.getPrestations);
router.post('/prestations', ctrl.createPrestation);
router.put('/prestations/:id', ctrl.updatePrestation);
router.delete('/prestations/:id', ctrl.deletePrestation);

// Techniciens
router.get('/techniciens', ctrl.getTechniciens);
router.post('/techniciens', ctrl.createTechnicien);
router.put('/techniciens/:id', ctrl.updateTechnicien);
router.delete('/techniciens/:id', ctrl.deleteTechnicien);

// Assigner technicien à un RDV
router.put('/rdv/:id/assigner', ctrl.assignerTechnicien);

// Fiches clients
router.get('/clients', ctrl.getClients);
router.get('/clients/:id', ctrl.getClientDetail);

 router.get('/diagnostics', ctrl.getDiagnostics);
module.exports = router;
