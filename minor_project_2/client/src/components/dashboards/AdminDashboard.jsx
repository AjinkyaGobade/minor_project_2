import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Check, X, FileText, Download, Filter, AlertTriangle, Users, Clock, Briefcase } from 'lucide-react';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import AdminAnalytics from './AdminAnalytics';
import ProviderDetailsModal from './ProviderDetailsModal';
import CertificateViewerModal from './CertificateViewerModal';

const AdminDashboard = () => {
    const [certifications, setCertifications] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [departmentFilter, setDepartmentFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [roleFilter, setRoleFilter] = useState('All');
    const [selectedCert, setSelectedCert] = useState(null); // For Details Modal
    const [activeTab, setActiveTab] = useState('list'); // 'list' or 'analytics'
    
    // Pagination & Search
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');
    
    // New Features
    const [globalYearFilter, setGlobalYearFilter] = useState('All');
    const [selectedProvider, setSelectedProvider] = useState(null);

    useEffect(() => {
        fetchData();
    }, [page, searchQuery, globalYearFilter, departmentFilter, roleFilter, statusFilter]);

    const fetchData = async () => {
        try {
            const [certsRes, statsRes] = await Promise.all([
                axios.get(`/api/admin/certifications?page=${page}&limit=20&search=${searchQuery}&year=${globalYearFilter}&department=${departmentFilter}&role=${roleFilter}&status=${statusFilter}`),
                axios.get(`/api/admin/stats?year=${globalYearFilter}`)
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
            let adminFeedback = null;
            if (status === 'Rejected') {
                const input = window.prompt('Reason for rejection (optional):');
                if (input === null) return; // User clicked "Cancel"
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

    const exportToCSV = async () => {
        if (certifications.length === 0) {
            toast.error('No data to export');
            return;
        }

        const headers = ['Name', 'Role', 'USN/Emp ID', 'Department', 'Certificate Title', 'Issuing Org', 'Issue Date', 'Status'];
        
        const escapeCSV = (str) => {
            if (!str) return '""';
            return `"${String(str).replace(/"/g, '""')}"`;
        };

        const csvRows = certifications.map(cert => [
            escapeCSV(cert.user?.name || 'N/A'),
            escapeCSV(cert.user?.role || 'N/A'),
            escapeCSV(cert.user?.rollNo || cert.user?.employeeId || 'N/A'),
            escapeCSV(cert.user?.department || 'N/A'),
            escapeCSV(cert.title),
            escapeCSV(cert.issuingOrganization),
            escapeCSV(cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : (cert.year ? `${cert.month || ''} ${cert.year}` : 'N/A')),
            escapeCSV(cert.status)
        ]);

        const csvContent = [headers.join(','), ...csvRows.map(r => r.join(','))].join('\n');
        
        // Use Native File System API to completely bypass IDM and browser download bugs
        try {
            if (window.showSaveFilePicker) {
                const handle = await window.showSaveFilePicker({
                    suggestedName: `SDMCET_Certifications_${new Date().toISOString().split('T')[0]}.csv`,
                    types: [{
                        description: 'CSV File',
                        accept: {'text/csv': ['.csv']}
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(new Uint8Array([0xEF, 0xBB, 0xBF])); // UTF-8 BOM
                await writable.write(csvContent);
                await writable.close();
                toast.success('CSV Exported Successfully');
                return;
            }
        } catch (error) {
            // User cancelled the save dialog
            if (error.name === 'AbortError') return;
            console.error('File System API error:', error);
        }
        
        // Absolute fallback if File System API is not supported
        const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
        const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `SDMCET_Certifications_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
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

    const filteredCertifications = certifications;

    const uniqueDepartments = ['All', 'CSE', 'ISE', 'ECE', 'EEE', 'ME', 'CV', 'AIML'];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center glass-card p-6">
                <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-emerald-500">Department Admin Dashboard</h1>
                <div className="flex space-x-4">
                    <div className="flex items-center space-x-2 bg-white/50 backdrop-blur border border-white/40 px-3 py-1 rounded-xl">
                        <Filter className="w-5 h-5 text-indigo-500" />
                        <select 
                            className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-700 p-2 cursor-pointer border-r border-gray-300 pr-4"
                            value={departmentFilter}
                            onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
                        >
                            {uniqueDepartments.map(dept => (
                                <option key={dept} value={dept}>{dept === 'All' ? 'All Departments' : dept}</option>
                            ))}
                        </select>
                        <select 
                            className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-700 p-2 cursor-pointer border-r border-gray-300 pr-4"
                            value={roleFilter}
                            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                        >
                            <option value="All">All Roles</option>
                            <option value="student">Students</option>
                            <option value="faculty">Faculty</option>
                        </select>
                        <select 
                            className="bg-transparent border-none focus:ring-0 text-sm font-semibold text-gray-700 p-2 cursor-pointer"
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        >
                            <option value="All">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                    <select
                        className="bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold rounded-xl px-4 py-2 focus:ring-2 focus:ring-indigo-400 cursor-pointer shadow-sm transition"
                        value={globalYearFilter}
                        onChange={(e) => { setGlobalYearFilter(e.target.value); setPage(1); }}
                    >
                        <option value="All">All Years</option>
                        {[...Array(5)].map((_, i) => {
                            const year = new Date().getFullYear() + 1 - i;
                            return <option key={year} value={year}>{year}</option>;
                        })}
                    </select>
                    <button onClick={exportToCSV} className="flex items-center px-5 py-2 bg-gradient-to-r from-indigo-600 to-emerald-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all transform hover:-translate-y-0.5">
                        <Download className="w-5 h-5 mr-2" /> Export CSV
                    </button>
                </div>
            </div>
            
            {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="glass-card p-6 flex items-center space-x-4 transition hover:shadow-2xl hover:-translate-y-1">
                        <div className="p-4 bg-indigo-100/60 text-indigo-600 rounded-2xl shadow-inner"><Users className="w-8 h-8" /></div>
                        <div><p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Students</p><p className="text-3xl font-bold text-gray-800">{stats.totalStudents}</p></div>
                    </div>
                    <div className="glass-card p-6 flex items-center space-x-4 transition hover:shadow-2xl hover:-translate-y-1">
                        <div className="p-4 bg-purple-100/60 text-purple-600 rounded-2xl shadow-inner"><Briefcase className="w-8 h-8" /></div>
                        <div><p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Faculty</p><p className="text-3xl font-bold text-gray-800">{stats.totalFaculty || 0}</p></div>
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

            <div className="flex border-b border-gray-200 mb-6 space-x-8">
                <button 
                    onClick={() => setActiveTab('list')} 
                    className={`pb-4 text-lg font-bold transition-colors ${activeTab === 'list' ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Certifications List
                </button>
                <button 
                    onClick={() => setActiveTab('analytics')} 
                    className={`pb-4 text-lg font-bold transition-colors ${activeTab === 'analytics' ? 'text-indigo-600 border-b-4 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Advanced Analytics
                </button>
            </div>

            {activeTab === 'list' ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 glass-card p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center text-gray-800"><Shield className="w-6 h-6 mr-3 text-indigo-500" /> All Certifications ({departmentFilter})</h2>
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
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">User Info</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Certificate Info</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200/50">
                                    {filteredCertifications.map(cert => (
                                        <tr key={cert._id} className="hover:bg-white/60 transition-colors duration-200">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-bold text-gray-900">{cert.user?.name}</div>
                                                <div className="text-xs font-medium text-gray-500">
                                                    <span className="uppercase text-indigo-600 font-bold">{cert.user?.role}</span> • {cert.user?.rollNo || cert.user?.employeeId} • {cert.user?.department}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="font-semibold text-gray-800">{cert.title}</div>
                                                <button onClick={() => setSelectedCert(cert)} className="mt-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors underline">View Full Details</button>
                                                
                                                {cert.ocrResult && cert.ocrResult.processed && !cert.ocrResult.isMatch && (
                                                    <div className="mt-2 flex flex-col space-y-1">
                                                        <span className="inline-flex items-center text-xs font-bold text-rose-700 bg-rose-100 px-2 py-1 rounded shadow-sm border border-rose-200 w-fit cursor-help" title={cert.ocrResult.warnings?.join(' | ')}>
                                                            <AlertTriangle className="w-3 h-3 mr-1" /> AI Flagged Mismatch
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm w-fit ${cert.status?.toLowerCase() === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : cert.status?.toLowerCase() === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'} capitalize`}>
                                                    {cert.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-3">
                                                {cert.status?.toLowerCase() === 'pending' ? (
                                                    <>
                                                        <button onClick={() => handleVerify(cert._id, 'Approved')} className="p-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 shadow-sm transition" title="Approve">
                                                            <Check className="w-5 h-5" />
                                                        </button>
                                                        <button onClick={() => handleVerify(cert._id, 'Rejected')} className="p-2 bg-rose-100 text-rose-700 rounded-xl hover:bg-rose-200 shadow-sm transition" title="Reject">
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 text-xs font-medium italic">Reviewed</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredCertifications.length === 0 && (
                                <p className="text-center text-gray-500 mt-8 mb-8 font-medium">No certifications found for this criteria.</p>
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
                            <h2 className="text-xl font-bold mb-6 text-gray-800">Department Overview</h2>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.departmentStats}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#6b7280'}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280'}} />
                                        <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                        <Bar dataKey="Verified" fill="#6366f1" radius={[6, 6, 0, 0]} name="Approved" />
                                        <Bar dataKey="Pending" fill="#f59e0b" radius={[6, 6, 0, 0]} name="Pending" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    )}
                </div>
                </div>
            ) : (
                <AdminAnalytics stats={stats} onProviderClick={(providerName) => setSelectedProvider(providerName)} />
            )}

            {/* Provider Details Modal */}
            {selectedProvider && (
                <ProviderDetailsModal 
                    provider={selectedProvider} 
                    year={globalYearFilter} 
                    onClose={() => setSelectedProvider(null)} 
                    onCertClick={(cert) => {
                        setSelectedProvider(null);
                        setSelectedCert(cert);
                    }}
                />
            )}

            {/* Certificate Details Viewer Modal */}
            <CertificateViewerModal 
                cert={selectedCert} 
                onClose={() => setSelectedCert(null)}
                onUpdateStatus={(id, status) => {
                    fetchData(); // Refresh the main dashboard data behind it
                }}
            />
        </div>
    );
};

export default AdminDashboard;
