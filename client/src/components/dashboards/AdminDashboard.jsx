import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Check, X, FileText, Download } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';

const AdminDashboard = () => {
    const [certifications, setCertifications] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [certsRes, statsRes] = await Promise.all([
                axios.get('/api/admin/certifications'),
                axios.get('/api/admin/stats')
            ]);
            setCertifications(certsRes.data);
            setStats(statsRes.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleVerify = async (id, status) => {
        try {
            await axios.put(`/api/certifications/${id}/verify`, { status });
            fetchData();
        } catch (error) {
            console.error(error);
        }
    };

    const COLORS = ['#10B981', '#F59E0B', '#EF4444'];
    
    // Fallbacks to handle undefined during loading
    const pendingCerts = stats ? stats.pendingCerts : 0;
    const verifiedCerts = stats ? stats.verifiedCerts : 0;
    const totalCertifications = stats ? stats.totalCertifications : 0;
    const rejectedCerts = totalCertifications - verifiedCerts - pendingCerts;

    const pieData = stats ? [
        { name: 'Verified', value: verifiedCerts },
        { name: 'Pending', value: pendingCerts },
        { name: 'Rejected', value: rejectedCerts > 0 ? rejectedCerts : 0 }
    ] : [];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <button className="flex items-center px-4 py-2 bg-gray-900 text-white rounded hover:bg-gray-800 transition">
                    <Download className="w-4 h-4 mr-2" /> Export CSV
                </button>
            </div>
            
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 font-medium">Total Students</p>
                        <p className="text-3xl font-bold mt-2">{stats.totalStudents}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 font-medium">Total Certifications</p>
                        <p className="text-3xl font-bold mt-2 text-blue-600">{stats.totalCertifications}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 font-medium">Verified</p>
                        <p className="text-3xl font-bold mt-2 text-green-600">{stats.verifiedCerts}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                        <p className="text-sm text-gray-500 font-medium">Pending Review</p>
                        <p className="text-3xl font-bold mt-2 text-yellow-600">{stats.pendingCerts}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4 flex items-center"><Shield className="w-5 h-5 mr-2" /> Pending Verifications</h2>
                    {loading ? <p className="animate-pulse">Loading...</p> : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead>
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certification</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {certifications.filter(c => c.status === 'pending').map(cert => (
                                        <tr key={cert._id}>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {cert.user?.name}<br/><span className="text-xs text-gray-500">{cert.user?.department}</span>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{cert.title}</td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm text-primary font-medium">
                                                <a href={`http://localhost:5000${cert.fileUrl}`} target="_blank" rel="noreferrer">View</a>
                                            </td>
                                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                                <button onClick={() => handleVerify(cert._id, 'verified')} className="p-1 bg-green-100 text-green-700 rounded hover:bg-green-200" title="Approve">
                                                    <Check className="w-5 h-5" />
                                                </button>
                                                <button onClick={() => handleVerify(cert._id, 'rejected')} className="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200" title="Reject">
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {certifications.filter(c => c.status === 'pending').length === 0 && (
                                <p className="text-center text-gray-500 mt-4">No pending verifications. All caught up!</p>
                            )}
                        </div>
                    )}
                </div>

                <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h2 className="text-lg font-semibold mb-4">Status Distribution</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
