import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Upload, FileText, Clock, CheckCircle, XCircle, Share2, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthContext } from '../../context/AuthContext';

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    
    const [formData, setFormData] = useState({
        title: '', issuingOrganization: '', issueDate: '', expiryDate: '', certificateId: '', platform: '', file: null
    });

    const [leaderboard, setLeaderboard] = useState([]);
    const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

    useEffect(() => {
        fetchCerts();
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const { data } = await axios.get('/api/certifications/leaderboard/top');
            setLeaderboard(data);
            setLoadingLeaderboard(false);
        } catch (error) {
            console.error('Error fetching leaderboard', error);
            setLoadingLeaderboard(false);
        }
    };

    const fetchCerts = async () => {
        try {
            const { data } = await axios.get('/api/certifications/my-certs');
            setCertifications(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching certs', error);
            setLoading(false);
        }
    };

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
            fetchCerts();
            toast.success('Certificate uploaded successfully!');
        } catch (error) {
            console.error('Error uploading', error);
            toast.error(error.response?.data?.message || 'Failed to upload certificate');
        }
        setUploading(false);
    };

    const stats = {
        total: certifications.length,
        verified: certifications.filter(c => c.status === 'Approved').length,
        pending: certifications.filter(c => c.status === 'Pending').length,
        points: certifications.filter(c => c.status === 'Approved').length * 10
    };

    const copyPortfolioLink = () => {
        const link = `${window.location.origin}/portfolio/${user.rollNo}`;
        navigator.clipboard.writeText(link);
        toast.success('Portfolio link copied to clipboard!');
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500 mb-2">Student Dashboard</h1>
                {stats.verified > 0 && (
                    <button onClick={copyPortfolioLink} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition">
                        <Share2 className="w-4 h-4 mr-2" /> Share Public Portfolio
                    </button>
                )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 flex items-center space-x-4 transition hover:shadow-2xl hover:-translate-y-1">
                    <div className="p-4 bg-purple-100/60 text-purple-600 rounded-2xl shadow-inner"><Award className="w-8 h-8" /></div>
                    <div><p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Earned Points</p><p className="text-3xl font-bold text-gray-800">{stats.points}</p></div>
                </div>
                <div className="glass-card p-6 flex items-center space-x-4 transition hover:shadow-2xl hover:-translate-y-1">
                    <div className="p-4 bg-indigo-100/60 text-indigo-600 rounded-2xl shadow-inner"><FileText className="w-8 h-8" /></div>
                    <div><p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Total Certs</p><p className="text-3xl font-bold text-gray-800">{stats.total}</p></div>
                </div>
                <div className="glass-card p-6 flex items-center space-x-4 transition hover:shadow-2xl hover:-translate-y-1">
                    <div className="p-4 bg-emerald-100/60 text-emerald-600 rounded-2xl shadow-inner"><CheckCircle className="w-8 h-8" /></div>
                    <div><p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Approved</p><p className="text-3xl font-bold text-gray-800">{stats.verified}</p></div>
                </div>
                <div className="glass-card p-6 flex items-center space-x-4 transition hover:shadow-2xl hover:-translate-y-1">
                    <div className="p-4 bg-amber-100/60 text-amber-600 rounded-2xl shadow-inner"><Clock className="w-8 h-8" /></div>
                    <div><p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Pending</p><p className="text-3xl font-bold text-gray-800">{stats.pending}</p></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 glass-card p-6">
                    <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800"><Upload className="w-6 h-6 mr-3 text-indigo-500" /> Upload New Certificate</h2>
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
                    {loading ? <p className="animate-pulse text-indigo-500 font-medium">Loading...</p> : (
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
                                    {certifications.map(cert => (
                                        <tr key={cert._id} className="hover:bg-white/60 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-800">{cert.title}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{cert.issuingOrganization}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(cert.issueDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-sm">
                                                <div className="flex flex-col">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm w-fit ${cert.status === 'Approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : cert.status === 'Rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                                                        {cert.status}
                                                    </span>
                                                    {cert.status === 'Rejected' && cert.adminFeedback && (
                                                        <span className="text-xs text-rose-600 mt-2 max-w-[200px] truncate block bg-rose-50 px-2 py-1 rounded" title={cert.adminFeedback}>
                                                            <strong className="font-semibold">Reason:</strong> {cert.adminFeedback}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                                <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 transition-colors">View &rarr;</a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {certifications.length === 0 && <p className="text-center text-gray-500 mt-8 mb-8 font-medium">No certifications found. Upload your first certificate!</p>}
                        </div>
                    )}
                </div>
            </div>

            {/* Department Leaderboard Section */}
            <div className="glass-card p-6 mt-8">
                <h2 className="text-xl font-bold mb-6 flex items-center text-gray-800"><Award className="w-6 h-6 mr-3 text-amber-500" /> SDMCET Top Learners (Leaderboard)</h2>
                {loadingLeaderboard ? <p className="animate-pulse text-indigo-500 font-medium">Loading Leaderboard...</p> : (
                    <div className="overflow-x-auto rounded-xl shadow-inner bg-white/40">
                        <table className="min-w-full divide-y divide-gray-200/50">
                            <thead className="bg-white/50 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rank</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Department</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Points</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/50">
                                {leaderboard.map((student, index) => (
                                    <tr key={student.userId} className={`${student.userId === user._id ? 'bg-indigo-50/80 border-l-4 border-indigo-500' : 'hover:bg-white/60'} transition-colors duration-200`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-gray-900">
                                            {index === 0 ? '🥇 1' : index === 1 ? '🥈 2' : index === 2 ? '🥉 3' : `#${index + 1}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                                            {student.name} {student.userId === user._id && <span className="ml-2 text-xs text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">You</span>}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-600">{student.department}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-indigo-600">{student.points} pts</td>
                                    </tr>
                                ))}
                                {leaderboard.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-8 text-center text-gray-500 font-medium">No data available on the leaderboard yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
