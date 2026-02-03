import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search, CreditCard, Banknote, Smartphone,
    FileText, ArrowLeft, CheckCircle, AlertCircle, User
} from 'lucide-react';
import axios from 'axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const PaymentRecord = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

    // Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        amount: '',
        payment_method: 'CASH',
        reference_number: '',
        description: 'Tuition Fee Payment',
        term: 1
    });

    // Debounced Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                performSearch();
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const performSearch = async () => {
        setSearching(true);
        try {
            const res = await axios.get(`/api/students/?search=${searchQuery}`);
            if (res.data.students) {
                setSearchResults(res.data.students);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectStudent = (student) => {
        setSelectedStudent(student);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedStudent) {
            setError('Please select a student first');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const payload = {
                student_id: selectedStudent.id,
                ...formData
            };

            const res = await axios.post('/api/finance/payment/', payload);
            if (res.data.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/finance');
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    const methods = [
        { id: 'CASH', label: 'Cash', icon: Banknote, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-100' },
        { id: 'MPESA', label: 'M-Pesa', icon: Smartphone, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
        { id: 'BANK', label: 'Bank Transfer', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
    ];

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-slate-100 dark:border-slate-800"
                >
                    <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Payment Recorded!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">The payment has been successfully recorded to the student's account.</p>
                    <Button onClick={() => navigate('/finance')} className="w-full">Back to Finance</Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-6 space-y-6">
            <div className="flex items-center gap-4 mb-2">
                <button
                    onClick={() => navigate('/finance')}
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                    <ArrowLeft size={24} className="text-slate-600 dark:text-slate-400" />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Record Payment</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Add a new payment transaction</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                <div className="p-8 space-y-8">
                    {/* Student Selection */}
                    <div className="space-y-4">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Select Student</label>
                        {!selectedStudent ? (
                            <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Search size={20} />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name or admission number..."
                                    className="w-full h-12 pl-12 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchResults.length > 0 && (
                                    <div className="absolute top-14 left-0 right-0 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 z-10 max-h-60 overflow-y-auto">
                                        {searchResults.map(student => (
                                            <button
                                                key={student.id}
                                                onClick={() => handleSelectStudent(student)}
                                                className="w-full p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left border-b border-slate-50 dark:border-slate-700 last:border-0"
                                            >
                                                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold text-sm">
                                                    {student.full_name?.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900 dark:text-white">{student.full_name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">ADM: {student.admission_number} • {student.grade}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-800">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-800 text-primary-600 dark:text-primary-400 flex items-center justify-center font-bold shadow-sm">
                                        {selectedStudent.full_name?.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-primary-900 dark:text-primary-100">{selectedStudent.full_name}</p>
                                        <p className="text-sm text-primary-700 dark:text-primary-300">ADM: {selectedStudent.admission_number}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                                >
                                    Change
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Payment Details Form */}
                    <div className={`space-y-6 transition-opacity duration-300 ${selectedStudent ? 'opacity-100' : 'opacity-50 pointer-events-none filter blur-[1px]'}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Amount (KES)"
                                name="amount"
                                type="number"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                required
                            />
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Term</label>
                                <select
                                    name="term"
                                    value={formData.term}
                                    onChange={handleChange}
                                    className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white px-4 focus:ring-2 focus:ring-primary-100 focus:border-primary-500 transition-all outline-none"
                                >
                                    <option value={1}>Term 1</option>
                                    <option value={2}>Term 2</option>
                                    <option value={3}>Term 3</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Payment Method</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {methods.map(method => (
                                    <button
                                        key={method.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, payment_method: method.id })}
                                        className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.payment_method === method.id
                                            ? `${method.bg} dark:bg-opacity-10 ${method.border} dark:border-opacity-30 ring-2 ring-primary-500 ring-offset-2 dark:ring-offset-slate-900`
                                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary-200 dark:hover:border-primary-700'
                                            }`}
                                    >
                                        <method.icon className={formData.payment_method === method.id ? method.color : 'text-slate-400 dark:text-slate-500'} size={24} />
                                        <span className={`text-sm font-medium ${formData.payment_method === method.id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                                            {method.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Reference Number"
                                name="reference_number"
                                value={formData.reference_number}
                                onChange={handleChange}
                                placeholder={formData.payment_method === 'CASH' ? 'Optional for Cash' : 'Required'}
                                required={formData.payment_method !== 'CASH'}
                            />
                            <Input
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="e.g. Tuition Fee"
                            />
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        <div className="pt-4">
                            <Button
                                onClick={handleSubmit}
                                isLoading={loading}
                                className="w-full h-12 text-lg"
                                disabled={!selectedStudent}
                            >
                                Record Payment
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentRecord;
