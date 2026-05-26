import React, { useState } from 'react';
import axios from 'axios';
import { Mail, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('/api/auth/forgotpassword', { email });
            setSent(true);
            toast.success('Password reset email sent');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error sending email');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100">
                <div className="text-center mb-8">
                    <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="w-8 h-8 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Forgot Password</h2>
                    <p className="text-gray-500 mt-2 text-sm">
                        Enter the email address associated with your SDMCET account.
                    </p>
                </div>

                {sent ? (
                    <div className="bg-green-50 text-green-800 p-4 rounded-md mb-6 text-sm">
                        An email has been sent to <strong>{email}</strong> with further instructions. Please check your inbox and spam folder.
                    </div>
                ) : (
                    <form onSubmit={submitHandler} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary outline-none transition"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. user@sdmcet.ac.in"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition flex justify-center font-medium disabled:opacity-50"
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>
                )}

                <div className="mt-8 text-center">
                    <Link to="/login" className="text-sm text-primary hover:underline font-medium inline-flex items-center">
                        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
