import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Award, CheckCircle, Calendar, Building, BookOpen } from 'lucide-react';

const Portfolio = () => {
    const { rollNo } = useParams();
    const [portfolioData, setPortfolioData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPortfolio = async () => {
            try {
                const { data } = await axios.get(`/api/certifications/portfolio/${rollNo}`);
                setPortfolioData(data);
                setLoading(false);
            } catch (err) {
                setError(err.response?.data?.message || 'Portfolio not found');
                setLoading(false);
            }
        };
        fetchPortfolio();
    }, [rollNo]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading Portfolio...</div>;
    
    if (error) return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <Award className="w-16 h-16 text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-700">Oops!</h2>
            <p className="text-gray-500 mt-2">{error}</p>
        </div>
    );

    const { user, certifications } = portfolioData;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header Profile */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden relative print:shadow-none print:border-none">
                    <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 print:hidden"></div>
                    <div className="px-8 pb-8 pt-8 print:pt-0">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="relative -mt-24 mb-4 print:mt-0 print:mb-2">
                                    <div className="w-32 h-32 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center text-5xl font-bold text-primary print:w-24 print:h-24 print:text-3xl print:border-2 print:shadow-none print:bg-gray-100">
                                        {user.name.charAt(0)}
                                    </div>
                                </div>
                                <h1 className="text-3xl font-extrabold text-gray-900">{user.name}</h1>
                                <p className="text-lg text-gray-500 font-medium mt-1">{user.rollNo} • {user.department} Engineering</p>
                                <div className="flex items-center space-x-2 mt-4 px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-semibold inline-flex print:border-none print:bg-transparent print:p-0">
                                    <CheckCircle className="w-4 h-4" />
                                    <span>SDMCET Verified Student</span>
                                </div>
                            </div>
                            <button onClick={() => window.print()} className="print:hidden flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition shadow-sm mt-4">
                                Download PDF
                            </button>
                        </div>
                    </div>
                </div>

                {/* Certifications List */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <Award className="w-6 h-6 mr-2 text-primary" /> Official Verified Certifications
                    </h2>
                    
                    {certifications.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No Approved certifications to display yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {certifications.map(cert => (
                                <div key={cert._id} className="p-6 border border-gray-200 rounded-xl hover:shadow-md transition bg-gray-50/50">
                                    <h3 className="font-bold text-lg text-gray-900">{cert.title}</h3>
                                    <div className="mt-4 space-y-2 text-sm text-gray-600">
                                        <p className="flex items-center"><Building className="w-4 h-4 mr-2" /> {cert.issuingOrganization}</p>
                                        <p className="flex items-center"><Calendar className="w-4 h-4 mr-2" /> Issued: {new Date(cert.issueDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-gray-200 flex justify-between items-center">
                                        <span className="text-xs font-semibold text-green-600 uppercase tracking-wider flex items-center">
                                            <CheckCircle className="w-4 h-4 mr-1" /> Verified
                                        </span>
                                        <a href={cert.fileUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary hover:underline">
                                            View Certificate &rarr;
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Portfolio;
