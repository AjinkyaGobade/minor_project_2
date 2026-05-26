const express = require('express');
const router = express.Router();
const { addCertification, getMyCertifications, verifyCertification, getPublicPortfolio, getLeaderboard } = require('../controllers/certificationController');
const { protect, admin, facultyOrAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
    .post(protect, upload.single('file'), addCertification);

router.route('/my-certs').get(protect, getMyCertifications);

router.route('/:id/verify').put(protect, admin, verifyCertification);

// Public route for portfolio
router.route('/portfolio/:rollNo').get(getPublicPortfolio);

// Public route for leaderboard
router.route('/leaderboard/top').get(getLeaderboard);

module.exports = router;
