import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, UserCircle, Briefcase } from 'lucide-react';

const DEPARTMENTS = [
    { value: 'CSE', label: 'Computer Science (CSE)' },
    { value: 'ISE', label: 'Information Science (ISE)' },
    { value: 'ECE', label: 'Electronics & Comm (ECE)' },
    { value: 'EEE', label: 'Electrical & Electronics (EEE)' },
    { value: 'ME', label: 'Mechanical (ME)' },
    { value: 'CV', label: 'Civil (CV)' },
    { value: 'AIML', label: 'Artificial Intelligence (AI/ML)' }
];

const Register = () => {
    const [roleTab, setRoleTab] = useState('student');
    const [staffRole, setStaffRole] = useState('faculty'); // Default to regular faculty
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', department: 'CSE', semester: '', employeeId: '', rollNo: '', accessCode: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            // If the roleTab is faculty, send the selected staffRole (faculty or admin)
            const finalRole = roleTab === 'student' ? 'student' : staffRole;
            await register({ ...formData, role: finalRole });
            navigate('/dashboard');
        } catch (err) {
            const msg = err.response?.data?.message || 'Registration failed. Please check your details and try again.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen py-12 bg-gradient-to-br from-blue-50 to-indigo-50">
            <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <UserPlus className="mx-auto h-12 w-12 text-primary" />
                    <h2 className="mt-4 text-3xl font-extrabold text-gray-900">SDMCET Portal</h2>
                    <p className="mt-2 text-sm text-gray-600">Create your institutional account</p>
                </div>
                
                {/* Role Tabs */}
                <div className="flex rounded-md shadow-sm mt-4 p-1 bg-gray-100">
                    <button
                        type="button"
                        onClick={() => setRoleTab('student')}
                        className={`flex-1 flex justify-center items-center py-2 text-sm font-medium rounded-md transition ${roleTab === 'student' ? 'bg-white text-primary shadow' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <UserCircle className="w-4 h-4 mr-2" /> Student
                    </button>
                    <button
                        type="button"
                        onClick={() => setRoleTab('faculty')}
                        className={`flex-1 flex justify-center items-center py-2 text-sm font-medium rounded-md transition ${roleTab === 'faculty' ? 'bg-white text-primary shadow' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Briefcase className="w-4 h-4 mr-2" /> Faculty / Admin
                    </button>
                </div>

                {error && (
                    <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                        {error}
                        {error === 'User already exists' && (
                            <span className="block mt-1">
                                → <Link to="/login" className="underline font-semibold">Click here to login instead</Link>
                            </span>
                        )}
                    </div>
                )}
                
                <form className="mt-6 space-y-4" onSubmit={submitHandler}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="name" required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" onChange={handleChange} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700">Institutional Email</label>
                            <input type="email" name="email" required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" onChange={handleChange} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <input type="password" name="password" required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" onChange={handleChange} />
                        </div>
                        
                        <div className="col-span-2 md:col-span-1">
                            <label className="text-sm font-medium text-gray-700">Department</label>
                            <select name="department" value={formData.department} onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white">
                                {DEPARTMENTS.map(dept => (
                                    <option key={dept.value} value={dept.value}>{dept.label}</option>
                                ))}
                            </select>
                        </div>

                        {roleTab === 'student' ? (
                            <>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-sm font-medium text-gray-700">Semester</label>
                                    <input type="number" min="1" max="8" name="semester" required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" onChange={handleChange} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-700">University Seat Number (USN / Roll No)</label>
                                    <input type="text" name="rollNo" required placeholder="e.g. 2SD20CS001" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-primary focus:border-primary uppercase" onChange={handleChange} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-sm font-medium text-gray-700">Staff Role</label>
                                    <select value={staffRole} onChange={(e) => setStaffRole(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white">
                                        <option value="faculty">Regular Faculty</option>
                                        <option value="admin">Department Admin</option>
                                    </select>
                                </div>
                                <div className="col-span-2 md:col-span-1">
                                    <label className="text-sm font-medium text-gray-700">Employee ID</label>
                                    <input type="text" name="employeeId" required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" onChange={handleChange} />
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-700">Institution Access Code (Security)</label>
                                    <input type="password" name="accessCode" required placeholder="Required for Staff Registration" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-red-500 focus:border-red-500 border-l-4 border-l-red-500" onChange={handleChange} />
                                    <p className="text-xs text-gray-500 mt-1">Both Regular Faculty and Admins require the institution security code.</p>
                                </div>
                            </>
                        )}
                    </div>

                    <button type="submit" disabled={loading} className="w-full px-4 py-2 mt-4 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                        {loading ? 'Registering...' : `Register as ${roleTab === 'student' ? 'Student' : 'Faculty'}`}
                    </button>
                </form>
                
                <div className="text-sm text-center pt-4 border-t border-gray-100">
                    <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                        Already have an account? Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
