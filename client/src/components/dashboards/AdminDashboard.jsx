import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Check, X, FileText, Download, Filter, AlertTriangle, Users, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const AdminDashboard = () => {
    const [certifications, setCertifications] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [departmentFilter, setDepartmentFilter] = useState('All');
    
    // Pagination & Search
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, [page, searchQuery]);

    const fetchData = async () => {
        try {
            const [certsRes, statsRes] = await Promise.all([
                axios.get(`/api/admin/certifications?page=${page}&limit=20&search=${searchQuery}`),
                axios.get('/api/admin/stats')
            ]);
            setCertifications(certsRes.data.data);
            setTotalPages(certsRes.data.pages);
            setStats(statsRes.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleVerify = async (id, status) => {
        try {
            const adminFeedback = status === 'Rejected' ? window.prompt('Reason for rejection:') : null;
            if (status === 'Rejected' && !adminFeedback) return; // Cancelled

            await axios.put(`/api/certifications/${id}/verify`, { status, adminFeedback });
            toast.success(`Certificate ${status} successfully`);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update certificate status');
        }
    };

    const exportToCSV = () => {
        if (certifications.length === 0) {
            toast.error('No data to export');
            return;
        }

        const headers = ['Student Name', 'USN/Roll No', 'Department', 'Certificate Title', 'Issuing Org', 'Issue Date', 'Status'];
        
        const csvRows = certifications.map(cert => [
            `"${cert.user?.name || 'N/A'}"`,
            `"${cert.user?.rollNo || 'N/A'}"`,
            `"${cert.user?.department || 'N/A'}"`,
            `"${cert.title}"`,
            `"${cert.issuingOrganization}"`,
            `"${new Date(cert.issueDate).toLocaleDateString()}"`,
            `"${cert.status}"`
        ]);

        const csvContent = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `SDMCET_Certifications_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('CSV Exported Successfully');
    };

    const COLORS = ['#10B981', '#F59E0B', '#EF4444'];
    
    const pendingCerts = stats ? stats.pendingCerts : 0;
    const verifiedCerts = stats ? stats.verifiedCerts : 0;
    const totalCertifications = stats ? stats.totalCertifications : 0;
    const rejectedCerts = totalCertifications - verifiedCerts - pendingCerts;

    const pieData = stats ? [
        { name: 'Approved', value: verifiedCerts },
        { name: 'Pending', value: pendingCerts },
        { name: 'Rejected', value: rejectedCerts > 0 ? rejectedCerts : 0 }
    ] : [];

    const filteredCertifications = certifications.filter(cert => {
        if (departmentFilter === 'All') return true;
        return cert.user?.department === departmentFilter;
    });

    const uniqueDepartments = ['All', ...new Set(certifications.map(c => c.user?.department).filter(Boolean))];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center glass-card p-6">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">Department Admin Dashboard</h1>
                <div className="flex space-x-4">
                    <div className="flex items-center space-x-2 bg-white/50 backdrop-blur border border-white/40 px-3 py-1 rounded-xl">
                        <Filter className="w-5 h-5 text-indigo-500" />
                        <select 
                            className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-700 p-2 cursor-pointer"
                            value={departmentFilter}
                            onChange={(e) => setDepartmentFilter(e.target.value)}
                        >
                            {uniqueDepartments.map(dept => (
                                <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
                            ))}
                        </select>
                    </div>
                    <button onClick={exportToCSV} className="flex items-center px-5 py-2 bg-gradient-to-r from-indigo-600 to-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all transform hover:-translate-y-0.5">
                        <Download className="w-5 h-5 mr-2" /> Export CSV
                    </button>
                </div>
            </div>
            
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="glass-card p-6 flex items-center space-x-4 transition hover:shadow-2xl hover:-translate-y-1">
                        <div className="p-4 bg-indigo-100/60 text-indigo-600 rounded-2xl shadow-inner"><Users className="w-8 h-8" /></div>
                        <div><p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Students</p><p className="text-3xl font-bold text-gray-800">{stats.totalStudents}</p></div>
                    </div>
                    <div className="glass-card p-6 flex items-center space-x-4 transition hover:shadow-2xl hover:-translate-y-1">
                        <div className="p-4 bg-blue-100/60 text-blue-600 rounded-2xl shadow-inner"><FileText className="w-8 h-8" /></div>
                        <div><p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total Certs</p><p className="text-3xl font-bold text-gray-800">{stats.totalCertifications}</p></div>
                    </div>
                    <div className="glass-card p-6 flex items-center space-x-4 transition hover:shadow-2xl hover:-translate-y-1">
                        <div className="p-4 bg-emerald-100/60 text-emerald-600 rounded-2xl shadow-inner"><Check className="w-8 h-8" /></div>
                        <div><p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Approved</p><p className="text-3xl font-bold text-gray-800">{stats.verifiedCerts}</p></div>
                    </div>
                    <div className="glass-card p-6 flex items-center space-x-4 transition hover:shadow-2xl hover:-translate-y-1">
                        <div className="p-4 bg-amber-100/60 text-amber-600 rounded-2xl shadow-inner"><Clock className="w-8 h-8" /></div>
                        <div><p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Pending</p><p className="text-3xl font-bold text-gray-800">{stats.pendingCerts}</p></div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center text-gray-800"><Shield className="w-6 h-6 mr-3 text-indigo-500" /> Action Required ({departmentFilter})</h2>
                        <form onSubmit={(e) => { e.preventDefault(); setPage(1); setSearchQuery(search); }} className="flex space-x-2">
                            <input type="text" placeholder="Search Roll No..." className="px-4 py-2 bg-white/50 border border-white/40 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:bg-white shadow-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
                            <button type="submit" className="px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-xl text-sm font-bold shadow-sm transition">Search</button>
                        </form>
                    </div>
                    {loading ? <p className="animate-pulse text-indigo-500 font-medium">Loading...</p> : (
                        <div className="overflow-x-auto rounded-xl shadow-inner bg-white/40">
                            <table className="min-w-full divide-y divide-gray-200/50">
                                <thead className="bg-white/50 backdrop-blur-sm">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Student Info</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Certification File</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Verification</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200/50">
                                    {filteredCertifications.filter(c => c.status === 'Pending').map(cert => (
                                        <tr key={cert._id} className="hover:bg-white/60 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900">{cert.user?.name}</div>
                                                <div className="text-xs font-medium text-gray-500">{cert.user?.rollNo} • {cert.user?.department}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-gray-800">{cert.title}</div>
                                                {cert.ocrResult && cert.ocrResult.processed ? (
                                                    <div className="mt-2 flex flex-col space-y-1">
                                                        {cert.ocrResult.isMatch ? (
                                                            <span className="inline-flex items-center text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded shadow-sm border border-emerald-200 w-fit">
                                                                <Check className="w-3 h-3 mr-1" /> AI Confirmed
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-xs font-bold text-rose-700 bg-rose-100 px-2 py-1 rounded shadow-sm border border-rose-200 w-fit cursor-help" title={cert.ocrResult.warnings?.join(' | ')}>
                                                                <AlertTriangle className="w-3 h-3 mr-1" /> AI Flagged Mismatch
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="mt-2 inline-flex text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">Processing OCR...</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">View Document &rarr;</a>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3">
                                                <button onClick={() => handleVerify(cert._id, 'Approved')} className="p-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 shadow-sm transition" title="Approve">
                                                    <Check className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleVerify(cert._id, 'Rejected')} className="p-2 bg-rose-100 text-rose-700 rounded-xl hover:bg-rose-200 shadow-sm transition" title="Reject">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredCertifications.filter(c => c.status === 'Pending').length === 0 && (
                                <p className="text-center text-gray-500 mt-8 mb-8 font-medium">No pending verifications for this criteria. All caught up! 🎉</p>
                            )}
                            
                            {/* Pagination Controls */}
                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
                                    <button 
                                        disabled={page === 1} 
                                        onClick={() => setPage(p => p - 1)} 
                                        className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-sm font-medium"
                                    >
                                        Previous
                                    </button>
                                    <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                                    <button 
                                        disabled={page === totalPages} 
                                        onClick={() => setPage(p => p + 1)} 
                                        className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-sm font-medium"
                                    >
                                        Next
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1 space-y-8">
                    <div className="glass-card p-6">
                        <h2 className="text-xl font-bold mb-6 text-gray-800">Status Distribution</h2>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={5} dataKey="value">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                    <Legend iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    {stats && stats.departmentStats && (
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-bold mb-6 text-gray-800">Top Departments (Approved)</h2>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.departmentStats}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#6b7280'}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                                        <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                        <Bar dataKey="Verified" fill="#6366f1" radius={[6, 6, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
