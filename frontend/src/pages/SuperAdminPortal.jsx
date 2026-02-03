import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Shield, Users, Settings, Plus,
    Trash2, Edit2, CheckCircle, XCircle,
    Search, TrendingUp, Activity, Briefcase, ExternalLink,
    Filter, Download, MoreVertical, Mail, Phone, Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const SuperAdminPortal = () => {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/super-portal/schools/');
            setSchools(response.data);
        } catch (error) {
            console.error('Error fetching schools:', error);
            toast.error('Failed to load institution data');
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (schoolId) => {
        try {
            await axios.post(`/api/super-portal/schools/${schoolId}/toggle-active/`);
            toast.success('Access state toggled');
            fetchData();
        } catch (error) {
            toast.error('Control command failed');
        }
    };

    const handleDeleteSchool = async (schoolId) => {
        if (!window.confirm('CRITICAL ACTION: Are you sure? This will purge all school data from the core.')) {
            return;
        }

        try {
            await axios.delete(`/api/super-portal/schools/${schoolId}/`);
            toast.success('Institution purged');
            setSchools(schools.filter(s => s.id !== schoolId));
        } catch (error) {
            toast.error('Purge operation failed');
        }
    };

    const handleUpdateSchool = async (e) => {
        e.preventDefault();
        try {
            await axios.patch(`/api/super-portal/schools/${selectedSchool.id}/`, {
                subscription_plan: selectedSchool.subscription_plan,
                subscription_status: selectedSchool.subscription_status
            });
            toast.success('Core configuration updated');
            setIsEditModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Config update failed');
        }
    };

    const handleViewPortal = (school) => {
        localStorage.setItem('portal_slug', school.portal_slug);
        window.open('/dashboard', '_blank');
    };

    const filteredSchools = schools.filter(school =>
        school.school_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        school.school_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (school.admin_email && school.admin_email.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">INSTITUTION REGISTRY</h1>
                    <p className="text-slate-500 font-medium text-sm lg:text-base">Manage and monitor all connected educational entities</p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative group flex-1 lg:flex-none">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors" size={18} />
                        <input
                            type="text"
                            placeholder="Find institution..."
                            className="bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-6 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none w-full lg:w-80 text-sm text-white placeholder:text-slate-600 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-slate-700 transition-all">
                            <Filter size={20} />
                        </button>
                        <button className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white hover:border-slate-700 transition-all">
                            <Download size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-slate-900/30 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800">
                                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Institution Profile</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Population</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Deployment</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-6 text-xs font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/40">
                            {filteredSchools.map((school) => (
                                <tr key={school.id} className="hover:bg-primary-500/[0.02] transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1.5">
                                            <span className="text-base font-black text-white group-hover:text-primary-400 transition-colors">{school.school_name}</span>
                                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                                                <span className="flex items-center gap-1.5 text-xs text-slate-500 font-bold overflow-hidden">
                                                    <Mail size={12} className="shrink-0" /> {school.admin_email}
                                                </span>
                                                <span className="flex items-center gap-1.5 text-xs text-primary-500/80 font-black tracking-widest uppercase">
                                                    <Globe size={12} className="shrink-0" /> {school.portal_slug}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-6">
                                            <div className="flex flex-col">
                                                <span className="text-lg font-black text-white leading-none">{school.student_count}</span>
                                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Students</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-lg font-black text-white leading-none">{school.staff_total || 0}</span>
                                                <span className="text-[10px] text-slate-500 font-black uppercase tracking-tighter">Staff</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className={`w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${school.subscription_plan === 'Enterprise' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                                                school.subscription_plan === 'Standard' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                                                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                                }`}>
                                                {school.subscription_plan}
                                            </span>
                                            <span className="text-[10px] text-slate-600 font-bold uppercase mt-1">{school.subscription_status}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <button
                                            onClick={() => handleToggleStatus(school.id)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${school.is_active
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 shadow-lg shadow-emerald-500/5'
                                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20'
                                                }`}
                                        >
                                            <div className={`w-1.5 h-1.5 rounded-full ${school.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
                                            {school.is_active ? 'Online' : 'Restricted'}
                                        </button>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                            <button
                                                onClick={() => handleViewPortal(school)}
                                                className="w-10 h-10 flex items-center justify-center bg-slate-800/80 hover:bg-primary-600 text-slate-300 hover:text-white rounded-xl transition-all shadow-xl"
                                                title="Control Dashboard"
                                            >
                                                <ExternalLink size={16} />
                                            </button>
                                            <button
                                                onClick={() => { setSelectedSchool(school); setIsEditModalOpen(true); }}
                                                className="w-10 h-10 flex items-center justify-center bg-slate-800/80 hover:bg-indigo-600 text-slate-300 hover:text-white rounded-xl transition-all shadow-xl"
                                                title="System Configuration"
                                            >
                                                <Settings size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteSchool(school.id)}
                                                className="w-10 h-10 flex items-center justify-center bg-slate-800/80 hover:bg-rose-600 text-slate-300 hover:text-white rounded-xl transition-all shadow-xl"
                                                title="Purge Command"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Mobile Card View */}
            <div className="lg:hidden space-y-4">
                {filteredSchools.map((school) => (
                    <div key={school.id} className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-black text-white leading-tight">{school.school_name}</h3>
                                <p className="text-xs text-slate-500 font-bold truncate max-w-[200px] mt-1">{school.admin_email}</p>
                            </div>
                            <button
                                onClick={() => handleToggleStatus(school.id)}
                                className={`p-2 rounded-xl border ${school.is_active ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}
                            >
                                <Activity size={18} />
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-800/50">
                            <div>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Students</p>
                                <p className="text-xl font-black text-white">{school.student_count}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Staff</p>
                                <p className="text-xl font-black text-white">{school.staff_total || 0}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest w-fit ${school.subscription_plan === 'Enterprise' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                    {school.subscription_plan}
                                </span>
                                <span className="text-[10px] text-primary-500 font-black truncate">{school.portal_slug}</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleViewPortal(school)} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white"><ExternalLink size={16} /></button>
                                <button onClick={() => { setSelectedSchool(school); setIsEditModalOpen(true); }} className="p-3 bg-slate-800 rounded-xl text-slate-400 hover:text-white"><Settings size={16} /></button>
                                <button onClick={() => handleDeleteSchool(school.id)} className="p-3 bg-rose-500/10 text-rose-500 rounded-xl"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal (Theming as Dark Terminal) */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] w-full max-w-lg shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
                        <div className="px-10 py-8 border-b border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="font-black text-2xl text-white tracking-tight">CONFIGURE CELL</h3>
                                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest mt-1">{selectedSchool.school_name} // 0x{selectedSchool.id}</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-12 h-12 flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl transition-all"><XCircle /></button>
                        </div>
                        <form onSubmit={handleUpdateSchool} className="p-10 space-y-8">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Licensing Tier</label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold appearance-none cursor-pointer"
                                        value={selectedSchool.subscription_plan}
                                        onChange={(e) => setSelectedSchool({ ...selectedSchool, subscription_plan: e.target.value })}
                                    >
                                        <option value="Basic">Basic Deployment</option>
                                        <option value="Standard">Standard Deployment</option>
                                        <option value="Enterprise">Enterprise Deployment</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Account State</label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-sm text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all font-bold appearance-none cursor-pointer"
                                        value={selectedSchool.subscription_status}
                                        onChange={(e) => setSelectedSchool({ ...selectedSchool, subscription_status: e.target.value })}
                                    >
                                        <option value="Trial">Evaluation Phase</option>
                                        <option value="Active">Authorized Active</option>
                                        <option value="Expired">Deployment Expired</option>
                                        <option value="Canceled">Service Terminated</option>
                                    </select>
                                </div>
                            </div>
                            <div className="pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="flex-1 px-8 py-5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-8 py-5 bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary-500/20 transition-all active:scale-95"
                                >
                                    Push Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SuperAdminPortal;
