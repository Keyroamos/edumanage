import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Users, GraduationCap, DollarSign, Calendar, Settings, LogOut, X, BookOpen, UserCheck, ClipboardCheck, RefreshCw, CreditCard, MessageSquare, Zap, Shield
} from 'lucide-react';
import Button from '../ui/Button';
import ThemeToggle from '../ui/ThemeToggle';
import { useSchool } from '../../context/SchoolContext';

const SidebarLink = ({ icon: Icon, label, path, onClick }) => {
    const location = useLocation();
    const isActive = location.pathname === path || location.pathname.startsWith(`${path}/`);

    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${isActive
                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
        >
            <Icon size={18} className={isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 dark:text-slate-500'} />
            <span className="text-sm">{label}</span>
            {isActive && <div className="ml-auto w-1 h-1 rounded-full bg-primary-600 dark:bg-primary-400" />}
        </button>
    );
};

const Sidebar = ({ isOpen, onClose, user, onLogout }) => {
    const navigate = useNavigate();
    const { config, hasFeature } = useSchool();

    const handleNavigate = (path) => {
        navigate(path);
        if (onClose) onClose(); // Close mobile sidebar on navigation
    };

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                ></div>
            )}

            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-screen lg:shadow-none
      `}>
                {/* Header */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-gradient-to-br from-primary-600 to-primary-700 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30 text-white overflow-hidden">
                            {config.school_logo ? (
                                <img src={config.school_logo} alt="School Logo" className="h-full w-full object-cover" />
                            ) : (
                                <GraduationCap size={20} />
                            )}
                        </div>
                        <div>
                            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight block leading-tight">{config.school_name}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wide uppercase">Admin Portal</span>
                        </div>
                    </div>
                    <button className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" onClick={onClose}>
                        <X size={20} className="text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                {/* Navigation */}
                <div className="p-4 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
                    <div className="px-4 py-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Main Menu</div>
                    <SidebarLink icon={Users} label="Overview" path="/dashboard" onClick={() => handleNavigate('/dashboard')} />

                    {hasFeature('STUDENT_MANAGEMENT') && (
                        <SidebarLink icon={GraduationCap} label="Students" path="/students" onClick={() => handleNavigate('/students')} />
                    )}

                    {hasFeature('ACADEMIC_MANAGEMENT') && (
                        <>
                            <SidebarLink icon={BookOpen} label="Academics" path="/academics" onClick={() => handleNavigate('/academics')} />
                            <SidebarLink icon={RefreshCw} label="Academic Management" path="/academic-management" onClick={() => handleNavigate('/academic-management')} />
                        </>
                    )}

                    {hasFeature('STUDENT_MANAGEMENT') && (
                        <SidebarLink icon={Users} label="Teachers" path="/teachers" onClick={() => handleNavigate('/teachers')} />
                    )}

                    {hasFeature('SCHEDULE') && (
                        <SidebarLink icon={Calendar} label="Schedule" path="/schedule" onClick={() => handleNavigate('/schedule')} />
                    )}

                    {hasFeature('HR_MANAGEMENT') && (
                        <>
                            <div className="px-4 py-2 mt-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">HR Management</div>
                            <SidebarLink icon={UserCheck} label="Staff" path="/hr/staff" onClick={() => handleNavigate('/hr/staff')} />
                            <SidebarLink icon={CreditCard} label="Salaries" path="/hr/salaries" onClick={() => handleNavigate('/finance/salaries')} />
                            <SidebarLink icon={ClipboardCheck} label="Approvals" path="/hr/approvals" onClick={() => handleNavigate('/hr/approvals')} />
                            <SidebarLink icon={Users} label="Supervisors" path="/hr/supervisors" onClick={() => handleNavigate('/hr/supervisors')} />
                        </>
                    )}

                    <div className="px-4 py-2 mt-6 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px]">Management</div>

                    {hasFeature('COMMUNICATION') && (
                        <SidebarLink icon={MessageSquare} label="Communication" path="/communication" onClick={() => handleNavigate('/communication')} />
                    )}

                    {hasFeature('FINANCE_MANAGEMENT') && (
                        <SidebarLink icon={DollarSign} label="Finance" path="/finance" onClick={() => handleNavigate('/finance')} />
                    )}

                    <SidebarLink icon={CreditCard} label="Subscription" path="/subscription" onClick={() => handleNavigate('/subscription')} />
                    <SidebarLink icon={Settings} label="Settings" path="/settings" onClick={() => handleNavigate('/settings')} />


                </div>

                {/* Trial Indicator */}
                {config.subscription?.status === 'Trial' && (
                    <div className="mx-4 mb-4 p-4 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-500/20">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Free Trial</span>
                            <Zap size={14} className="text-yellow-400 fill-yellow-400" />
                        </div>
                        <p className="text-sm font-bold mb-1">{config.subscription?.plan} Edition</p>
                        <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-1000"
                                style={{
                                    width: `${Math.max(0, Math.min(100, (new Date(config.subscription.trial_end) - new Date()) / (7 * 24 * 60 * 60 * 1000) * 100))}%`
                                }}
                            ></div>
                        </div>
                        <p className="text-[10px] mt-2 font-medium opacity-90">
                            {config.subscription.trial_end ? Math.max(0, Math.ceil((new Date(config.subscription.trial_end) - new Date()) / (1000 * 60 * 60 * 24))) : 0} days remaining
                        </p>
                    </div>
                )}

                {/* User Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center space-x-3 mb-4 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold border-2 border-white dark:border-slate-800 shadow-sm">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-xs text-slate-500 dark:text-slate-400 capitalize truncate">{user.role || 'Administrator'}</p>
                        </div>
                        <ThemeToggle />
                    </div>
                    <Button onClick={onLogout} variant="ghost" className="w-full justify-start text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 hover:border-red-100 dark:hover:border-red-900/30 border border-transparent">
                        <LogOut size={18} className="mr-2" />
                        Sign Out
                    </Button>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
