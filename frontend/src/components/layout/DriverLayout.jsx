import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useNavigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import DriverSidebar from './DriverSidebar';
import { useSchool } from '../../context/SchoolContext';
import TrialExpiredOverlay from '../TrialExpiredOverlay';

const DriverLayout = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isLocked } = useSchool();
    const expired = isLocked();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        navigate('/driver-login');
    };

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/driver-login" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            {expired && <TrialExpiredOverlay />}
            <DriverSidebar
                isOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                handleLogout={handleLogout}
            />

            {/* Main Content */}
            <div className="md:ml-64 min-h-screen flex flex-col transition-all duration-300">
                {/* Header */}
                <div className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg md:hidden"
                    >
                        <Menu size={24} className="text-slate-600 dark:text-slate-300" />
                    </button>

                    <div className="flex items-center gap-3 ml-2 md:ml-0">
                        <span className="md:hidden text-2xl">🚍</span>
                        <div>
                            <h2 className="font-bold text-slate-800 dark:text-white leading-tight">
                                Hello, {user.first_name}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Have a safe trip!</p>
                        </div>
                    </div>

                    <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center text-indigo-700 dark:text-indigo-400 font-bold text-sm shadow-inner cursor-pointer" onClick={() => navigate('/driver-portal/profile')}>
                        {user.first_name[0]}{user.last_name ? user.last_name[0] : ''}
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 overflow-x-hidden max-w-5xl mx-auto w-full">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DriverLayout;
