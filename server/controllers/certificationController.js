const Certification = require('../models/Certification');

const addCertification = async (req, res) => {
    try {
        const { title, issuingOrganization, issueDate, expiryDate, certificateId, platform } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const certification = new Certification({
            user: req.user._id,
            title,
            issuingOrganization,
            issueDate,
            expiryDate,
            certificateId,
            fileUrl: `/${req.file.path.replace(/\\/g, '/')}`,
            platform,
        });

        const createdCertification = await certification.save();
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

const verifyCertification = async (req, res) => {
    try {
        const { status } = req.body; 
        const certification = await Certification.findById(req.params.id);

        if (certification) {
            certification.status = status;
            certification.verifiedBy = req.user._id;

            const updatedCertification = await certification.save();
            res.json(updatedCertification);
        } else {
            res.status(404).json({ message: 'Certification not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addCertification, getMyCertifications, verifyCertification };
