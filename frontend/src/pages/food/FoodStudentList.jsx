import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, User, ChevronRight, CheckCircle, XCircle, PlusCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

const FoodStudentList = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, ACTIVE, INACTIVE

    useEffect(() => {
        fetchStudents();
    }, []);

    useEffect(() => {
        filterData();
    }, [search, statusFilter, students]);

    const fetchStudents = async () => {
        try {
            const res = await axios.get('/api/food/students/');
            setStudents(res.data.students || []);
            setFilteredStudents(res.data.students || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filterData = () => {
        let temp = [...(students || [])];

        if (search) {
            const q = search.toLowerCase();
            temp = temp.filter(s =>
                (s.name || '').toLowerCase().includes(q) ||
                (s.admission_number || '').toLowerCase().includes(q)
            );
        }

        if (statusFilter !== 'ALL') {
            temp = temp.filter(s => s.status === statusFilter);
        }

        setFilteredStudents(temp);
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Accounts</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage food subscriptions and balances</p>
                </div>
            </div>

            {/* Toolbar */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search student..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Filter size={16} className="text-slate-500" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 flex-1 md:flex-none"
                    >
                        <option value="ALL">All Status</option>
                        <option value="ACTIVE">Active Subscription</option>
                        <option value="INACTIVE">No Account/Inactive</option>
                    </select>
                </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {(filteredStudents || []).map((student) => (
                    <div
                        key={student.id}
                        onClick={() => navigate(`/food-portal/students/${student.id}`)}
                        className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg hover:border-orange-200 dark:hover:border-orange-800 transition-all cursor-pointer group"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className="relative">
                                {student.photo ? (
                                    <img src={student.photo} alt={student.name} className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-md" />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                        <User size={32} />
                                    </div>
                                )}
                                <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${student.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-slate-300'
                                    }`}></div>
                            </div>
                            <div className={`px-2 py-1 rounded-lg text-xs font-bold ${student.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                                }`}>
                                {student.status}
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="font-bold text-slate-900 dark:text-white truncate">{student.name}</h3>
                            <p className="text-sm text-slate-500">{student.admission_number}</p>
                            <p className="text-xs text-slate-400 mt-1">{student.grade}</p>
                        </div>

                        {student.has_account ? (
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex justify-between items-center group-hover:bg-orange-50 dark:group-hover:bg-orange-900/10 transition-colors">
                                <span className="text-xs uppercase font-bold text-slate-400">Balance</span>
                                <span className={`font-mono font-bold ${student.balance > 0 ? 'text-red-600' : 'text-emerald-600'
                                    }`}>
                                    {(student.balance || 0).toLocaleString()}
                                </span>
                            </div>
                        ) : (
                            <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl flex justify-center items-center text-slate-400 text-sm group-hover:bg-orange-50 dark:group-hover:bg-orange-900/10 transition-colors">
                                <PlusCircle size={16} className="mr-2" /> Enable Account
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {(filteredStudents || []).length === 0 && (
                <div className="text-center py-20 text-slate-400">
                    <p>No students found matching your search.</p>
                </div>
            )}
        </div>
    );
};

export default FoodStudentList;
