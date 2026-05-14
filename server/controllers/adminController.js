const Certification = require('../models/Certification');
const User = require('../models/User');

const getAllCertifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        let query = {};
        
        // If it's a faculty, restrict to their department
        let studentIds = null;
        if (req.user.role === 'faculty') {
            const studentsInDept = await User.find({ department: req.user.department }).select('_id');
            studentIds = studentsInDept.map(s => s._id);
            query = { user: { $in: studentIds } };
        }

        // Search logic
        if (search) {
            // Find users matching the search term (name or rollNo)
            let userMatchQuery = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { rollNo: { $regex: search, $options: 'i' } }
                ]
            };
            
            // Keep faculty restrictions if applicable
            if (studentIds) {
                userMatchQuery._id = { $in: studentIds };
            }
            
            const matchingUsers = await User.find(userMatchQuery).select('_id');
            const matchingUserIds = matchingUsers.map(u => u._id);
            
            // Overwrite query to match these specific users
            query.user = { $in: matchingUserIds };
        }

        const total = await Certification.countDocuments(query);
        const certifications = await Certification.find(query)
            .populate('user', 'name email rollNo department')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({
            data: certifications,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getStats = async (req, res) => {
    try {
        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalCertifications = await Certification.countDocuments();
        const verifiedCerts = await Certification.countDocuments({ status: 'Approved' });
        const pendingCerts = await Certification.countDocuments({ status: 'Pending' });

        // Department Breakdown
        const deptAggregation = await Certification.aggregate([
            { $match: { status: 'Approved' } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },
            {
                $group: {
                    _id: '$student.department',
                    count: { $sum: 1 }
                }
            }
        ]);

        const departmentStats = deptAggregation.map(d => ({
            name: d._id && typeof d._id === 'string' ? d._id : 'General',
            Verified: d.count || 0
        }));

        res.json({
            totalStudents,
            totalCertifications,
            verifiedCerts,
            pendingCerts,
            departmentStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllCertifications, getStats };
