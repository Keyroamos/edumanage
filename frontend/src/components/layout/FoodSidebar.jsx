import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, Utensils, Coffee,
    LogOut, Menu, X, ChevronRight, FileText, ClipboardList
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';
import { useSchool } from '../../context/SchoolContext';

const FoodSidebar = ({ user }) => {
    const navigate = useNavigate();
    const { config } = useSchool();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const navItems = [
        { path: '/food-portal/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/food-portal/students', icon: Users, label: 'Students' },
        { path: '/food-portal/menu', icon: Utensils, label: 'Meal Options' },
        { path: '/food-portal/serving-list', icon: ClipboardList, label: 'Serving Lists' },
    ];

    return (
        <>
            {/* Mobile Trigger */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-2 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Backdrop */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`
                    fixed md:sticky top-0 left-0 h-screen bg-white dark:bg-slate-900 
                    border-r border-slate-200 dark:border-slate-800 z-50 transition-all duration-300 ease-in-out
                    ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                    ${collapsed ? 'w-20' : 'w-72'}
                `}
            >
                {/* Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
                    {!collapsed && (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                                <Coffee size={20} />
                            </div>
                            <span className="font-bold text-xl text-slate-900 dark:text-white tracking-tight">
                                {config.school_name} <span className="text-orange-600">Food</span>
                            </span>
                        </div>
                    )}
                    {collapsed && (
                        <div className="mx-auto w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
                            <Coffee size={24} />
                        </div>
                    )}

                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden md:flex p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-orange-500 transition-colors"
                    >
                        {collapsed ? <ChevronRight size={16} /> : <X size={16} />}
                    </button>
                </div>

                {/* Navigation */}
                <div className="p-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            className={({ isActive }) => `
                                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden
                                ${isActive
                                    ? 'bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-400 font-semibold shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                }
                            `}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon size={22} className={`
                                transition-colors
                                ${collapsed ? 'mx-auto' : ''}
                            `} />

                                    {!collapsed && <span>{item.label}</span>}

                                    {/* Active Indicator Bar */}
                                    <div className={`
                                absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-orange-500 transition-all duration-300
                                ${isActive ? 'opacity-100' : 'opacity-0'}
                            `} />
                                </>
                            )}
                        </NavLink>
                    ))}
                </div>

                {/* Footer / User Profile */}
                <div className="absolute bottom-0 w-full p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm">
                    <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
                        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 font-bold">
                            {user?.username?.[0]?.toUpperCase() || 'U'}
                        </div>

                        {!collapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                    {user?.username || 'User'}
                                </p>
                                <p className="text-xs text-slate-500 truncate">Food Manager</p>
                            </div>
                        )}

                        {!collapsed && (
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                            >
                                <LogOut size={18} />
                            </button>
                        )}
                        <ThemeToggle collapsed={collapsed} />
                    </div>
                </div>
            </aside>
        </>
    );
};

export default FoodSidebar;
