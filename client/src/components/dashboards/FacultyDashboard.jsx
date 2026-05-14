import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, FileText, CheckCircle, Clock, Check, X, Filter, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const FacultyDashboard = () => {
    const [certifications, setCertifications] = useState([]);
    const [myCertifications, setMyCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myLoading, setMyLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [uploading, setUploading] = useState(false);
    
    // Pagination & Search for Dept Certs
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    
    const [formData, setFormData] = useState({
        title: '', issuingOrganization: '', issueDate: '', expiryDate: '', certificateId: '', platform: '', file: null
    });

    // Removed admin effect

    useEffect(() => {
        fetchMyCerts();
    }, []);

    const fetchMyCerts = async () => {
        try {
            const { data } = await axios.get('/api/certifications/my-certs');
            setMyCertifications(data);
            setMyLoading(false);
        } catch (error) {
            console.error('Error fetching my certs', error);
            setMyLoading(false);
        }
    };

    // Regular Faculty should NOT have access to department-wide certifications
    // Removed fetchDeptCerts and admin-level state variables

    const handleFileChange = (e) => {
        setFormData({ ...formData, file: e.target.files[0] });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        
        if (formData.expiryDate && new Date(formData.expiryDate) <= new Date(formData.issueDate)) {
            toast.error('Expiry Date must be after the Issue Date');
            return;
        }

        setUploading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key]) data.append(key, formData[key]);
        });

        try {
            await axios.post('/api/certifications', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData({ title: '', issuingOrganization: '', issueDate: '', expiryDate: '', certificateId: '', platform: '', file: null });
            fetchMyCerts();
            toast.success('Certificate uploaded successfully!');
        } catch (error) {
            console.error('Error uploading', error);
            toast.error(error.response?.data?.message || 'Failed to upload certificate');
        }
        setUploading(false);
    };

    const stats = {
        total: myCertifications.length,
        verified: myCertifications.filter(c => c.status === 'Approved').length,
        pending: myCertifications.filter(c => c.status === 'Pending').length,
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500 mb-8">Faculty Dashboard</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 flex items-center space-x-4">
                    <div className="p-4 bg-indigo-100/50 text-indigo-600 rounded-2xl shadow-inner"><FileText className="w-8 h-8" /></div>
                    <div><p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">My Certifications</p><p className="text-3xl font-bold text-gray-800">{stats.total}</p></div>
                </div>
                <div className="glass-card p-6 flex items-center space-x-4">
                    <div className="p-4 bg-emerald-100/50 text-emerald-600 rounded-2xl shadow-inner"><CheckCircle className="w-8 h-8" /></div>
                    <div><p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Approved</p><p className="text-3xl font-bold text-gray-800">{stats.verified}</p></div>
                </div>
                <div className="glass-card p-6 flex items-center space-x-4">
                    <div className="p-4 bg-amber-100/50 text-amber-600 rounded-2xl shadow-inner"><Clock className="w-8 h-8" /></div>
                    <div><p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Pending Review</p><p className="text-3xl font-bold text-gray-800">{stats.pending}</p></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 glass-card p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800"><Upload className="w-6 h-6 mr-3 text-indigo-500" /> Upload My Certificate</h2>
                    <form onSubmit={submitHandler} className="space-y-5">
                        <input type="text" placeholder="Title" required className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all shadow-sm" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        <input type="text" placeholder="Issuing Organization" required className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all shadow-sm" value={formData.issuingOrganization} onChange={e => setFormData({...formData, issuingOrganization: e.target.value})} />
                        <input type="text" placeholder="Platform (e.g. Coursera)" className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all shadow-sm" value={formData.platform} onChange={e => setFormData({...formData, platform: e.target.value})} />
                        <div><label className="text-xs text-gray-500 font-semibold block mb-1 uppercase tracking-wide">Issue Date</label><input type="date" required className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all shadow-sm" value={formData.issueDate} onChange={e => setFormData({...formData, issueDate: e.target.value})} /></div>
                        <div><label className="text-xs text-gray-500 font-semibold block mb-1 uppercase tracking-wide">Expiry Date (Optional)</label><input type="date" className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all shadow-sm" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} /></div>
                        <input type="text" placeholder="Certificate ID" className="w-full px-4 py-3 bg-white/50 border border-white/40 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:bg-white transition-all shadow-sm" value={formData.certificateId} onChange={e => setFormData({...formData, certificateId: e.target.value})} />
                        <input type="file" required accept=".pdf, image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-indigo-100 file:text-indigo-700 hover:file:bg-indigo-200 transition-colors cursor-pointer" onChange={handleFileChange} />
                        <button type="submit" disabled={uploading} className="w-full px-4 py-3 bg-gradient-to-r from-indigo-600 to-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 disabled:opacity-50 transition-all transform hover:-translate-y-0.5">
                            {uploading ? 'Uploading...' : 'Submit Certificate'}
                        </button>
                    </form>
                </div>

                <div className="lg:col-span-2 glass-card p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800"><FileText className="w-6 h-6 mr-3 text-indigo-500" /> My Certifications</h2>
                    {myLoading ? <p className="animate-pulse text-indigo-500 font-medium">Loading...</p> : (
                        <div className="overflow-x-auto rounded-xl shadow-inner bg-white/40">
                            <table className="min-w-full divide-y divide-gray-200/50">
                                <thead className="bg-white/50 backdrop-blur-sm">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Title</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Issuer</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">File</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200/50">
                                    {myCertifications.map(cert => (
                                        <tr key={cert._id} className="hover:bg-white/60 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{cert.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cert.issuingOrganization}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(cert.issueDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${cert.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : cert.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                                                    {cert.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                                <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 transition-colors">View File &rarr;</a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {myCertifications.length === 0 && <p className="text-center text-gray-500 mt-8 mb-8 font-medium">No certifications found. Upload your first certificate!</p>}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
