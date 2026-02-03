import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import FinanceSidebar from './FinanceSidebar';
import { Menu, Bell, ChevronDown } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import TrialExpiredOverlay from '../TrialExpiredOverlay';

const FinanceLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const { isLocked } = useSchool();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const expired = isLocked();

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden transition-colors duration-200">
            {expired && <TrialExpiredOverlay />}
            <FinanceSidebar
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
                user={user}
                onLogout={handleLogout}
            />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Global Header */}
                <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-6 py-3 flex justify-between items-center h-16 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                    </div>

                    <div className="flex items-center space-x-3 md:space-x-6">
                        <div className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded-full border border-indigo-200 dark:border-indigo-800 uppercase tracking-wider">
                            Finance Authority
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></span>
                        </button>

                        {/* User Menu Trigger */}
                        <div className="hidden md:flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-xl transition-colors">
                            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold border border-slate-200 dark:border-slate-700">
                                {user.first_name?.[0]?.toUpperCase()}
                            </div>
                            <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />
                        </div>
                    </div>
                </header>

                {/* Main Content Scroll Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 scroll-smooth">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default FinanceLayout;
