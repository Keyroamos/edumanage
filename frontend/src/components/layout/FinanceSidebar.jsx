import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, FileText, PieChart, LogOut, X, DollarSign,
    Truck, Wallet, Utensils, Receipt
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
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold shadow-sm border border-indigo-100 dark:border-indigo-800'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
        >
            <Icon size={18} className={isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'} />
            <span className="text-sm">{label}</span>
            {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />}
        </button>
    );
};

const FinanceSidebar = ({ isOpen, onClose, user, onLogout }) => {
    const navigate = useNavigate();
    const { config } = useSchool();

    const currentPlan = config?.subscription?.plan || 'Basic';
    const subscriptionStatus = config?.subscription?.status;
    const isEnterprise = (currentPlan === 'Enterprise' || subscriptionStatus === 'Trial') && currentPlan !== 'Standard';

    const handleNavigate = (path) => {
        navigate(path);
        if (onClose) onClose();
    };

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/20 backdrop-blur-[2px] z-40 lg:hidden"
                    onClick={onClose}
                ></div>
            )}

            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col h-full shadow-2xl lg:shadow-none
      `}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white overflow-hidden">
                            {config.school_logo ? (
                                <img src={config.school_logo} alt="School Logo" className="h-full w-full object-cover" />
                            ) : (
                                <DollarSign size={20} />
                            )}
                        </div>
                        <div>
                            <span className="font-bold text-lg text-slate-900 dark:text-white tracking-tight block">{config.school_name}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-widest uppercase">Console</span>
                        </div>
                    </div>
                    <button className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" onClick={onClose}>
                        <X size={20} className="text-slate-500 dark:text-slate-400" />
                    </button>
                </div>

                <div className="p-4 space-y-1 overflow-y-auto flex-1 no-scrollbar">
                    <div className="px-4 py-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">General</div>
                    <SidebarLink icon={LayoutDashboard} label="Overview" path="/finance-portal/dashboard" onClick={() => handleNavigate('/finance-portal/dashboard')} />
                    <SidebarLink icon={Users} label="Accounts" path="/finance-portal/accounts" onClick={() => handleNavigate('/finance-portal/accounts')} />
                    <SidebarLink icon={FileText} label="Ledger" path="/finance-portal/transactions" onClick={() => handleNavigate('/finance-portal/transactions')} />
                    <SidebarLink icon={Receipt} label="Expenses" path="/finance-portal/expenses" onClick={() => handleNavigate('/finance-portal/expenses')} />
                    <SidebarLink icon={PieChart} label="Analytics" path="/finance-portal/reports" onClick={() => handleNavigate('/finance-portal/reports')} />

                    <div className="px-4 py-2 mt-6 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Specialized</div>
                    {isEnterprise && <SidebarLink icon={Truck} label="Fleet Ops" path="/finance-portal/transport-expenses" onClick={() => handleNavigate('/finance-portal/transport-expenses')} />}
                    <SidebarLink icon={Wallet} label="Payroll" path="/finance-portal/salaries" onClick={() => handleNavigate('/finance-portal/salaries')} />
                    {isEnterprise && <SidebarLink icon={Utensils} label="Cafeteria" path="/finance-portal/food" onClick={() => handleNavigate('/finance-portal/food')} />}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
                    <div className="flex items-center gap-3 mb-4 p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                        <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs ring-2 ring-white dark:ring-slate-800">
                            {user.first_name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Finance Staff</p>
                            <p className="text-[10px] text-slate-500 font-medium">Standard Access</p>
                        </div>
                        <ThemeToggle />
                    </div>
                    <Button
                        onClick={onLogout}
                        variant="ghost"
                        className="w-full justify-start text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:text-rose-600 h-11 px-6 rounded-xl border border-transparent hover:border-rose-100 dark:hover:border-rose-900/30"
                    >
                        <LogOut size={18} className="mr-2" />
                        Log Out
                    </Button>
                </div>
            </aside>
        </>
    );
};

export default FinanceSidebar;
