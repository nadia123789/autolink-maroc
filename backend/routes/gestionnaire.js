const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/gestionnaireController');
const { authMiddleware, roleMiddleware } = require('../middleware/auth');
const multer = require('multer');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Seuls les formats JPEG, PNG, GIF et WEBP sont autorisés.'));
    }
  }
});

router.use(authMiddleware, roleMiddleware('gestionnaire'));

// Profil établissement
router.get('/profil', ctrl.getProfil);
router.put('/profil', ctrl.updateProfil);

// Logo upload
router.post('/logo', upload.single('logo'), ctrl.uploadLogo);
router.delete('/logo', ctrl.deleteLogo);

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