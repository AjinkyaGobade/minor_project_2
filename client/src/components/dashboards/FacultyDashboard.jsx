import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';

const FacultyDashboard = () => {
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDeptCerts = async () => {
            try {
                const { data } = await axios.get('/api/admin/certifications');
                setCertifications(data);
                setLoading(false);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchDeptCerts();
    }, []);

    const stats = {
        total: certifications.length,
        verified: certifications.filter(c => c.status === 'verified').length,
        pending: certifications.filter(c => c.status === 'pending').length,
    };

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Faculty Dashboard (Department View)</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><FileText className="w-6 h-6" /></div>
                    <div><p className="text-sm text-gray-500 font-medium">Dept Certifications</p><p className="text-2xl font-bold">{stats.total}</p></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-green-100 text-green-600 rounded-full"><CheckCircle className="w-6 h-6" /></div>
                    <div><p className="text-sm text-gray-500 font-medium">Verified</p><p className="text-2xl font-bold">{stats.verified}</p></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="p-3 bg-yellow-100 text-yellow-600 rounded-full"><Clock className="w-6 h-6" /></div>
                    <div><p className="text-sm text-gray-500 font-medium">Pending Review</p><p className="text-2xl font-bold">{stats.pending}</p></div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 flex items-center"><Users className="w-5 h-5 mr-2" /> Department Students' Certifications</h2>
                {loading ? <p className="animate-pulse">Loading...</p> : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Certification</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {certifications.map(cert => (
                                    <tr key={cert._id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cert.user?.name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cert.user?.rollNo}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cert.title} ({cert.issuingOrganization})</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${cert.status === 'verified' ? 'bg-green-100 text-green-800' : cert.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {cert.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-primary hover:text-primary/80 font-medium">
                                            <a href={`http://localhost:5000${cert.fileUrl}`} target="_blank" rel="noreferrer">View File</a>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {certifications.length === 0 && <p className="text-center text-gray-500 mt-8">No certifications found in your department.</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FacultyDashboard;
