import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Shield, AlertTriangle, Check, Download, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import { getFullFileUrl } from '../../utils/urlHelper';

const ProviderDetailsModal = ({ provider, year, onClose, onCertClick }) => {
    const [certifications, setCertifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchData();
    }, [page, searchQuery, statusFilter]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/admin/certifications?page=${page}&limit=10&search=${searchQuery}&year=${year}&provider=${provider}`);
            let data = res.data.data;
            if (statusFilter !== 'All') {
                data = data.filter(c => c.status.toLowerCase() === statusFilter.toLowerCase());
            }
            setCertifications(data);
            setTotalPages(res.data.pages);
            setLoading(false);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load provider details');
            setLoading(false);
        }
    };

    const handleVerify = async (id, status) => {
        try {
            let adminFeedback = null;
            if (status === 'Rejected') {
                const input = window.prompt('Reason for rejection (optional):');
                if (input === null) return;
                adminFeedback = input.trim() || 'No reason provided by Admin';
            }
            await axios.put(`/api/certifications/${id}/verify`, { status, adminFeedback });
            toast.success(`Certificate ${status} successfully`);
            fetchData();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update certificate status');
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Shield className="w-6 h-6 text-indigo-500" /> 
                            {provider} Certifications
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Showing details for year: {year === 'All' ? 'All Years' : year}</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"><X className="w-6 h-6" /></button>
                </div>
                
                <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between bg-white">
                    <form onSubmit={(e) => { e.preventDefault(); setPage(1); setSearchQuery(search); }} className="flex space-x-2 flex-1 min-w-[200px]">
                        <input type="text" placeholder="Search Name or Roll No..." className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 w-full max-w-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
                        <button type="submit" className="px-4 py-2 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-xl text-sm font-bold transition">Search</button>
                    </form>
                    <div className="flex items-center space-x-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <select 
                            className="bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-indigo-400 text-sm font-semibold text-gray-700 px-4 py-2 rounded-xl cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
                        </div>
                    ) : (
                        <div className="overflow-hidden rounded-xl shadow-sm bg-white border border-gray-100">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">User Info</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Certificate Title</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {certifications.length === 0 ? (
                                        <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500 font-medium">No certificates found matching criteria.</td></tr>
                                    ) : certifications.map(cert => (
                                        <tr key={cert._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900">{cert.user?.name}</div>
                                                <div className="text-xs font-medium text-gray-500 mt-1">
                                                    <span className="uppercase text-indigo-600 font-bold">{cert.user?.role}</span> • {cert.user?.rollNo || cert.user?.employeeId} • {cert.user?.department}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-800 line-clamp-1">{cert.title}</div>
                                                <div className="text-xs text-gray-500 mt-1">{cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : (cert.year ? `${cert.month || ''} ${cert.year}` : 'N/A')}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${cert.status?.toLowerCase() === 'approved' ? 'bg-emerald-100 text-emerald-800' : cert.status?.toLowerCase() === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'} capitalize`}>
                                                    {cert.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                                                <button onClick={() => onCertClick(cert)} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition">View</button>
                                                <a href={getFullFileUrl(cert.fileUrl)} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-200 rounded-lg text-xs font-bold flex items-center transition"><Download className="w-3 h-3 mr-1" /> DL</a>
                                                {cert.status?.toLowerCase() === 'pending' && (
                                                    <>
                                                        <button onClick={() => handleVerify(cert._id, 'Approved')} className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition" title="Approve"><Check className="w-4 h-4" /></button>
                                                        <button onClick={() => handleVerify(cert._id, 'Rejected')} className="p-1.5 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition" title="Reject"><X className="w-4 h-4" /></button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center">
                        <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-sm font-bold text-gray-600 transition">Previous</button>
                        <span className="text-sm font-medium text-gray-500 bg-gray-50 px-4 py-2 rounded-xl">Page {page} of {totalPages}</span>
                        <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-sm font-bold text-gray-600 transition">Next</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProviderDetailsModal;
