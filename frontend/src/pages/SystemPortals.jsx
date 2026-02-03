import React, { useState } from 'react';
import {
    Layout, Users, Car, Wallet, Utensils,
    ExternalLink, Lock, Shield, Settings,
    Cpu, GraduationCap
} from 'lucide-react';
import toast from 'react-hot-toast';

const SystemPortals = () => {
    // Define the portals available in the ecosystem
    const [portals] = useState([
        {
            id: 'teacher',
            name: 'Teacher Workspace',
            description: 'Academic management, grading, attendance, and student tracking interface for teaching staff.',
            icon: GraduationCap,
            path: '/teacher-login',
            color: 'from-emerald-600 to-emerald-400',
            status: 'Active',
            role: 'TEACHER', // Default role for testing
            default_cred: 'Teacher@123'
        },
        {
            id: 'student',
            name: 'Student Portal',
            description: 'Personalized dashboard for students to view grades, assignments, and financial standing.',
            icon: Users,
            path: '/student-login',
            color: 'from-blue-600 to-blue-400',
            status: 'Active',
            role: 'STUDENT',
            default_cred: 'Student@123'
        },
        {
            id: 'finance',
            name: 'Finance Terminal',
            description: 'Advanced accounting control center for school bursars and accountants to manage fees and expenses.',
            icon: Wallet,
            path: '/finance-login',
            color: 'from-indigo-600 to-indigo-400',
            status: 'Active',
            role: 'ACCOUNTANT',
            default_cred: 'Finance@123'
        },
        {
            id: 'transport',
            name: 'Logistics Command',
            description: 'Fleet management, route optimization, and driver coordination system for transport managers.',
            icon: Car,
            path: '/transport-login',
            color: 'from-amber-600 to-amber-400',
            status: 'Active',
            role: 'TRANSPORT',
            default_cred: 'Transport@123'
        },
        {
            id: 'food',
            name: 'Catering Hub',
            description: 'Inventory control, meal usage tracking, and cafeteria management system.',
            icon: Utensils,
            path: '/food-login',
            color: 'from-rose-600 to-rose-400',
            status: 'Active',
            role: 'CATERING',
            default_cred: 'Food@123'
        },
        {
            id: 'driver',
            name: 'Driver App',
            description: 'Mobile-first interface for drivers to view routes, schedules, and log maintenance.',
            icon: Layout,
            path: '/driver-login',
            color: 'from-slate-600 to-slate-400',
            status: 'Active',
            role: 'DRIVER',
            default_cred: 'Driver@123'
        }
    ]);

    const handleVisitPortal = (path) => {
        window.open(path, '_blank');
    };

    const handleCopyCred = (cred) => {
        navigator.clipboard.writeText(cred);
        toast.success(`Copied default credential: ${cred}`);
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">SYSTEM PORTALS</h1>
                    <p className="text-slate-500 font-medium text-sm lg:text-base">
                        Direct access and configuration for all subsystem interfaces
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">All Systems Operational</span>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portals.map((portal) => (
                    <div
                        key={portal.id}
                        className="group relative bg-slate-900/40 backdrop-blur-xl border border-slate-800 hover:border-slate-700 rounded-[2rem] p-8 transition-all hover:-translate-y-1 hover:shadow-2xl overflow-hidden"
                    >
                        {/* Gradient Background Effect */}
                        <div className={`absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br ${portal.color} opacity-[0.03] group-hover:opacity-[0.08] rounded-full blur-3xl transition-opacity duration-500`}></div>

                        <div className="relative z-10">
                            {/* Icon Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${portal.color} flex items-center justify-center shadow-lg`}>
                                    <portal.icon className="text-white" size={24} />
                                </div>
                                <div className="px-3 py-1 bg-slate-950/50 border border-slate-800 backdrop-blur-md rounded-full">
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{portal.status}</span>
                                </div>
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-black text-white mb-3 tracking-tight">{portal.name}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-8 h-10 line-clamp-2">
                                {portal.description}
                            </p>

                            {/* Default Credential Pill */}
                            <div
                                onClick={() => handleCopyCred(portal.default_cred)}
                                className="mb-8 p-3 bg-slate-950/50 border border-slate-800 rounded-xl cursor-pointer hover:border-slate-700 transition-colors group/pill"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Default Pass Key</span>
                                    <Lock size={10} className="text-slate-600" />
                                </div>
                                <div className="flex items-center gap-2 mt-1">
                                    <code className="text-xs font-mono text-primary-400">{portal.default_cred}</code>
                                    <span className="text-[10px] text-slate-600 opacity-0 group-hover/pill:opacity-100 transition-opacity">Click to copy</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleVisitPortal(portal.path)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-900 py-3 rounded-xl hover:bg-slate-200 transition-colors font-bold text-sm"
                                >
                                    Access Portal <ExternalLink size={14} />
                                </button>
                                <button className="p-3 bg-slate-800 text-slate-400 rounded-xl hover:bg-slate-700 hover:text-white transition-colors">
                                    <Settings size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-purple-500/20">
                    <Shield className="text-white" size={32} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-black text-white mb-2">Master Override Protocol</h3>
                    <p className="text-slate-400 text-sm max-w-2xl">
                        As a Super Administrator, your session token allows you to bypass standard authentication checks on all child portals.
                        Use the "Access Portal" buttons above to simulate user sessions for debugging or support.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default SystemPortals;
