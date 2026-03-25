import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white shadow-sm border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Award className="h-8 w-8 text-primary" />
                        <span className="ml-2 text-xl font-bold text-gray-900">CertTracker</span>
                    </div>
                    {user && (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium text-gray-700 hidden sm:block">
                                {user.name} ({user.role})
                            </span>
                            <button
                                onClick={handleLogout}
                                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition"
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
