import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    User, Briefcase, Mail, Phone, Calendar, MapPin,
    Shield, ChevronRight, ChevronLeft, Save, X, AlertCircle, Trash2
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import axios from 'axios';

const StaffEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [supervisors, setSupervisors] = useState([]);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        national_id: '',
        staff_type: 'SUPPORT',
        position: 'Staff',
        date_of_birth: '',
        address: '',
        basic_salary: 0,
        status: 'ACTIVE',
        gender: 'M',
        religion: 'CHRISTIAN',
        marital_status: 'SINGLE',
        nationality: 'Kenyan',
        job_description: '',
        supervisor_id: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
    });

    useEffect(() => {
        fetchStaffData();
        fetchSupervisors();
    }, [id]);

    const fetchStaffData = async () => {
        try {
            const response = await axios.get(`/api/hr/staff/${id}/`);
            const staff = response.data.staff;

            setFormData({
                first_name: staff.personal.first_name,
                last_name: staff.personal.last_name,
                email: staff.personal.email,
                phone: staff.personal.phone,
                national_id: staff.personal.national_id,
                date_of_birth: staff.personal.date_of_birth,
                address: staff.personal.address,
                gender: staff.personal.gender,
                religion: staff.personal.religion,
                marital_status: staff.personal.marital_status,
                nationality: staff.personal.nationality,

                staff_type: staff.professional.staff_type,
                position: staff.professional.position,
                status: staff.professional.status,
                job_description: staff.professional.job_description,
                supervisor_id: staff.professional.supervisor_id || '',

                basic_salary: staff.financial.basic_salary,

                emergency_contact_name: staff.emergency.contact_name,
                emergency_contact_phone: staff.emergency.contact_phone,
            });
        } catch (err) {
            setError('Failed to load staff data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSupervisors = async () => {
        try {
            const response = await axios.get('/api/hr/staff/');
            setSupervisors(response.data.staff.filter(s => s.id !== parseInt(id)));
        } catch (err) {
            console.error('Error fetching staff for supervisors:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError(null);

        try {
            const response = await axios.put(`/api/hr/staff/${id}/update/`, formData);
            if (response.data.success) {
                navigate(`/hr/staff/${id}`);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update staff member');
        } finally {
            setSaving(false);
        }
    };

    const nextStep = () => setStep(prev => prev + 1);
    const prevStep = () => setStep(prev => prev - 1);

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
    );

    const staffTypes = [
        { value: 'ADMIN', label: 'Administrative' },
        { value: 'SUPPORT', label: 'Support Staff' },
        { value: 'SECURITY', label: 'Security' },
        { value: 'MAINTENANCE', label: 'Maintenance' },
        { value: 'KITCHEN', label: 'Kitchen' },
        { value: 'LIBRARIAN', label: 'Librarian' },
        { value: 'LAB_TECH', label: 'Lab Technician' },
        { value: 'NURSE', label: 'Nurse' },
        { value: 'CLEANER', label: 'Cleaner' },
        { value: 'OTHER', label: 'Other' },
    ];

    return (
        <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-950 min-h-screen">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Edit Staff Profile</h1>
                        <p className="text-slate-500 dark:text-slate-400">Update information for {formData.first_name} {formData.last_name}</p>
                    </div>
                    <Button variant="ghost" onClick={() => navigate(`/hr/staff/${id}`)}>
                        <X size={20} className="mr-2" /> Cancel
                    </Button>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 flex items-center gap-3">
                        <AlertCircle size={20} />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <div className="flex border-b border-slate-200 dark:border-slate-800">
                        <StepHeader step={1} currentStep={step} label="Personal Info" icon={User} />
                        <StepHeader step={2} currentStep={step} label="Job & Financial" icon={Briefcase} />
                        <StepHeader step={3} currentStep={step} label="Additional Details" icon={Shield} />
                    </div>

                    <form onSubmit={handleSubmit} className="p-8">
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required />
                                    <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input type="email" label="Email Address" name="email" value={formData.email} onChange={handleChange} required icon={Mail} />
                                    <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} required icon={Phone} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Select label="Gender" name="gender" value={formData.gender} onChange={handleChange} options={[{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }, { value: 'O', label: 'Other' }]} />
                                    <Select label="Marital Status" name="marital_status" value={formData.marital_status} onChange={handleChange} options={[{ value: 'SINGLE', label: 'Single' }, { value: 'MARRIED', label: 'Married' }]} />
                                    <Input label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} />
                                </div>
                                <Input label="Current Address" name="address" value={formData.address} onChange={handleChange} icon={MapPin} />
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Select label="Staff Type" name="staff_type" value={formData.staff_type} onChange={handleChange} options={staffTypes} />
                                    <Input label="Job Title / Position" name="position" value={formData.position} onChange={handleChange} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Select label="Supervisor" name="supervisor_id" value={formData.supervisor_id} onChange={handleChange}
                                        options={[
                                            { value: '', label: 'No Supervisor' },
                                            ...supervisors.map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name} (${s.position})` }))
                                        ]}
                                    />
                                    <Select label="Employment Status" name="status" value={formData.status} onChange={handleChange} options={[{ value: 'ACTIVE', label: 'Active' }, { value: 'INACTIVE', label: 'Inactive' }, { value: 'ON_LEAVE', label: 'On Leave' }]} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Input type="number" label="Basic Salary (KES)" name="basic_salary" value={formData.basic_salary} onChange={handleChange} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Job Description</label>
                                    <textarea
                                        name="job_description"
                                        value={formData.job_description}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white px-4 py-3 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                        <Shield className="text-red-500" size={20} /> Emergency Contact
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Contact Name" name="emergency_contact_name" value={formData.emergency_contact_name} onChange={handleChange} />
                                        <Input label="Contact Phone" name="emergency_contact_phone" value={formData.emergency_contact_phone} onChange={handleChange} icon={Phone} />
                                    </div>
                                </div>
                                <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                                    <Select label="Religion" name="religion" value={formData.religion} onChange={handleChange} options={[{ value: 'CHRISTIAN', label: 'Christian' }, { value: 'MUSLIM', label: 'Muslim' }, { value: 'OTHER', label: 'Other' }]} />
                                </div>
                            </motion.div>
                        )}

                        <div className="flex justify-between mt-12 pt-8 border-t border-slate-200 dark:border-slate-800">
                            {step > 1 ? (
                                <Button type="button" variant="outline" onClick={prevStep}>
                                    <ChevronLeft size={20} className="mr-2" /> Back
                                </Button>
                            ) : (
                                <div />
                            )}

                            {step < 3 ? (
                                <Button type="button" onClick={nextStep}>
                                    Next Step <ChevronRight size={20} className="ml-2" />
                                </Button>
                            ) : (
                                <Button type="submit" isLoading={saving}>
                                    <Save size={20} className="mr-2" /> Update Profile
                                </Button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const StepHeader = ({ step, currentStep, label, icon: Icon }) => {
    const isActive = currentStep === step;
    const isCompleted = currentStep > step;
    return (
        <div className={`flex-1 flex flex-col items-center py-4 transition-colors relative ${isActive ? 'text-primary-600 dark:text-primary-400' : isCompleted ? 'text-green-600 dark:text-green-500' : 'text-slate-400'}`}>
            <div className="flex items-center gap-2 mb-1">
                <Icon size={18} />
                <span className="text-sm font-bold uppercase tracking-wider">Step {step}</span>
            </div>
            <span className="text-xs font-medium">{label}</span>
            {isActive && <motion.div layoutId="stepUnderline" className="absolute bottom-0 h-1 bg-primary-600 dark:bg-primary-400 w-full" />}
        </div>
    );
};

const Select = ({ label, name, value, onChange, options, required }) => (
    <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">{label}</label>
        <select name={name} value={value} onChange={onChange} required={required} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white px-4 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);

export default StaffEdit;
