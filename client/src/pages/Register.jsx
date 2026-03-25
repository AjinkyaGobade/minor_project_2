import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '', email: '', password: '', role: 'student', department: '', semester: '', employeeId: '', rollNo: ''
    });
    const [error, setError] = useState('');
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
        try {
            await register(formData);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen py-12 bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="w-full max-w-lg p-8 space-y-8 bg-white rounded-xl shadow-2xl">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-gray-900">Create an account</h2>
                </div>
                {error && <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
                <form className="mt-8 space-y-6" onSubmit={submitHandler}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="col-span-2 md:col-span-1">
                            <label className="text-sm font-medium text-gray-700">Name</label>
                            <input type="text" name="name" required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" onChange={handleChange} />
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="email" required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" onChange={handleChange} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <input type="password" name="password" required className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:ring-primary focus:border-primary" onChange={handleChange} />
                        </div>
                        <div className="col-span-2">
                            <label className="text-sm font-medium text-gray-700">Role</label>
                            <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary bg-white">
                                <option value="student">Student</option>
                                <option value="faculty">Faculty</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {formData.role === 'student' && (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Department</label>
                                    <input type="text" name="department" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Semester</label>
                                    <input type="number" name="semester" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Roll No</label>
                                    <input type="text" name="rollNo" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" onChange={handleChange} />
                                </div>
                            </>
                        )}

                        {(formData.role === 'faculty' || formData.role === 'admin') && (
                            <>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Department</label>
                                    <input type="text" name="department" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" onChange={handleChange} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700">Employee ID</label>
                                    <input type="text" name="employeeId" className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md" onChange={handleChange} />
                                </div>
                            </>
                        )}
                    </div>

                    <div>
                        <button type="submit" className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors">
                            Register
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <Link to="/login" className="font-medium text-primary hover:text-primary/80">
                        Already have an account? Sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
