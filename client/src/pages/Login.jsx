import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, user } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-xl shadow-2xl">
                <div className="text-center">
                    <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                </div>
                {error && <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}
                <form className="mt-8 space-y-6" onSubmit={submitHandler}>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700">Email address</label>
                            <input
                                type="email"
                                required
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-700">Password</label>
                            <input
                                type="password"
                                required
                                className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
                        >
                            Sign in
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <Link to="/register" className="font-medium text-primary hover:text-primary/80">
                        Don't have an account? Register here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
