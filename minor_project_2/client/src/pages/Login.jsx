import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff, HelpCircle } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showSupport, setShowSupport] = useState(false);
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div 
            className="flex items-center justify-center min-h-screen bg-cover bg-center bg-no-repeat relative overflow-hidden"
            style={{ backgroundImage: "url('/bg.jpg')" }}
        >
            {/* Dark overlay with subtle blur for depth */}
            <div className="absolute inset-0 bg-[#0f172a]/60 backdrop-blur-[4px]"></div>

            {/* Decorative colored blobs for premium feel */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/30 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/30 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md z-10 m-4 relative animate-fade-in-up">
                {/* Glassmorphism Card */}
                <div className="w-full p-10 bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)]">
                    
                    <div className="text-center mb-8">
                        {/* College Logo */}
                        <div className="mx-auto w-24 h-24 bg-white/90 p-2 rounded-full shadow-xl border border-white/30 mb-6 transform hover:scale-105 transition-transform duration-300 overflow-hidden">
                            <img src="/logo.jpg" alt="SDMCET Logo" className="w-full h-full object-contain rounded-full" />
                        </div>
                        
                        <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                            Welcome Back
                        </h2>
                        <p className="mt-2 text-sm text-blue-100 font-medium tracking-wide opacity-80">
                            Certificate Tracking System
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 border border-red-300 rounded-xl flex items-center">
                            <span className="flex-1 font-medium">{error}</span>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={submitHandler}>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-blue-100 uppercase tracking-wider ml-1 opacity-90">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10" />
                                <input
                                    type="email"
                                    required
                                    placeholder="yourname@sdmcet.ac.in"
                                    className="w-full pl-12 pr-4 py-3.5 bg-white/95 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400 shadow-inner"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center ml-1">
                                <label className="text-xs font-bold text-blue-100 uppercase tracking-wider opacity-90">Password</label>
                                <Link to="/forgotpassword" name="forgot-password" id="forgot-password-link" className="text-xs font-bold text-blue-300 hover:text-white transition-colors drop-shadow-sm">
                                    Forgot?
                                </Link>
                            </div>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    className="w-full pl-12 pr-12 py-3.5 bg-white/95 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-900 placeholder:text-gray-400 shadow-inner"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none z-10"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center px-6 py-4 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all shadow-lg shadow-blue-900/50 disabled:opacity-70 disabled:cursor-not-allowed group"
                            >
                                {loading ? (
                                    <span className="flex items-center"><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div> Authenticating...</span>
                                ) : (
                                    <span className="flex items-center text-base">Sign In <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1.5 transition-transform" /></span>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 text-center border-t border-white/10 pt-6 space-y-4">
                        <p className="text-sm text-blue-100/80">
                            New to the portal?{' '}
                            <Link to="/register" className="font-bold text-white hover:text-blue-300 transition-colors drop-shadow-md">
                                Create a new account
                            </Link>
                        </p>
                        
                        {/* Customer Support Toggle */}
                        <div className="pt-2">
                            <button 
                                onClick={() => setShowSupport(!showSupport)}
                                className="inline-flex items-center text-xs font-medium text-blue-200 hover:text-white transition-colors"
                            >
                                <HelpCircle className="w-3.5 h-3.5 mr-1" />
                                Contact Customer Support
                            </button>
                            
                            {showSupport && (
                                <div className="mt-3 p-3 bg-white/10 rounded-lg border border-white/10 text-xs text-blue-100 animate-fade-in-up">
                                    <p className="font-semibold text-white mb-1">Support Team</p>
                                    <p>Sagar | Ajinkya | Praveen</p>
                                    <a href="mailto:name@gmail.com" className="text-blue-300 hover:text-white transition-colors mt-1 inline-block">name@gmail.com</a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
