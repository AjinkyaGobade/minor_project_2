const Certification = require('../models/Certification');
const User = require('../models/User');

const getAllCertifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        const year = req.query.year;
        const provider = req.query.provider;

        let query = {};
        
        if (year && year !== 'All') {
            query.year = parseInt(year, 10);
        }
        if (provider && provider !== 'All') {
            query.provider = provider;
        }
        
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
            .populate('user', 'name email rollNo employeeId department role')
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
        const yearQuery = req.query.year && req.query.year !== 'All' ? parseInt(req.query.year, 10) : null;
        
        let certMatchQuery = {};
        if (yearQuery) {
            certMatchQuery.year = yearQuery;
        }

        const totalStudents = await User.countDocuments({ role: 'student' });
        const totalFaculty = await User.countDocuments({ role: 'faculty' });
        const totalCertifications = await Certification.countDocuments(certMatchQuery);
        const verifiedCerts = await Certification.countDocuments({ ...certMatchQuery, status: 'Approved' });
        const pendingCerts = await Certification.countDocuments({ ...certMatchQuery, status: 'Pending' });

        const baseMatch = yearQuery ? [{ $match: { year: yearQuery } }] : [];
        const baseApprovedMatch = yearQuery ? { year: yearQuery, status: 'Approved' } : { status: 'Approved' };

        // Department Breakdown
        const deptAggregation = await Certification.aggregate([
            { $match: baseApprovedMatch },
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

        // Provider Breakdown
        const providerAggregation = await Certification.aggregate([
            ...baseMatch,
            { $group: { _id: '$provider', count: { $sum: 1 }, approved: { $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] } }, rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } } } },
            { $sort: { count: -1 } }
        ]);
        const providerStats = providerAggregation.map(p => ({
            name: p._id || 'Others',
            count: p.count || 0,
            approved: p.approved || 0,
            rejected: p.rejected || 0
        }));

        // Year Breakdown
        const yearAggregation = await Certification.aggregate([
            { $group: { _id: '$year', count: { $sum: 1 }, approved: { $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] } } } },
            { $sort: { _id: 1 } }
        ]);
        const yearStats = yearAggregation.map(y => ({
            year: y._id || new Date().getFullYear(),
            count: y.count || 0,
            approved: y.approved || 0
        }));

        // Month Breakdown
        const monthMatchQuery = yearQuery ? { year: yearQuery } : {};
        const monthAggregation = await Certification.aggregate([
            { $match: monthMatchQuery },
            { $group: { _id: '$month', count: { $sum: 1 } } }
        ]);
        const monthStats = monthAggregation.map(m => ({
            month: m._id || 'Unknown',
            count: m.count || 0
        }));

        // Category Breakdown
        const categoryAggregation = await Certification.aggregate([
            ...baseMatch,
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        const categoryStats = categoryAggregation.map(c => ({
            name: c._id || 'Uncategorized',
            value: c.count || 0
        }));

        // Year and Provider Breakdown for Table
        const yearAndProviderAggregation = await Certification.aggregate([
            ...baseMatch,
            { $group: { 
                _id: { year: '$year', provider: '$provider' }, 
                count: { $sum: 1 }, 
                approved: { $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] } }, 
                rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } } 
            } },
            { $sort: { '_id.year': -1, count: -1 } }
        ]);
        const yearAndProviderStats = yearAndProviderAggregation.map(yp => ({
            year: yp._id.year || new Date().getFullYear(),
            provider: yp._id.provider || 'Others',
            count: yp.count || 0,
            approved: yp.approved || 0,
            rejected: yp.rejected || 0
        }));

        res.json({
            totalStudents,
            totalFaculty,
            totalCertifications,
            verifiedCerts,
            pendingCerts,
            departmentStats,
            providerStats,
            yearStats,
            monthStats,
            categoryStats,
            yearAndProviderStats
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getAllCertifications, getStats };
