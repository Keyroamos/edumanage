import React, { useState, useEffect } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import TransportSidebar from './TransportSidebar';
import { useSchool } from '../../context/SchoolContext';
import TrialExpiredOverlay from '../TrialExpiredOverlay';

const TransportLayout = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const { isLocked } = useSchool();
    const expired = isLocked();

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
            {expired && <TrialExpiredOverlay />}
            <TransportSidebar user={user} />
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 md:p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default TransportLayout;
