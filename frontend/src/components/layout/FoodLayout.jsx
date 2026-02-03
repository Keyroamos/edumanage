import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import FoodSidebar from './FoodSidebar';
import { useSchool } from '../../context/SchoolContext';
import TrialExpiredOverlay from '../TrialExpiredOverlay';

const FoodLayout = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const { isLocked } = useSchool();
    const expired = isLocked();

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
            {expired && <TrialExpiredOverlay />}
            <FoodSidebar user={user} />

            <main className="flex-1 transition-all duration-300 ease-in-out w-full max-w-[100vw] overflow-x-hidden">
                <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default FoodLayout;
