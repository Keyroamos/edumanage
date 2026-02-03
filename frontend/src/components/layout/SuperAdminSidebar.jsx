import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Shield, Grid, Globe, Users, Settings, LogOut,
    ChevronRight, Activity, CreditCard, Layout
} from 'lucide-react';
import ThemeToggle from '../ui/ThemeToggle';

const SidebarItem = ({ icon: Icon, label, path, active, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${active
            ? 'bg-primary-500/10 text-primary-500 font-bold border border-primary-500/20 shadow-lg shadow-primary-500/5'
            : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
    >
        <Icon size={20} className={active ? 'text-primary-500' : 'text-slate-500 group-hover:text-slate-300'} />
        <span className="flex-1 text-left text-sm tracking-wide">{label}</span>
        {active && <ChevronRight size={14} className="text-primary-500" />}
    </button>
);

const SuperAdminSidebar = ({ onClose }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleNavigate = (path) => {
        navigate(path);
        if (onClose) onClose();
    };

    const menuItems = [
        { icon: Grid, label: 'Dashboard', path: '/ultimate-control-center' },
        { icon: Globe, label: 'Manage Schools', path: '/ultimate-control-center/schools' },
        { icon: Layout, label: 'System Portals', path: '/ultimate-control-center/portals' },
        { icon: Activity, label: 'Platform Health', path: '/ultimate-control-center/health' },
        { icon: CreditCard, label: 'Subscriptions', path: '/ultimate-control-center/billing' },
        { icon: Settings, label: 'Global Settings', path: '/ultimate-control-center/settings' },
    ];

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/super-login');
    };

    return (
        <div className="w-72 bg-slate-950 border-r border-slate-900 flex flex-col h-screen overflow-hidden relative z-50">
            {/* Brand Header */}
            <div className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-500/20">
                        <Shield size={22} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-black text-white tracking-tight leading-none">EDUMANAGE</h2>
                        <span className="text-[10px] text-primary-500 font-black tracking-widest uppercase">Hyperion Core</span>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                <div className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Main Terminal</div>
                {menuItems.map((item) => (
                    <SidebarItem
                        key={item.path}
                        icon={item.icon}
                        label={item.label}
                        path={item.path}
                        active={location.pathname === item.path}
                        onClick={() => handleNavigate(item.path)}
                    />
                ))}
            </nav>

            {/* User Status */}
            <div className="p-4 m-4 rounded-2xl bg-slate-900/50 border border-slate-800/50">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-primary-500/30 flex items-center justify-center font-bold text-primary-500">
                        AD
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-bold text-white truncate">{user.first_name || 'Administrator'}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Master Control</p>
                    </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <ThemeToggle />
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-rose-500 text-xs font-bold hover:text-rose-400 transition-colors"
                    >
                        <LogOut size={14} />
                        EXIT CORE
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminSidebar;
