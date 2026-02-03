import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useSchool } from '../context/SchoolContext';
import {
    User, Calendar, BookOpen, Users, CreditCard, CheckCircle,
    ChevronRight, ChevronLeft, Upload, AlertCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import axios from 'axios';

const Steps = ({ currentStep }) => {
    const steps = [
        { id: 1, label: 'Personal', icon: User },
        { id: 2, label: 'Academic', icon: BookOpen },
        { id: 3, label: 'Guardian', icon: Users },
        { id: 4, label: 'Payment', icon: CreditCard },
    ];

    return (
        <div className="flex items-center justify-between w-full mb-8">
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${currentStep >= step.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 text-slate-400'
                            }`}>
                            <step.icon size={18} />
                        </div>
                        <span className={`text-xs mt-2 font-medium ${currentStep >= step.id ? 'text-primary-700' : 'text-slate-400'
                            }`}>
                            {step.label}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-1 mx-2 rounded-full -mt-6 transition-colors duration-300 ${currentStep > step.id ? 'bg-primary-500' : 'bg-slate-100'
                            }`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

const StudentCreate = () => {
    const { config } = useSchool();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [grades, setGrades] = useState([]);
    const [branches, setBranches] = useState([]);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        first_name: '', last_name: '',
        date_of_birth: '', gender: 'M', photo: null,
        grade: '', current_term: 1, academic_year: new Date().getFullYear(),
        location: 'MAIN', branch: '',
        parent_name: '', parent_phone: '', parent_email: '',
        payment_method: 'CASH', reference_number: '',
    });

    useEffect(() => {
        // Fetch grades and branches
        const fetchData = async () => {
            try {
                const [gradesRes, branchesRes] = await Promise.all([
                    axios.get('/api/grades/'),
                    axios.get('/api/branches/')
                ]);
                setGrades(gradesRes.data.grades);
                setBranches(branchesRes.data.branches);
            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'photo') {
            setFormData(prev => ({ ...prev, photo: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validateStep = (currentStep) => {
        // Simple validation
        if (currentStep === 1) {
            return formData.first_name && formData.last_name;
        }
        if (currentStep === 2) {
            return formData.grade; // Branch is optional
        }
        if (currentStep === 3) {
            return formData.parent_name && formData.parent_phone;
        }
        if (currentStep === 4) {
            if (formData.payment_method !== 'CASH' && !formData.reference_number) {
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            setStep(prev => prev + 1);
            setError(null);
        } else {
            setError('Please fill in all required fields');
        }
    };

    const handleBack = () => setStep(prev => prev - 1);

    const handleSubmit = async () => {
        if (!validateStep(step)) {
            setError('Please fill in all required fields');
            return;
        }
        setLoading(true);
        setError(null);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                data.append(key, formData[key]);
            }
        });



        try {
            const response = await axios.post('/api/students/create/', data);
            if (response.data.success) {
                // Success animation or redirect
                navigate('/students?success=true');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to create admission');
            if (err.response?.data?.errors) {
                console.error(err.response.data.errors);
                alert(`Validation Error: ${JSON.stringify(err.response.data.errors)}`);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="bg-primary-900 px-8 py-6">
                    <h2 className="text-2xl font-bold text-white">New Student Admission</h2>
                    <p className="text-primary-200 text-sm mt-1">Complete the steps below to register a new student</p>
                </div>

                <div className="p-8">
                    <Steps currentStep={step} />

                    {error && (
                        <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <div className="min-h-[320px]">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required />
                                    <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required />
                                    <Input type="date" label="Date of Birth" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Gender</label>
                                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white px-4 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none">
                                            <option value="M">Male</option>
                                            <option value="F">Female</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Input type="file" label="Photo" name="photo" onChange={handleChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                                    </div>

                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Grade / Class</label>
                                        <select name="grade" value={formData.grade} onChange={handleChange} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white px-4 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none" required>
                                            <option value="">Select Grade</option>
                                            {grades.map(g => (
                                                <option key={g.id} value={g.id}>{g.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Branch (Optional)</label>
                                        <select name="branch" value={formData.branch} onChange={handleChange} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white px-4 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none">
                                            <option value="">Main School (Default)</option>
                                            {branches.map(b => (
                                                <option key={b.id} value={b.id}>{b.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <Input type="number" label="Academic Year" name="academic_year" value={formData.academic_year} onChange={handleChange} />
                                    <Input type="number" label="Current Term" name="current_term" value={formData.current_term} onChange={handleChange} min={1} max={3} />
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <Input label="Parent / Guardian Name" name="parent_name" value={formData.parent_name} onChange={handleChange} required />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="Phone Number" name="parent_phone" value={formData.parent_phone} onChange={handleChange} required />
                                        <Input type="email" label="Email Address" name="parent_email" value={formData.parent_email} onChange={handleChange} />
                                    </div>
                                </motion.div>
                            )}

                            {step === 4 && (
                                <motion.div
                                    key="step4"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-start gap-3">
                                        <CheckCircle className="text-blue-600 shrink-0 mt-1" size={20} />
                                        <div>
                                            <h4 className="font-semibold text-blue-900">Admission Fee Required</h4>
                                            <p className="text-sm text-blue-700 mt-1">
                                                A fee of {config?.currency || 'KES'} {(config?.admission_fee || 0).toLocaleString()} is required to complete admission.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Payment Method</label>
                                            <select name="payment_method" value={formData.payment_method} onChange={handleChange} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white px-4 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none">
                                                <option value="CASH">Cash</option>
                                                <option value="MPESA">M-Pesa</option>
                                                <option value="BANK">Bank Transfer</option>
                                            </select>
                                        </div>
                                        {formData.payment_method !== 'CASH' && (
                                            <Input
                                                label={formData.payment_method === 'MPESA' ? "M-Pesa Transaction Code" : "Bank Reference Number"}
                                                name="reference_number"
                                                value={formData.reference_number}
                                                onChange={handleChange}
                                                placeholder={formData.payment_method === 'MPESA' ? "e.g. QWE123TY" : "e.g. REF-123456"}
                                                required
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex justify-between pt-8 border-t border-slate-100 mt-8">
                        <Button
                            variant="secondary"
                            onClick={step === 1 ? () => navigate('/students') : handleBack}
                        >
                            {step === 1 ? 'Cancel' : 'Back'}
                        </Button>

                        <Button
                            onClick={step === 4 ? handleSubmit : handleNext}
                            isLoading={loading}
                            className="w-32"
                        >
                            {step === 4 ? 'Complete' : 'Next'}
                            {step !== 4 && <ChevronRight size={18} className="ml-2" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default StudentCreate;
