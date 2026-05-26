import React, { useState } from 'react';
import axios from 'axios';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { token } = useParams();
    const navigate = useNavigate();

    const submitHandler = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            return toast.error("Passwords don't match");
        }
        if (password.length < 6) {
            return toast.error("Password must be at least 6 characters");
        }

        setLoading(true);
        try {
            await axios.put(`/api/auth/resetpassword/${token}`, { password });
            toast.success('Password reset successfully! Please login.');
            navigate('/login');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Invalid or expired token');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                    <p className="text-gray-500 mt-2 text-sm">
                        Create a new secure password for your account.
                    </p>
                </div>

                <form onSubmit={submitHandler} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Min 6 characters"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter password"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition flex justify-center font-medium disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save New Password'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-sm text-primary hover:underline font-medium inline-flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
