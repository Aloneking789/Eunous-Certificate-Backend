const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const controller = require('../controllers/certificateController');

// Public verify route (must be before :id)
router.get('/verify/:registrationNumber', controller.verifyCertificate);

// Protected routes
router.post('/', auth, controller.createCertificate);
router.get('/', auth, controller.getAllCertificates);
router.get('/:id', auth, controller.getSingleCertificate);
router.put('/:id', auth, controller.updateCertificate);
router.delete('/:id', auth, controller.deleteCertificate);

module.exports = router;
