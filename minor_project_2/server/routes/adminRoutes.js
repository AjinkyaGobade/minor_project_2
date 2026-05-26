const express = require('express');
const router = express.Router();
const { getAllCertifications, getStats } = require('../controllers/adminController');
const { protect, admin, facultyOrAdmin } = require('../middleware/authMiddleware');

router.route('/certifications').get(protect, admin, getAllCertifications);
router.route('/stats').get(protect, admin, getStats);

module.exports = router;
