import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Briefcase, FileText, CheckCircle, ChevronRight, AlertCircle, Upload, ChevronLeft
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import axios from 'axios';

const Steps = ({ currentStep }) => {
    const steps = [
        { id: 1, label: 'Personal Details', icon: User },
        { id: 2, label: 'Professional Details', icon: Briefcase },
        { id: 3, label: 'Employment & Payroll', icon: FileText },
    ];

    return (
        <div className="flex items-center justify-between w-full mb-8 px-4">
            {steps.map((step, index) => (
                <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center relative z-10 w-24">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${currentStep >= step.id
                            ? 'bg-secondary-600 border-secondary-600 text-white shadow-lg shadow-secondary-500/30'
                            : 'bg-white border-slate-200 text-slate-400'
                            }`}>
                            <step.icon size={18} />
                        </div>
                        <span className={`text-xs mt-2 font-medium text-center ${currentStep >= step.id ? 'text-secondary-700' : 'text-slate-400'
                            }`}>
                            {step.label}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div className="flex-1 h-[2px] mx-2 -mt-6 bg-slate-100 relative">
                            <div
                                className="absolute top-0 left-0 h-full bg-secondary-500 transition-all duration-500 ease-out"
                                style={{ width: currentStep > step.id ? '100%' : '0%' }}
                            />
                        </div>
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

const TeacherCreate = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [grades, setGrades] = useState([]);
    const [branches, setBranches] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [error, setError] = useState(null);

    // Initial State
    const [formData, setFormData] = useState({
        // Step 1: Personal
        first_name: '', last_name: '', email: '', phone: '',
        national_id: '', date_of_birth: '', gender: 'M',
        marital_status: 'SINGLE', religion: 'CHRISTIAN', nationality: 'Kenyan',
        address: '',
        // Step 2: Professional
        tsc_number: '', position: 'TEACHER', department: '',
        qualifications: 'DEG', years_of_experience: 0,
        subjects: [], is_class_teacher: false, grade: '',

        // Step 3: Employment
        basic_salary: '', branch: '',
        profile_picture: null, certificate: null
    });

    useEffect(() => {
        // Fetch grades, subjects, branches, departments
        const fetchData = async () => {
            try {
                const [gradesRes, subjectsRes, branchesRes, deptsRes] = await Promise.all([
                    axios.get('/api/grades/'),
                    axios.get('/api/subjects/'),
                    axios.get('/api/branches/'),
                    axios.get('/api/departments/')
                ]);
                // Filter grades to unique names to avoid duplicates in the dropdown
                const uniqueGrades = Array.from(new Map(gradesRes.data.grades.map(g => [g.name, g])).values());
                setGrades(uniqueGrades);
                setSubjects(subjectsRes.data.subjects);
                setBranches(branchesRes.data.branches);
                setDepartments(deptsRes.data.departments);
            } catch (err) {
                console.error("Error fetching form options:", err);
                // Fallback for departments if endpoint fails or returns 404
                if (!departments.length) {
                    setDepartments([{ id: 1, name: 'Languages' }, { id: 2, name: 'Sciences' }, { id: 3, name: 'Humanities' }]);
                }
            }
        };
        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked, files, options } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (name === 'subjects') {
            const selected = Array.from(options).filter(o => o.selected).map(o => o.value);
            setFormData(prev => ({ ...prev, [name]: selected }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const validateStep = (currentStep) => {
        const required = {
            1: ['first_name', 'last_name', 'email', 'national_id', 'phone', 'date_of_birth', 'nationality'],
            2: ['position', 'qualifications'],
            3: ['basic_salary']
        };

        const fields = required[currentStep];
        for (const field of fields) {
            if (!formData[field]) return false;
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(step)) {

            setStep(prev => prev + 1);
            setError(null);
        } else {
            setError('Please fill in all required fields marked with *');
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) {
            setError('Please fill in required employment details');
            return;
        }

        setLoading(true);
        setError(null);

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null) {
                if (key === 'subjects' && Array.isArray(formData[key])) {
                    formData[key].forEach(sub => data.append('subjects', sub));
                } else {
                    data.append(key, formData[key]);
                }
            }
        });

        try {
            const response = await axios.post('/api/teachers/create/', data);
            if (response.data.success) {
                navigate('/teachers?success=true');
            }
        } catch (err) {
            console.error("Submission error:", err.response?.data);
            const backendError = err.response?.data;

            if (backendError?.errors) {
                // Flatten the errors object (which might contain arrays)
                const errorFields = Object.keys(backendError.errors);
                const firstField = errorFields[0];
                const firstError = backendError.errors[firstField];

                setError(`${firstField.replace('_', ' ').toUpperCase()}: ${Array.isArray(firstError) ? firstError[0] : firstError}`);
            } else {
                setError(backendError?.error || 'Failed to create teacher. Please check all fields.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div onClick={() => navigate('/teachers')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 cursor-pointer transition-colors">
                    <ChevronLeft size={20} />
                    <span>Back to Teachers</span>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
                <div className="bg-gradient-to-r from-secondary-900 to-secondary-800 px-8 py-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                    <h2 className="text-3xl font-bold relative z-10">New Teacher Registration</h2>
                    <p className="text-secondary-100 text-sm mt-2 relative z-10 max-w-lg">Complete the form below to register a new teaching staff member. Credentials will be generated automatically.</p>
                </div>

                <div className="p-8">
                    <Steps currentStep={step} />

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm border border-red-100"
                        >
                            <AlertCircle size={20} className="shrink-0" />
                            {error}
                        </motion.div>
                    )}

                    <div className="min-h-[400px]">
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.div
                                    key="step1"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                                >
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} required placeholder="e.g. John" />
                                            <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} required placeholder="e.g. Doe" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input type="email" label="Email Address" name="email" value={formData.email} onChange={handleChange} required placeholder="john.doe@school.com" />
                                            <Input label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="+254..." />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input label="National ID" name="national_id" value={formData.national_id} onChange={handleChange} required />
                                            <Input type="date" label="Date of Birth" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} required />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Gender</label>
                                                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white px-4 focus:ring-2 focus:ring-secondary-100 focus:border-secondary-500 transition-all outline-none">
                                                    <option value="M">Male</option>
                                                    <option value="F">Female</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Marital Status</label>
                                                <select name="marital_status" value={formData.marital_status} onChange={handleChange} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white px-4 focus:ring-2 focus:ring-secondary-100 focus:border-secondary-500 transition-all outline-none">
                                                    <option value="SINGLE">Single</option>
                                                    <option value="MARRIED">Married</option>
                                                    <option value="DIVORCED">Divorced</option>
                                                    <option value="WIDOWED">Widowed</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Religion</label>
                                                <select name="religion" value={formData.religion} onChange={handleChange} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white px-4 focus:ring-2 focus:ring-secondary-100 focus:border-secondary-500 transition-all outline-none">
                                                    <option value="CHRISTIAN">Christian</option>
                                                    <option value="MUSLIM">Muslim</option>
                                                    <option value="HINDU">Hindu</option>
                                                    <option value="OTHER">Other</option>
                                                </select>
                                            </div>
                                            <Input label="Nationality" name="nationality" value={formData.nationality} onChange={handleChange} />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Home Address</label>
                                            <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className="w-full rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white px-4 py-3 focus:ring-2 focus:ring-secondary-100 focus:border-secondary-500 transition-all outline-none resize-none"></textarea>
                                        </div>


                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                            <div className="flex flex-col items-center text-center">
                                                {formData.profile_picture ? (
                                                    <div className="w-32 h-32 rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100 overflow-hidden relative group">
                                                        <img src={URL.createObjectURL(formData.profile_picture)} alt="Preview" className="w-full h-full object-cover" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                            <Upload className="text-white" size={24} />
                                                        </div>
                                                        <input type="file" name="profile_picture" onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                                    </div>
                                                ) : (
                                                    <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-slate-100 overflow-hidden relative group">
                                                        <User size={48} className="text-slate-300" />
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                                            <Upload className="text-white" size={24} />
                                                        </div>
                                                        <input type="file" name="profile_picture" onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                                    </div>
                                                )}
                                                <Button variant="outline" size="sm" className="relative">
                                                    <span className="flex items-center gap-2">
                                                        <Upload size={14} /> Upload Photo
                                                    </span>
                                                    <input type="file" name="profile_picture" onChange={handleChange} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                                </Button>
                                                <p className="text-xs text-slate-400 mt-3">Allowed *.jpeg, *.jpg, *.png, *.gif <br /> Max size of 3 MB</p>
                                            </div>
                                        </div>

                                        <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-2xl">
                                            <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-2 mb-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div> Registration Guide
                                            </h4>
                                            <p className="text-sm text-blue-700 dark:text-blue-400 leading-relaxed">
                                                Fill out all sections to register a new teacher. Mandatory fields include name, email, and position.
                                                <br /><br />
                                                The teacher uses their <b>email address</b> as username and the default portal password set in Settings.
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    key="step2"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input label="TSC Number (Optional)" name="tsc_number" value={formData.tsc_number} onChange={handleChange} />
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Position / Role</label>
                                            <select name="position" value={formData.position} onChange={handleChange} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white px-4 focus:ring-2 focus:ring-secondary-100 focus:border-secondary-500 transition-all outline-none">
                                                <option value="TEACHER">Teacher</option>
                                                <option value="HOD">Head of Department</option>
                                                <option value="DEPUTY">Deputy Principal</option>
                                                <option value="PRINCIPAL">Principal</option>
                                                <option value="ADMIN">Administrator</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Department</label>
                                            <select name="department" value={formData.department} onChange={handleChange} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white px-4 focus:ring-2 focus:ring-secondary-100 focus:border-secondary-500 transition-all outline-none">
                                                <option value="">Select Department</option>
                                                {departments.map(d => (
                                                    <option key={d.id} value={d.id}>{d.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Qualification</label>
                                            <select name="qualifications" value={formData.qualifications} onChange={handleChange} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white px-4 focus:ring-2 focus:ring-secondary-100 focus:border-secondary-500 transition-all outline-none">
                                                <option value="CERT">Certificate</option>
                                                <option value="DIP">Diploma</option>
                                                <option value="DEG">Degree</option>
                                                <option value="MAST">Masters</option>
                                                <option value="PHD">PhD</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="max-w-md">
                                        <Input type="number" label="Years of Experience" name="years_of_experience" value={formData.years_of_experience} onChange={handleChange} />
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Subjects (Hold Ctrl/Cmd to select multiple)</label>
                                        <select
                                            name="subjects"
                                            multiple
                                            value={formData.subjects}
                                            onChange={handleChange}
                                            className="w-full h-40 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:text-white dark:border-slate-700 px-4 py-3 focus:ring-2 focus:ring-secondary-100 focus:border-secondary-500 transition-all outline-none scrollbar-thin"
                                        >
                                            {subjects.map(s => (
                                                <option key={s.id} value={s.id} className="py-1">{s.name} ({s.code})</option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-slate-400">Select all subjects this teacher is qualified to teach.</p>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" name="is_class_teacher" checked={formData.is_class_teacher} onChange={handleChange} className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 dark:peer-focus:ring-blue-900/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary-600"></div>
                                                </label>
                                                <span className="font-medium text-slate-700 dark:text-slate-300">Designate as Class Teacher</span>
                                            </div>
                                        </div>

                                        {formData.is_class_teacher && (
                                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Enable this to assign this teacher to a specific grade and section</p>
                                                <select name="grade" value={formData.grade} onChange={handleChange} className="w-full md:w-1/2 h-11 rounded-xl border border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700 dark:text-white px-4 focus:ring-2 focus:ring-secondary-100 outline-none">
                                                    <option value="">Select Grade</option>
                                                    {grades.map(g => (
                                                        <option key={g.id} value={g.id}>{g.name}</option>
                                                    ))}
                                                </select>
                                            </motion.div>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    key="step3"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-8"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Input type="number" label="Basic Salary (KES) *" name="basic_salary" value={formData.basic_salary} onChange={handleChange} required />
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">School Branch (Optional)</label>
                                            <select name="branch" value={formData.branch} onChange={handleChange} className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white px-4 focus:ring-2 focus:ring-secondary-100 focus:border-secondary-500 transition-all outline-none">
                                                <option value="">Select Branch (Default: Main School)</option>
                                                {branches.map(b => (
                                                    <option key={b.id} value={b.id}>{b.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-base font-medium text-slate-800 dark:text-slate-200">Certificate Upload</label>
                                        <div
                                            className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-colors bg-slate-50 dark:bg-slate-900/50 relative group"
                                            onDragOver={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.classList.add('border-secondary-500', 'bg-secondary-50/50');
                                            }}
                                            onDragLeave={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.classList.remove('border-secondary-500', 'bg-secondary-50/50');
                                            }}
                                            onDrop={(e) => {
                                                e.preventDefault();
                                                e.currentTarget.classList.remove('border-secondary-500', 'bg-secondary-50/50');
                                                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                                    setFormData(prev => ({ ...prev, certificate: e.dataTransfer.files[0] }));
                                                }
                                            }}
                                        >
                                            <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                                <FileText size={32} />
                                            </div>
                                            <p className="text-sm text-slate-600 dark:text-slate-300 mb-1 font-medium">
                                                {formData.certificate ? formData.certificate.name : 'Choose file or drag & drop'}
                                            </p>
                                            <p className="text-xs text-slate-400">PDF or Image of highest qualification</p>
                                            <input
                                                type="file"
                                                name="certificate"
                                                onChange={handleChange}
                                                className="hidden"
                                                id="cert-upload"
                                                accept=".pdf,image/*"
                                            />
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="mt-4 relative z-10"
                                                onClick={() => document.getElementById('cert-upload').click()}
                                            >
                                                {formData.certificate ? 'Change File' : 'Browse Files'}
                                            </Button>
                                        </div>
                                    </div>

                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex justify-between pt-8 border-t border-slate-100 mt-8">
                        <Button
                            variant="secondary"
                            onClick={step === 1 ? () => navigate('/teachers') : () => setStep(p => p - 1)}
                            className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-none"
                        >
                            {step === 1 ? 'Cancel' : 'Back'}
                        </Button>

                        <Button
                            onClick={step === 3 ? handleSubmit : handleNext}
                            isLoading={loading}
                            className="w-36 bg-secondary-600 hover:bg-secondary-700 text-white shadow-lg shadow-secondary-500/30"
                        >
                            {step === 3 ? 'Complete Registration' : 'Next Step'}
                            {step !== 3 && <ChevronRight size={18} className="ml-2" />}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherCreate;
