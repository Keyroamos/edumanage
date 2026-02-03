import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    UserCheck, Plus, Search, Filter, MoreVertical, Edit, Trash2, Eye,
    Phone, Mail, Calendar, Briefcase, Users, Download, Upload
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import axios from 'axios';
import { motion } from 'framer-motion';

const StaffCard = ({ staff, onView, onEdit, onDelete }) => {
    const [showMenu, setShowMenu] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'ON_LEAVE': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'INACTIVE': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 md:p-6 hover:shadow-lg transition-all relative group"
        >
            <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xl border border-indigo-100 dark:border-indigo-800/50">
                        {staff.first_name[0]}{staff.last_name[0]}
                    </div>
                    <div>
                        <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-white leading-tight">{staff.first_name} {staff.last_name}</h3>
                        <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 uppercase">{staff.staff_type_display}</p>
                    </div>
                </div>
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors bg-slate-50 dark:bg-slate-800/50"
                    >
                        <MoreVertical size={18} className="text-slate-400" />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 z-20">
                            <button onClick={() => { onView(staff); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors">
                                <Eye size={16} className="text-indigo-500" /> View Details
                            </button>
                            <button onClick={() => { onEdit(staff); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors">
                                <Edit size={16} className="text-indigo-500" /> Edit Profile
                            </button>
                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 mx-4" />
                            <button onClick={() => { onDelete(staff); setShowMenu(false); }} className="w-full px-4 py-2.5 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 flex items-center gap-3 transition-colors">
                                <Trash2 size={16} /> Delete Record
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <Phone size={14} className="text-indigo-500" />
                    <span>{staff.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-xl border border-slate-100 dark:border-slate-800/50">
                    <Mail size={14} className="text-indigo-500" />
                    <span className="truncate">{staff.email}</span>
                </div>
                <div className="flex items-center gap-3 text-xs font-bold text-slate-500 dark:text-slate-400">
                    <Calendar size={14} className="text-indigo-500" />
                    <span>Joined: {new Date(staff.date_joined).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-800">
                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getStatusColor(staff.status)}`}>
                    {staff.status}
                </span>
                <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Salary</p>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                        KES {parseFloat(staff.basic_salary).toLocaleString()}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

const HRStaff = () => {
    const navigate = useNavigate();
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        try {
            const response = await axios.get('/api/hr/staff/');
            setStaff(response.data.staff);
        } catch (error) {
            console.error('Error fetching staff:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleView = (staffMember) => {
        if (staffMember.is_teacher) {
            navigate(`/teachers/${staffMember.id}`);
        } else if (staffMember.is_driver) {
            navigate(`/transport-portal/drivers/${staffMember.id}`);
        } else {
            navigate(`/hr/staff/${staffMember.id}`);
        }
    };

    const handleEdit = (staffMember) => {
        if (staffMember.is_teacher) {
            navigate(`/teachers/${staffMember.id}`);
        } else if (staffMember.is_driver) {
            navigate(`/transport-portal/drivers/${staffMember.id}`);
        } else {
            navigate(`/hr/staff/${staffMember.id}/edit`);
        }
    };

    const handleDelete = async (staffMember) => {
        let deleteUrl = `/api/hr/staff/${staffMember.id}/delete/`;
        let confirmText = `Are you sure you want to delete ${staffMember.first_name} ${staffMember.last_name}?`;

        if (staffMember.is_teacher) {
            deleteUrl = `/api/teachers/${staffMember.id}/`;
            confirmText = `Are you sure you want to delete Teacher ${staffMember.first_name} ${staffMember.last_name}? This will also delete their user account.`;
        } else if (staffMember.is_driver) {
            deleteUrl = `/api/transport/drivers/${staffMember.id}/`;
            confirmText = `Are you sure you want to delete Driver ${staffMember.first_name} ${staffMember.last_name}?`;
        }

        if (window.confirm(confirmText)) {
            try {
                await axios.delete(deleteUrl);
                fetchStaff();
            } catch (error) {
                alert(error.response?.data?.error || `Error deleting staff member`);
            }
        }
    };

    const handleDeleteAll = async () => {
        const confirm1 = window.confirm('CRITICAL WARNING: You are about to delete ALL staff members (Teachers, Drivers, and Non-teaching staff). This will also delete their associated user accounts and cannot be undone. Are you absolutely sure?');
        if (confirm1) {
            const confirm2 = window.confirm('Final Confirmation: Removal of all institutional staff is a destructive action. Proceed?');
            if (confirm2) {
                try {
                    await axios.delete('/api/hr/staff/bulk-delete/');
                    fetchStaff();
                } catch (error) {
                    alert(error.response?.data?.error || 'Failed to delete all staff');
                }
            }
        }
    };

    const filteredStaff = staff.filter(s => {
        const matchesSearch = `${s.first_name} ${s.last_name} ${s.email}`.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'ALL' || s.staff_type === filterType;
        const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus;
        return matchesSearch && matchesType && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 md:h-16 md:w-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <UserCheck size={28} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Staff Management</h1>
                                <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Manage non-teaching staff members</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 md:flex-none h-11 md:h-12 rounded-xl font-bold text-xs text-red-600 border-red-100 hover:bg-red-50" onClick={handleDeleteAll}>
                                <Trash2 size={18} className="mr-2" /> Delete All
                            </Button>
                            <Button variant="outline" className="flex-1 md:flex-none h-11 md:h-12 rounded-xl font-bold text-xs" onClick={() => navigate('/hr/staff/import')}>
                                <Upload size={18} className="mr-2 text-indigo-500" /> Import
                            </Button>
                            <Button className="flex-1 md:flex-none h-11 md:h-12 rounded-xl font-bold text-xs bg-indigo-600 shadow-lg shadow-indigo-500/10" onClick={() => navigate('/hr/staff/create')}>
                                <Plus size={18} className="mr-2" /> Add Staff
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 md:p-6 mb-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                        <div className="md:col-span-2">
                            <Input
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                icon={Search}
                                className="h-11 md:h-12 rounded-xl font-bold"
                            />
                        </div>
                        <div>
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full h-11 md:h-12 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 focus:ring-indigo-500 font-bold text-xs px-4"
                            >
                                <option value="ALL">All Staff Types</option>
                                <option value="TEACHER">Teaching Staff</option>
                                <option value="DRIVER">Drivers</option>
                                <option value="ADMIN">Administrative</option>
                                <option value="SUPPORT">Support Staff</option>
                                <option value="SECURITY">Security</option>
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="KITCHEN">Kitchen</option>
                                <option value="LIBRARIAN">Librarian</option>
                                <option value="LAB_TECH">Lab Technician</option>
                                <option value="NURSE">Nurse</option>
                                <option value="CLEANER">Cleaner</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full h-11 md:h-12 rounded-xl border-slate-200 dark:border-slate-800 dark:bg-slate-800 focus:ring-indigo-500 font-bold text-xs px-4"
                            >
                                <option value="ALL">All Active Status</option>
                                <option value="ACTIVE">Active</option>
                                <option value="ON_LEAVE">On Leave</option>
                                <option value="INACTIVE">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
                    {[
                        { label: 'Total Staff', value: staff.length, icon: Users, color: 'indigo' },
                        { label: 'Active', value: staff.filter(s => s.status === 'ACTIVE').length, icon: UserCheck, color: 'emerald' },
                        { label: 'On Leave', value: staff.filter(s => s.status === 'ON_LEAVE').length, icon: Calendar, color: 'amber' },
                        { label: 'Inactive', value: staff.filter(s => s.status === 'INACTIVE').length, icon: Briefcase, color: 'rose' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`p-2.5 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                                    <stat.icon size={20} />
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                                <h3 className={`text-xl font-bold text-slate-900 dark:text-white`}>{stat.value}</h3>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Staff Grid */}
                {filteredStaff.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStaff.map(staffMember => (
                            <StaffCard
                                key={`${staffMember.staff_type}-${staffMember.id}`}
                                staff={staffMember}
                                onView={handleView}
                                onEdit={handleEdit}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center">
                        <UserCheck size={48} className="mx-auto text-slate-300 dark:text-slate-700 mb-4" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No staff members found</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">Get started by adding your first staff member</p>
                        <Button onClick={() => navigate('/hr/staff/create')}>
                            <Plus size={18} className="mr-2" /> Add Staff Member
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HRStaff;
