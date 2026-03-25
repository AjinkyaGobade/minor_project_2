import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import StudentDashboard from '../components/dashboards/StudentDashboard';
import FacultyDashboard from '../components/dashboards/FacultyDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';

const Dashboard = () => {
    const { user, loading } = useContext(AuthContext);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {user.role === 'student' && <StudentDashboard />}
                {user.role === 'faculty' && <FacultyDashboard />}
                {user.role === 'admin' && <AdminDashboard />}
            </main>
        </div>
    );
};

export default Dashboard;
