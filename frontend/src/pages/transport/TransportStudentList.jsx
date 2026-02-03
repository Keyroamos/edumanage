import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Users, Eye, DollarSign, AlertCircle, CheckCircle, User } from 'lucide-react';
import Button from '../../components/ui/Button';

const TransportStudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const res = await axios.get('/api/transport/students/');
            setStudents(res.data.students || []);
        } catch (error) {
            console.error(error);
            setStudents([]);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = (students || []).filter(s =>
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.admission_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.grade?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getBalanceColor = (balance) => {
        if (balance < 0) return 'text-emerald-600 dark:text-emerald-400'; // Credit
        if (balance > 0) return 'text-red-600 dark:text-red-400'; // Owing
        return 'text-slate-600 dark:text-slate-400'; // Zero
    };

    const getBalanceStatus = (balance) => {
        if (balance < 0) return { text: 'Credit', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };
        if (balance > 0) return { text: 'Owing', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
        return { text: 'Clear', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' };
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Transport Students</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage student transport accounts</p>
                </div>
            </div>

            {/* Search Bar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, admission number, or grade..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                    />
                </div>
            </div>

            {/* Students Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStudents.map(student => {
                    const status = getBalanceStatus(student.balance);
                    return (
                        <div
                            key={student.id}
                            className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start gap-4 mb-4">
                                {student.photo ? (
                                    <img
                                        src={student.photo}
                                        alt={student.name}
                                        className="w-16 h-16 rounded-full object-cover border-2 border-blue-100 dark:border-blue-900"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <User size={32} />
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-900 dark:text-white truncate">{student.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{student.admission_number}</p>
                                    <p className="text-xs text-slate-400 dark:text-slate-500">{student.grade}</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Balance</span>
                                    <span className={`text-lg font-black font-mono ${getBalanceColor(student.balance)}`}>
                                        KES {Math.abs(student.balance).toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                                        {status.text}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${student.status === 'ACTIVE'
                                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                                        }`}>
                                        {student.status}
                                    </span>
                                </div>

                                <Button
                                    onClick={() => navigate(`/transport-portal/students/${student.id}`)}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
                                >
                                    <Eye size={16} />
                                    View Details
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredStudents.length === 0 && (
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-700">
                    <Users size={48} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                    <p className="text-slate-500 dark:text-slate-400 font-medium">No students found</p>
                </div>
            )}
        </div>
    );
};

export default TransportStudentList;
