import React, { useState } from 'react';
import { X, ExternalLink, Download, Check, XCircle, ZoomIn, ZoomOut, Maximize2, AlertTriangle, FileText, FileBadge } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getFullFileUrl } from '../../utils/urlHelper';

const CertificateViewerModal = ({ cert, onClose, onUpdateStatus }) => {
    const [zoom, setZoom] = useState(100);
    const [isUpdating, setIsUpdating] = useState(false);

    if (!cert) return null;

    const fileUrlStr = cert.fileUrl || '';
    const resolvedFileUrl = getFullFileUrl(fileUrlStr);
    const cleanUrl = fileUrlStr.split('?')[0];
    const isPDF = cleanUrl.match(/\.(pdf)$/i) != null;
    const isImage = cleanUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)$/i) != null || (!isPDF && fileUrlStr.includes('image/upload'));

    // Cloudinary PDF dynamic image conversion to prevent browser security blocks
    const isCloudinaryPDF = resolvedFileUrl.includes('res.cloudinary.com') && isPDF;
    const previewUrl = isCloudinaryPDF ? resolvedFileUrl.replace(/\.pdf$/i, '.jpg') : resolvedFileUrl;

    const handleVerify = async (status) => {
        setIsUpdating(true);
        try {
            let adminFeedback = null;
            if (status === 'Rejected') {
                const input = window.prompt('Reason for rejection (optional):');
                if (input === null) {
                    setIsUpdating(false);
                    return;
                }
                adminFeedback = input.trim() || 'No reason provided by Admin';
            }

            await axios.put(`/api/certifications/${cert._id}/verify`, { status, adminFeedback });
            toast.success(`Certificate ${status} successfully`);
            if (onUpdateStatus) {
                onUpdateStatus(cert._id, status);
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to update certificate status');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-6 bg-gray-900/80 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col border border-gray-100 overflow-hidden">
                
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur z-10">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <FileBadge className="w-6 h-6 text-indigo-500" />
                            {cert.title}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Uploaded by <span className="font-bold text-indigo-600">{cert.user?.name}</span> • {cert.issuingOrganization || cert.provider}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center space-x-2 mr-4 bg-gray-100 p-1 rounded-lg">
                            <button onClick={() => setZoom(z => Math.max(z - 25, 50))} className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-white rounded shadow-sm transition"><ZoomOut className="w-4 h-4" /></button>
                            <span className="text-xs font-bold text-gray-600 w-12 text-center">{zoom}%</span>
                            <button onClick={() => setZoom(z => Math.min(z + 25, 200))} className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-white rounded shadow-sm transition"><ZoomIn className="w-4 h-4" /></button>
                            <button onClick={() => setZoom(100)} className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-white rounded shadow-sm transition" title="Reset Zoom"><Maximize2 className="w-4 h-4" /></button>
                        </div>
                        <a href={resolvedFileUrl} target="_blank" rel="noreferrer" className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition flex items-center gap-1 text-sm font-bold" title="Open in new tab">
                            <ExternalLink className="w-5 h-5" />
                        </a>
                        <a href={resolvedFileUrl} download className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition flex items-center gap-1 text-sm font-bold" title="Download">
                            <Download className="w-5 h-5" />
                        </a>
                        <div className="h-6 w-px bg-gray-300 mx-1"></div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col lg:flex-row bg-gray-100">
                    
                    {/* Left: Document Viewer */}
                    <div className="flex-1 relative overflow-auto flex items-center justify-center p-4 lg:p-8 border-r border-gray-200">
                        <div 
                            className="bg-white shadow-xl transition-all duration-300 ease-in-out relative"
                            style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center', width: isPDF ? '100%' : 'auto', height: isPDF ? '100%' : 'auto' }}
                        >
                            {!resolvedFileUrl ? (
                                <div className="p-12 text-center flex flex-col items-center justify-center h-full">
                                    <FileText className="w-16 h-16 text-gray-300 mb-4" />
                                    <h4 className="text-xl font-bold text-gray-500">Certificate Unavailable</h4>
                                    <p className="text-gray-400 mt-2">The file URL is missing or corrupted.</p>
                                </div>
                            ) : isPDF ? (
                                isCloudinaryPDF ? (
                                    <img 
                                        src={previewUrl} 
                                        alt="Certificate Preview" 
                                        className="max-w-full h-auto object-contain"
                                        onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x600/f3f4f6/9ca3af?text=Image+Load+Error'; }}
                                    />
                                ) : (
                                    <iframe 
                                        src={`${resolvedFileUrl}#toolbar=0&view=FitH`} 
                                        className="w-full h-[70vh] lg:h-full min-h-[600px] border-0"
                                        title="PDF Certificate"
                                    />
                                )
                            ) : isImage ? (
                                <img 
                                    src={resolvedFileUrl} 
                                    alt="Certificate Preview" 
                                    className="max-w-full h-auto object-contain"
                                    onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/800x600/f3f4f6/9ca3af?text=Image+Load+Error'; }}
                                />
                            ) : (
                                <div className="p-12 text-center flex flex-col items-center justify-center h-full bg-white">
                                    <FileText className="w-16 h-16 text-gray-300 mb-4" />
                                    <h4 className="text-xl font-bold text-gray-500">Preview not supported</h4>
                                    <p className="text-gray-400 mt-2">Please open in new tab or download to view this file type.</p>
                                    <a href={resolvedFileUrl} target="_blank" rel="noreferrer" className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition">Open File</a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Sidebar Info & Actions */}
                    <div className="w-full lg:w-80 bg-white overflow-y-auto flex flex-col shrink-0">
                        <div className="p-6 space-y-6 flex-1">
                            
                            {/* User Info Card */}
                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Holder Details</p>
                                <p className="font-bold text-gray-900 text-lg">{cert.user?.name}</p>
                                <p className="text-sm text-gray-600 uppercase font-semibold mt-1">{cert.user?.role} • {cert.user?.rollNo || cert.user?.employeeId}</p>
                                <p className="text-sm text-gray-600 mt-1">{cert.user?.department}</p>
                            </div>

                            {/* Cert Meta */}
                            <div className="space-y-4">
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Provider / Platform</p>
                                    <p className="font-semibold text-gray-900">{cert.provider || cert.issuingOrganization || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Issue Date</p>
                                    <p className="font-semibold text-gray-900">
                                        {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString() : (cert.year ? `${cert.month || ''} ${cert.year}` : 'Not provided')}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current Status</p>
                                    <span className={`mt-1 px-3 py-1 inline-flex text-sm leading-5 font-bold rounded-lg shadow-sm ${cert.status?.toLowerCase() === 'approved' ? 'bg-emerald-100 text-emerald-800' : cert.status?.toLowerCase() === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'} capitalize`}>
                                        {cert.status}
                                    </span>
                                </div>
                            </div>

                            {/* OCR Alerts */}
                            {cert.ocrResult && cert.ocrResult.processed && !cert.ocrResult.isMatch && (
                                <div className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl">
                                    <div className="flex">
                                        <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0" />
                                        <div className="ml-3">
                                            <h3 className="text-sm font-bold text-rose-800">AI Verification Flags</h3>
                                            <div className="mt-2 text-xs text-rose-700">
                                                <ul className="list-disc pl-4 space-y-1">
                                                    {cert.ocrResult.warnings?.map((w, i) => <li key={i}>{w}</li>)}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Admin Action Bar */}
                        <div className="p-6 border-t border-gray-100 bg-gray-50">
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 text-center">Verification Actions</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button 
                                    disabled={isUpdating || cert.status === 'Approved'}
                                    onClick={() => handleVerify('Approved')} 
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${cert.status === 'Approved' ? 'bg-emerald-50 text-emerald-400 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-lg'}`}
                                >
                                    <Check className="w-5 h-5" /> Approve
                                </button>
                                <button 
                                    disabled={isUpdating || cert.status === 'Rejected'}
                                    onClick={() => handleVerify('Rejected')} 
                                    className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold transition-all ${cert.status === 'Rejected' ? 'bg-rose-50 text-rose-400 cursor-not-allowed' : 'bg-rose-600 text-white hover:bg-rose-700 hover:shadow-lg'}`}
                                >
                                    <XCircle className="w-5 h-5" /> Reject
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateViewerModal;
