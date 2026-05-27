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
        const status = req.query.status;
        const department = req.query.department;
        const role = req.query.role;

        let query = {};
        
        if (year && year !== 'All') {
            query.year = parseInt(year, 10);
        }
        if (provider && provider !== 'All') {
            query.provider = provider;
        }
        if (status && status !== 'All') {
            query.status = status;
        }

        // Build User level filters
        let userMatchQuery = {};

        // Faculty department restriction or user selected department filter
        if (req.user.role === 'faculty') {
            userMatchQuery.department = req.user.department;
        } else if (department && department !== 'All') {
            if (department === 'MECH' || department === 'ME') {
                userMatchQuery.department = { $in: ['MECH', 'ME'] };
            } else if (department === 'CIVIL' || department === 'CV') {
                userMatchQuery.department = { $in: ['CIVIL', 'CV'] };
            } else {
                userMatchQuery.department = { $regex: `^${department}$`, $options: 'i' };
            }
        }

        if (role && role !== 'All') {
            userMatchQuery.role = role;
        }

        if (search) {
            userMatchQuery.$or = [
                { name: { $regex: search, $options: 'i' } },
                { rollNo: { $regex: search, $options: 'i' } }
            ];
        }

        const hasUserFilters = (req.user.role === 'faculty') || (department && department !== 'All') || (role && role !== 'All') || search;

        if (hasUserFilters) {
            const matchingUsers = await User.find(userMatchQuery).select('_id');
            const matchingUserIds = matchingUsers.map(u => u._id);
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

        // Department Breakdown (Total, Approved, Pending, Rejected)
        const deptAggregation = await Certification.aggregate([
            ...baseMatch,
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
                    _id: { $toUpper: { $ifNull: ['$student.department', 'General'] } },
                    total: { $sum: 1 },
                    verified: { $sum: { $cond: [{ $eq: ['$status', 'Approved'] }, 1, 0] } },
                    pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
                    rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } }
                }
            }
        ]);

        const allDepts = {
            'CSE': { Verified: 0, Pending: 0, Rejected: 0, Total: 0 },
            'ISE': { Verified: 0, Pending: 0, Rejected: 0, Total: 0 },
            'ECE': { Verified: 0, Pending: 0, Rejected: 0, Total: 0 },
            'MECH': { Verified: 0, Pending: 0, Rejected: 0, Total: 0 },
            'CIVIL': { Verified: 0, Pending: 0, Rejected: 0, Total: 0 },
            'EEE': { Verified: 0, Pending: 0, Rejected: 0, Total: 0 },
            'AIML': { Verified: 0, Pending: 0, Rejected: 0, Total: 0 }
        };

        deptAggregation.forEach(d => {
            let deptName = String(d._id || 'GENERAL').toUpperCase().trim();
            if (deptName === 'ME') deptName = 'MECH';
            if (deptName === 'CV') deptName = 'CIVIL';
            
            if (allDepts[deptName]) {
                allDepts[deptName].Total += d.total || 0;
                allDepts[deptName].Verified += d.verified || 0;
                allDepts[deptName].Pending += d.pending || 0;
                allDepts[deptName].Rejected += d.rejected || 0;
            } else {
                allDepts[deptName] = {
                    Total: d.total || 0,
                    Verified: d.verified || 0,
                    Pending: d.pending || 0,
                    Rejected: d.rejected || 0
                };
            }
        });

        const departmentStats = Object.keys(allDepts).map(key => ({
            name: key,
            Total: allDepts[key].Total,
            Verified: allDepts[key].Verified,
            Pending: allDepts[key].Pending,
            Rejected: allDepts[key].Rejected
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

        // Month Breakdown (Sorted Chronologically)
        const monthMatchQuery = yearQuery ? { year: yearQuery } : {};
        const monthAggregation = await Certification.aggregate([
            { $match: monthMatchQuery },
            { $group: { _id: '$month', count: { $sum: 1 } } }
        ]);
        const monthStatsRaw = monthAggregation.map(m => ({
            month: m._id || 'Unknown',
            count: m.count || 0
        }));
        
        const monthOrder = {
            'Jan': 1, 'Feb': 2, 'Mar': 3, 'Apr': 4, 'May': 5, 'Jun': 6,
            'Jul': 7, 'Aug': 8, 'Sep': 9, 'Oct': 10, 'Nov': 11, 'Dec': 12
        };
        const monthStats = monthStatsRaw.sort((a, b) => {
            return (monthOrder[a.month] || 0) - (monthOrder[b.month] || 0);
        });

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
