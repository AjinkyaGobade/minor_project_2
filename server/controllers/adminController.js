const Certification = require('../models/Certification');
const User = require('../models/User');

const getAllCertifications = async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'faculty') {
            const studentsInDept = await User.find({ department: req.user.department }).select('_id');
            const studentIds = studentsInDept.map(s => s._id);
            query = { user: { $in: studentIds } };
        }

        const certifications = await Certification.find(query).populate('user', 'name email rollNo department');
        res.json(certifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalCertifications = await Certification.countDocuments();
        const verifiedCerts = await Certification.countDocuments({ status: 'verified' });
        const pendingCerts = await Certification.countDocuments({ status: 'pending' });

        res.json({
            totalStudents,
            totalCertifications,
            verifiedCerts,
            pendingCerts
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllCertifications, getStats };
