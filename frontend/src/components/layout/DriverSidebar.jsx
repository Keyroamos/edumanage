import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, DollarSign, User, LogOut } from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const DriverSidebar = ({ isOpen, toggleSidebar, handleLogout }) => {
    const links = [
        { to: '/driver-portal', icon: Home, label: 'Dashboard', end: true },
        { to: '/driver-portal/expenses', icon: DollarSign, label: 'Expenses' },
        { to: '/driver-portal/profile', icon: User, label: 'My Profile' },
    ];

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transform transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="h-full flex flex-col">
                    {/* Header */}
                    <div className="h-16 flex items-center px-6 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-2xl mr-2">🚍</span>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Driver Portal
                        </h1>
                    </div>

                    {/* Nav */}
                    <nav className="flex-1 px-4 py-6 space-y-2">
                        {links.map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                onClick={() => window.innerWidth < 768 && toggleSidebar()}
                                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                                    }`}
                            >
                                <link.icon size={20} />
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Logout and Theme */}
                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                        <ThemeToggle className="w-full !justify-start px-4 py-3" />
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium"
                        >
                            <LogOut size={20} />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DriverSidebar;
