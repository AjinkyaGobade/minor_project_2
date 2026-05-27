import React from 'react';
import { 
  PieChart as PieChartIcon, 
  BarChart as BarChartIcon, 
  TrendingUp,
  Download,
  Award,
  Calendar,
  Layers
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Sector,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

const AdminAnalytics = ({ stats, onProviderClick }) => {
    if (!stats) return null;

    const exportAnalytics = () => {
        try {
            const wb = XLSX.utils.book_new();
            
            if (stats.providerStats) {
                const wsProvider = XLSX.utils.json_to_sheet(stats.providerStats);
                XLSX.utils.book_append_sheet(wb, wsProvider, "Providers");
            }
            if (stats.yearStats) {
                const wsYear = XLSX.utils.json_to_sheet(stats.yearStats);
                XLSX.utils.book_append_sheet(wb, wsYear, "Yearly");
            }
            if (stats.departmentStats) {
                const wsDept = XLSX.utils.json_to_sheet(stats.departmentStats);
                XLSX.utils.book_append_sheet(wb, wsDept, "Departments");
            }

            XLSX.writeFile(wb, `Analytics_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success("Analytics Report Exported Successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to export analytics");
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex justify-between items-center glass-card p-6 border-l-4 border-indigo-500">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-800">Advanced Analytics Hub</h2>
                    <p className="text-sm text-gray-500 mt-1">Comprehensive insights into certification trends and platform usage.</p>
                </div>
                <button onClick={exportAnalytics} className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition shadow-sm border border-indigo-200">
                    <Download className="w-4 h-4 mr-2" /> Export Report
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Provider Breakdown Cards */}
                {stats.providerStats && stats.providerStats.length > 0 && (
                    <div className="glass-card p-6 lg:col-span-2">
                        <div className="flex items-center gap-2 mb-6">
                            <Award className="text-indigo-600" size={24} />
                            <h3 className="text-lg font-bold text-gray-800">Top Certification Providers</h3>
                            <p className="text-xs text-gray-400 font-medium ml-2 mt-1">(Click any provider to view full details)</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {stats.providerStats.map((provider, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => onProviderClick && onProviderClick(provider.name)}
                                    className="bg-white/60 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-1 group"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors line-clamp-2 leading-tight">{provider.name}</h4>
                                        <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-1 rounded-lg ml-2">{provider.count}</span>
                                    </div>
                                    <div className="flex gap-2 text-xs mt-3">
                                        <span className="text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded flex-1 text-center border border-emerald-100">{provider.approved} Apprv</span>
                                        <span className="text-rose-600 font-semibold bg-rose-50 px-2 py-0.5 rounded flex-1 text-center border border-rose-100">{provider.rejected} Rej</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Yearly Trend */}
                {stats.yearStats && stats.yearStats.length > 0 && (
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <TrendingUp className="text-emerald-600" size={24} />
                            <h3 className="text-lg font-bold text-gray-800">Year-wise Upload Trends</h3>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.yearStats}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#4b5563'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#4b5563'}} />
                                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                    <Area type="monotone" dataKey="count" stroke="#10b981" fillOpacity={1} fill="url(#colorCount)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Category Distribution */}
                {stats.categoryStats && stats.categoryStats.length > 0 && (
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Layers className="text-purple-600" size={24} />
                            <h3 className="text-lg font-bold text-gray-800">Category Distribution</h3>
                        </div>
                        <div className="h-72 flex items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={stats.categoryStats} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                        {stats.categoryStats.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="w-1/3 space-y-3">
                                {stats.categoryStats.map((item, i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[(i + 3) % COLORS.length]}} />
                                        <span className="text-xs font-semibold text-gray-600">{item.name} ({item.value})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Department Stats */}
                {stats.departmentStats && stats.departmentStats.length > 0 && (
                    <div className="glass-card p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <BarChartIcon className="text-amber-600" size={24} />
                            <h3 className="text-lg font-bold text-gray-800">Department Performance</h3>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.departmentStats}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#4b5563'}} />
                                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#4b5563'}} />
                                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                                    <Bar dataKey="Verified" fill="#10B981" radius={[6, 6, 0, 0]} name="Approved" />
                                    <Bar dataKey="Pending" fill="#F59E0B" radius={[6, 6, 0, 0]} name="Pending" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Year-wise Table View */}
            {stats.yearAndProviderStats && stats.yearAndProviderStats.length > 0 && (
                <div className="glass-card p-6 mt-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Year-wise Provider Analytics Table</h3>
                    <div className="overflow-x-auto rounded-xl shadow-inner bg-white/40">
                        <table className="min-w-full divide-y divide-gray-200/50">
                            <thead className="bg-white/50 backdrop-blur-sm">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Year</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Provider / Platform</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Total Uploads</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Approved</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rejected</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200/50">
                                {stats.yearAndProviderStats.map((item, i) => (
                                    <tr key={i} className="hover:bg-white/60 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">{item.year}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-600">{item.provider}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-indigo-600">{item.count}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">{item.approved}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-rose-600">{item.rejected}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <button 
                                                onClick={() => onProviderClick && onProviderClick(item.provider)}
                                                className="px-3 py-1 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-bold transition shadow-sm border border-indigo-100"
                                            >
                                                View Details
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminAnalytics;
