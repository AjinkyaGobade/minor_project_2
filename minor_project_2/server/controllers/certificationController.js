const Certification = require('../models/Certification');
const Tesseract = require('tesseract.js');
const fs = require('fs');

const processOCR = async (certId, filePath, issuingOrg, studentName) => {
    try {
        const cert = await Certification.findById(certId);
        if (!cert) return;

        const { data: { text, confidence } } = await Tesseract.recognize(filePath, 'eng');
        
        const rawText = text.toLowerCase();
        const warnings = [];
        let isMatch = true;

        if (!rawText.includes(studentName.toLowerCase().split(' ')[0])) {
            warnings.push(`Student name "${studentName}" not clearly found on certificate.`);
            isMatch = false;
        }

        if (!rawText.includes(issuingOrg.toLowerCase().split(' ')[0])) {
            warnings.push(`Issuing organization "${issuingOrg}" not clearly found.`);
            isMatch = false;
        }

        cert.ocrResult = {
            processed: true,
            isMatch,
            confidence,
            warnings,
            rawText: text.substring(0, 500) // Store a snippet for debug
        };
        await cert.save();
    } catch (error) {
        console.error('OCR Processing error:', error);
        await Certification.findByIdAndUpdate(certId, {
            'ocrResult.processed': true,
            'ocrResult.isMatch': false,
            'ocrResult.warnings': ['Failed to process OCR on this image.']
        });
    }
};

const addCertification = async (req, res) => {
    try {
        const { title, description, category, issueDate, expiryDate, certificateId, platform, provider, year, month } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const fileUrl = req.file.path.startsWith('http') 
            ? req.file.path 
            : `/${req.file.path.replace(/\\/g, '/')}`;

        const certification = new Certification({
            user: req.user._id,
            uploadedBy: req.user.name,
            title,
            description,
            category,
            issueDate,
            expiryDate,
            certificateId,
            fileUrl,
            platform,
            provider,
            year,
            month,
        });

        if (!req.file.mimetype.startsWith('image/')) {
             certification.ocrResult = {
                 processed: true,
                 warnings: ['OCR skipped: File is not an image (e.g. PDF)']
             };
        }

        const createdCertification = await certification.save();
        
        // Trigger OCR asynchronously if it's an image
        if (req.file.mimetype.startsWith('image/')) {
            // Use the absolute URL if Cloudinary, or local path if local storage
            const filePathForOCR = req.file.path.startsWith('http') ? req.file.path : req.file.path;
            processOCR(createdCertification._id, filePathForOCR, category || '', req.user.name);
        }

        res.status(201).json(createdCertification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getMyCertifications = async (req, res) => {
    try {
        const certifications = await Certification.find({ user: req.user._id });
        res.json(certifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const sendEmail = require('../utils/sendEmail');

const verifyCertification = async (req, res) => {
    try {
        const { status, adminFeedback } = req.body; 
        const certification = await Certification.findById(req.params.id).populate('user', 'name email');

        if (certification) {
            certification.status = status;
            certification.verifiedBy = req.user._id;
            if (status === 'Rejected' && adminFeedback) {
                certification.adminFeedback = adminFeedback;
            } else if (status === 'Approved') {
                certification.adminFeedback = undefined;
            }

            const updatedCertification = await certification.save();

            // Send Email Notification
            try {
                const message = status === 'Approved' 
                    ? `Hello ${certification.user.name},\n\nGood news! Your certificate "${certification.title}" has been verified by the SDMCET Administration and is now visible on your public portfolio.\n\nKeep up the great work!`
                    : `Hello ${certification.user.name},\n\nUnfortunately, your certificate "${certification.title}" was rejected.\nReason provided: ${adminFeedback}\n\nPlease review your submission on the portal and upload a corrected version if necessary.`;

                await sendEmail({
                    email: certification.user.email,
                    subject: `Certificate Verification Status: ${status.toUpperCase()}`,
                    message
                });
            } catch (emailError) {
                console.error('Email could not be sent:', emailError);
            }

            res.json(updatedCertification);
        } else {
            res.status(404).json({ message: 'Certification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getPublicPortfolio = async (req, res) => {
    try {
        const User = require('../models/User'); // Import here to avoid circular dep issues
        const user = await User.findOne({ rollNo: req.params.rollNo }).select('name department semester rollNo');
        
        if (!user) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const certifications = await Certification.find({ 
            user: user._id, 
            status: 'Approved' 
        });

        res.json({ user, certifications });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getLeaderboard = async (req, res) => {
    try {
        const User = require('../models/User'); // avoid circular deps
        // Aggregate to count verified certs per user
        const leaderboard = await Certification.aggregate([
            { $match: { status: 'Approved' } },
            { $group: { _id: '$user', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Populate user details manually since we used aggregate
        const populatedLeaderboard = await User.populate(leaderboard, { path: '_id', select: 'name department rollNo' });
        
        // Format the output
        const result = populatedLeaderboard
            .filter(item => item._id) 
            .map(item => ({
                userId: item._id._id || item._id,
                name: item._id.name || 'Anonymous Student',
                department: item._id.department || 'General',
                rollNo: item._id.rollNo || 'N/A',
                points: item.count * 10
            }));

        res.json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addCertification, getMyCertifications, verifyCertification, getPublicPortfolio, getLeaderboard };
