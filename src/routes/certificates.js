const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/certificateController');

// Public verify route (must be before :id)
router.get('/verify/:registrationNumber', controller.verifyCertificate);
// Public get-by-registration route
router.get('/registration/:registrationNumber', controller.getCertificateByRegistrationNumber);
// Public get-by-certificate-number route
router.get('/number/:certificateNumber', controller.getCertificateByCertificateNumber);

// Protected routes
router.post('/', auth, controller.createCertificate);
router.get('/', auth, controller.getAllCertificates);
router.get('/dashboard', auth, controller.getDashboardStats);
router.get('/:id', auth, controller.getSingleCertificate);
router.put('/:id', auth, controller.updateCertificate);
router.delete('/:id', auth, controller.deleteCertificate);

module.exports = router;
