import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    User, Mail, Phone, Calendar, MapPin, Briefcase,
    CreditCard, FileText, ChevronLeft, Edit, Trash2,
    Shield, Clock, DollarSign, Activity, Download
} from 'lucide-react';
import Button from '../components/ui/Button';
import axios from 'axios';
import { motion } from 'framer-motion';

const Card = ({ children, className = "" }) => (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden ${className}`}>
        {children}
    </div>
);

const StaffDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [staff, setStaff] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        fetchStaffDetails();
    }, [id]);

    const fetchStaffDetails = async () => {
        try {
            const response = await axios.get(`/api/hr/staff/${id}/`);
            setStaff(response.data.staff);
        } catch (error) {
            console.error('Error fetching staff details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${staff.personal.full_name}?`)) {
            try {
                await axios.delete(`/api/hr/staff/${staff.id}/delete/`); // Check route consistency
                navigate('/hr/staff');
            } catch (error) {
                alert('Error deleting staff member');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!staff) {
        return (
            <div className="text-center py-20">
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Staff member not found</h2>
                <Button variant="outline" className="mt-4" onClick={() => navigate('/hr/staff')}>
                    Back to Staff List
                </Button>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: User },
        { id: 'professional', label: 'Professional', icon: Briefcase },
        { id: 'financial', label: 'Financial', icon: DollarSign },
        { id: 'leaves', label: 'Leave & Attendance', icon: Clock },
    ];

    return (
        <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" onClick={() => navigate('/hr/staff')}>
                        <ChevronLeft size={20} className="mr-1" /> Back to Staff
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => navigate(`/hr/staff/${id}/edit`)}>
                            <Edit size={18} className="mr-2" /> Edit Profile
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            <Trash2 size={18} className="mr-2" /> Delete
                        </Button>
                    </div>
                </div>

                {/* Profile Header Card */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="h-32 w-32 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-4xl font-bold text-slate-400 border-4 border-white dark:border-slate-900 shadow-md">
                            {staff.personal.first_name[0]}{staff.personal.last_name[0]}
                        </div>
                        <div className="flex-1 text-center md:text-left space-y-2">
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{staff.personal.full_name}</h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1"><Briefcase size={16} /> {staff.professional.position}</span>
                                <span className="flex items-center gap-1"><MapPin size={16} /> {staff.personal.address || 'No Address'}</span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${staff.professional.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                                    staff.professional.status === 'ON_LEAVE' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                        'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                    {staff.professional.status}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 min-w-[200px]">
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                                    <Phone size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Phone</p>
                                    <p className="text-sm font-medium">{staff.personal.phone}</p>
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                                    <Mail size={18} />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Email</p>
                                    <p className="text-sm font-medium truncate max-w-[150px]">{staff.personal.email}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-t-xl px-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="space-y-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <User size={20} className="text-primary-500" /> Personal Details
                                </h3>
                                <div className="space-y-4">
                                    <DetailRow label="First Name" value={staff.personal.first_name} />
                                    <DetailRow label="Last Name" value={staff.personal.last_name} />
                                    <DetailRow label="National ID" value={staff.personal.national_id} />
                                    <DetailRow label="Date of Birth" value={staff.personal.date_of_birth} />
                                    <DetailRow label="Gender" value={staff.personal.gender} />
                                    <DetailRow label="Nationality" value={staff.personal.nationality} />
                                    <DetailRow label="Marital Status" value={staff.personal.marital_status} />
                                    <DetailRow label="Religion" value={staff.personal.religion} />
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Shield size={20} className="text-red-500" /> Emergency Contact
                                    </h3>
                                    <div className="space-y-4">
                                        <DetailRow label="Name" value={staff.emergency.contact_name || 'Not provided'} />
                                        <DetailRow label="Phone" value={staff.emergency.contact_phone || 'Not provided'} />
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <FileText size={20} className="text-amber-500" /> Job Description
                                    </h3>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                                        {staff.professional.job_description || 'No job description available.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'professional' && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <Briefcase size={20} className="text-blue-500" /> Employment Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <DetailRow label="Staff Type" value={staff.professional.staff_type_display} />
                                <DetailRow label="Position" value={staff.professional.position} />
                                <DetailRow label="Date Joined" value={staff.professional.date_joined} />
                                <DetailRow label="Current Status" value={staff.professional.status} />
                                <DetailRow label="Supervisor" value={staff.professional.supervisor_name || 'None'} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'financial' && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <CreditCard size={20} className="text-green-500" /> Financial Information
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <Card className="p-6 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none shadow-md">
                                    <div className="flex items-center gap-3 mb-2 opacity-80">
                                        <DollarSign size={20} />
                                        <span className="text-sm font-medium">Basic Salary</span>
                                    </div>
                                    <div className="text-3xl font-bold">KES {staff.financial.basic_salary?.toLocaleString()}</div>
                                    <div className="mt-4 text-[10px] opacity-70 bg-white/10 px-2 py-1 rounded inline-block uppercase font-bold tracking-wider">Base Rate</div>
                                </Card>
                                <Card className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-none shadow-md">
                                    <div className="flex items-center gap-3 mb-2 opacity-80">
                                        <CreditCard size={20} />
                                        <span className="text-sm font-medium">Net Pay</span>
                                    </div>
                                    <div className="text-3xl font-bold">KES {staff.financial.net_salary?.toLocaleString()}</div>
                                    <div className="mt-4 text-[10px] opacity-70 bg-white/10 px-2 py-1 rounded inline-block uppercase font-bold tracking-wider">Take Home</div>
                                </Card>
                            </div>

                            {/* Detailed Breakdown */}
                            <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                    <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Financial Breakdown</h4>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-[10px] h-7"
                                        onClick={() => navigate('/finance/salaries', { state: { search: staff.personal.full_name } })}
                                    >
                                        Manage in Payroll
                                    </Button>
                                </div>
                                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-slate-600 dark:text-slate-400">Monthly Allowances</span>
                                            <span className="text-sm font-bold text-emerald-600">+ KES {staff.financial.allowances?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500">PAYE/Other Deductions</span>
                                            <span className="font-bold text-rose-500">- KES {staff.financial.deductions?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500">NSSF Contribution</span>
                                            <span className="font-bold text-rose-500">- KES {staff.financial.nssf?.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-slate-500">Loan Repayments</span>
                                            <span className="font-bold text-rose-500">- KES {staff.financial.loans?.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <h4 className="font-semibold text-slate-700 dark:text-slate-300 mb-2">Salary Advances History</h4>
                            {staff.advances.length > 0 ? (
                                <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-medium">
                                            <tr>
                                                <th className="px-4 py-3">Date</th>
                                                <th className="px-4 py-3">Amount</th>
                                                <th className="px-4 py-3">Status</th>
                                                <th className="px-4 py-3">Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                                            {staff.advances.map((advance, index) => (
                                                <tr key={index}>
                                                    <td className="px-4 py-3">{advance.date}</td>
                                                    <td className="px-4 py-3 font-medium">KES {advance.amount.toLocaleString()}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${advance.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                            advance.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                                'bg-amber-100 text-amber-700'
                                                            }`}>
                                                            {advance.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">{advance.reason}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic">No salary advance history found.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'leaves' && (
                        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <History size={20} className="text-purple-500" /> Recent Leave History
                            </h3>
                            {staff.leaves.length > 0 ? (
                                <div className="space-y-4">
                                    {staff.leaves.map((leave, index) => (
                                        <div key={index} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                                            <div>
                                                <p className="font-medium text-slate-900 dark:text-white">{leave.type}</p>
                                                <p className="text-sm text-slate-500">{leave.start_date} - {leave.end_date}</p>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-2 py-0.5 rounded text-xs font-bold ${leave.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                                                    leave.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                        'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {leave.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic">No leave history found.</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const DetailRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-slate-100 dark:border-slate-800 last:border-0">
        <span className="text-sm text-slate-500 w-1/3">{label}</span>
        <span className="text-sm font-medium text-slate-900 dark:text-white flex-1">{value || '-'}</span>
    </div>
);

// Fallback icon for History if not imported
const History = ({ size, className }) => (
    <Activity size={size} className={className} />
);

export default StaffDetail;
