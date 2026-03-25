const express = require('express');
const router = express.Router();
const { addCertification, getMyCertifications, verifyCertification } = require('../controllers/certificationController');
const { protect, admin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .post(protect, upload.single('file'), addCertification);

router.route('/my-certs').get(protect, getMyCertifications);

router.route('/:id/verify').put(protect, admin, verifyCertification);

module.exports = router;
