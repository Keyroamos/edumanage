import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, BookOpen, Users,
    ChevronRight, ChevronLeft, AlertCircle, Save
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import axios from 'axios';

const Steps = ({ currentStep }) => {
    const steps = [
        { id: 1, label: 'Personal', icon: User },
        { id: 2, label: 'Academic', icon: BookOpen },
        { id: 3, label: 'Guardian', icon: Users },
    ];

    return (
        <div className="flex items-center justify-between w-full mb-8 max-w-lg mx-auto">
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center relative z-10">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${currentStep >= step.id ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                            }`}>
                            <step.icon size={18} />
                        </div>
                        <span className={`text-xs mt-2 font-medium ${currentStep >= step.id ? 'text-primary-700 dark:text-primary-400' : 'text-slate-400'
                            }`}>
                            {step.label}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`flex-1 h-1 mx-2 rounded-full -mt-6 transition-colors duration-300 ${currentStep > step.id ? 'bg-primary-500' : 'bg-slate-100 dark:bg-slate-800'
                            }`} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

const StudentEdit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [grades, setGrades] = useState([]);
    const [error, setError] = useState(null);

    const [formData, setFormData] = useState({
        first_name: '', last_name: '',
        date_of_birth: '', gender: 'M', photo: null,
        grade: '', current_term: 1, academic_year: new Date().getFullYear(),
        location: 'MAIN',
        parent_name: '', parent_phone: '', parent_email: '',
    });

    // Fetch Student Data and Grades
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [gradeRes, studentRes] = await Promise.all([
                    axios.get('/api/grades/'),
                    axios.get(`/api/students/${id}/`)
                ]);

                setGrades(gradeRes.data.grades || []);
                const student = studentRes.data.student || {};
                const personal = student.personal || {};
                const academic = student.academic || {};
                const guardian = student.guardian || {};

                // Map API response to form data
                setFormData({
                    first_name: (personal.full_name || '').split(' ')[0],
                    last_name: (personal.full_name || '').split(' ').slice(1).join(' '),
                    date_of_birth: personal.dob || '',
                    gender: personal.gender === 'Male' ? 'M' : 'F',
                    photo: null,
                    grade: academic.grade_id || '',
                    current_term: 1,
                    academic_year: new Date().getFullYear(),
                    location: personal.location || 'MAIN',
                    parent_name: guardian.name || '',
                    parent_phone: guardian.phone || '',
                    parent_email: guardian.email || ''
                });

            } catch (err) {
                console.error(err);
                setError('Failed to load student data');
            } finally {
                setInitialLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'photo') {
            setFormData(prev => ({ ...prev, photo: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validateStep = (currentStep) => {
        if (currentStep === 1) return formData.first_name && formData.last_name;
        if (currentStep === 2) return true; // Grade might be pre-filled
        if (currentStep === 3) return formData.parent_name && formData.parent_phone;
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
        setLoading(true);
        setError(null);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                // For photo, only append if it's a File object (new upload)
                if (key === 'photo' && !(formData[key] instanceof File)) return;
                data.append(key, formData[key]);
            }
        });

        try {
            await axios.post(`/api/students/${id}/`, data);
            navigate(`/students/${id}`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-3xl mx-auto">
            <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-800">
                <div className="bg-slate-900 dark:bg-slate-950 px-8 py-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                        <p className="text-slate-400 text-sm mt-1">Update student information</p>
                    </div>
                    <button
                        onClick={() => navigate(`/students/${id}`)}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                </div>

                <div className="p-8">
                    <Steps currentStep={step} />

                    {error && (
                        <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-2 text-sm">
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
                                        <select name="gender" value={formData.gender} onChange={handleChange} className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none text-slate-900 dark:text-white">
                                            <option value="M">Male</option>
                                            <option value="F">Female</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-2">
                                        <Input type="file" label="Update Photo" name="photo" onChange={handleChange} className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 dark:file:bg-primary-900/30 dark:file:text-primary-400" />
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
                                        <select name="grade" value={formData.grade} onChange={handleChange} className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none text-slate-900 dark:text-white" required>
                                            <option value="">Select Grade</option>
                                            {grades.map(g => (
                                                <option key={g.id} value={g.id}>{g.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">School Location</label>
                                        <select name="location" value={formData.location} onChange={handleChange} className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none text-slate-900 dark:text-white">
                                            <option value="MAIN">Main Campus</option>
                                            <option value="ANNEX">Annex Campus</option>
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
                        </AnimatePresence>
                    </div>

                    <div className="flex justify-between pt-8 border-t border-slate-100 dark:border-slate-800 mt-8">
                        <Button
                            variant="secondary"
                            onClick={step === 1 ? () => navigate(`/students/${id}`) : handleBack}
                        >
                            {step === 1 ? 'Cancel' : 'Back'}
                        </Button>

                        <Button
                            onClick={step === 3 ? handleSubmit : handleNext}
                            isLoading={loading}
                            className="w-32"
                        >
                            {step === 3 ? 'Save' : 'Next'}
                            {step !== 3 ? <ChevronRight size={18} className="ml-2" /> : <Save size={18} className="ml-2" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentEdit;
