import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Filter, User, ChevronRight, ArrowUpDown, CreditCard, School } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const FinanceStudentList = () => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();

    // Advanced Filtering States
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [gradeFilter, setGradeFilter] = useState('ALL');
    const [sortBy, setSortBy] = useState('NAME_ASC');

    const [grades, setGrades] = useState([]);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/finance/students/');
            const data = res.data.students || [];
            setStudents(data);

            const uniqueGrades = [...new Set(data.map(s => s.grade))].sort();
            setGrades(uniqueGrades);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = (students || []).filter(s => {
        const matchesSearch = (s.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.admission_number || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGrade = gradeFilter === 'ALL' || s.grade === gradeFilter;
        let matchesStatus = true;
        if (statusFilter === 'DEBTOR') matchesStatus = s.balance > 0;
        else if (statusFilter === 'CREDIT') matchesStatus = s.balance < 0;
        else if (statusFilter === 'SETTLED') matchesStatus = s.balance === 0;

        return matchesSearch && matchesGrade && matchesStatus;
    });

    const sortedStudents = [...filteredStudents].sort((a, b) => {
        if (sortBy === 'NAME_ASC') return a.full_name.localeCompare(b.full_name);
        if (sortBy === 'NAME_DESC') return b.full_name.localeCompare(a.full_name);
        if (sortBy === 'BALANCE_HIGH') return b.balance - a.balance;
        if (sortBy === 'BALANCE_LOW') return a.balance - b.balance;
        return 0;
    });



    return (
        <div className="space-y-8 min-h-screen">
            <div className="fixed top-0 left-0 right-0 h-[600px] bg-gradient-to-br from-indigo-500/5 to-transparent dark:from-indigo-900/10 pointer-events-none -z-10" />

            {/* Premium Header/Search Section */}
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter flex items-center gap-4">
                        Student Accounts
                    </h1>
                    <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] opacity-80">
                        Institutional Billing & Payment Matrix
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    {/* Modern Search */}
                    <div className="relative w-full sm:w-96 group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none group-focus-within:text-indigo-500 transition-colors">
                            <Search size={18} className="text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or admission number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-slate-100 dark:border-slate-800 rounded-[2rem] shadow-xl shadow-slate-200/20 dark:shadow-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-sm transition-all"
                        />
                    </div>

                    {/* Integrated Quick Filters Toolbar */}
                    <div className="flex items-center gap-2 p-1.5 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md rounded-[1.8rem] border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 sm:flex-none">
                            <School size={14} className="text-slate-400" />
                            <select
                                value={gradeFilter}
                                onChange={e => setGradeFilter(e.target.value)}
                                className="bg-transparent border-none text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 cursor-pointer outline-none p-0 min-w-[80px]"
                            >
                                <option value="ALL">All Grades</option>
                                {grades.map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex-1 sm:flex-none">
                            <Filter size={14} className="text-slate-400" />
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="bg-transparent border-none text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 cursor-pointer outline-none p-0"
                            >
                                <option value="ALL">All Status</option>
                                <option value="DEBTOR">Debtor</option>
                                <option value="CREDIT">Is Credit</option>
                                <option value="SETTLED">Settled</option>
                            </select>
                        </div>

                        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 opacity-60">
                            <ArrowUpDown size={14} className="text-slate-400" />
                            <select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="bg-transparent border-none text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 cursor-pointer outline-none p-0"
                            >
                                <option value="NAME_ASC">Name (A-Z)</option>
                                <option value="NAME_DESC">Name (Z-A)</option>
                                <option value="BALANCE_HIGH">Max Debt</option>
                                <option value="BALANCE_LOW">Min Debt</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>


            {/* Grid of Student Tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode='popLayout'>
                    {sortedStudents.map((student, index) => {
                        const totalBilled = student.total_billed || 0;
                        const totalPaid = student.total_paid || 0;
                        const percent = totalBilled > 0 ? Math.min(100, (totalPaid / totalBilled) * 100) : (totalPaid > 0 ? 100 : 0);
                        const isOwing = student.balance > 0;
                        const isCredit = student.balance < 0;

                        return (
                            <motion.div
                                key={student.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2, delay: index * 0.02 }}
                                onClick={() => navigate(`/finance-portal/accounts/${student.id}`)}
                                className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all cursor-pointer overflow-hidden flex flex-col h-full"
                            >
                                {/* Background Accent */}
                                <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${isOwing ? 'bg-rose-500' : isCredit ? 'bg-emerald-500' : 'bg-indigo-500'}`} />

                                {/* Card Header: Avatar & Info */}
                                <div className="flex items-start gap-4 mb-6 relative">
                                    <div className="relative">
                                        <div className="h-16 w-16 rounded-3xl bg-slate-100 dark:bg-slate-800 p-0.5 overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-500">
                                            {student.avatar ? (
                                                <img src={student.avatar} alt="" className="h-full w-full object-cover rounded-[1.4rem]" />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-slate-400">
                                                    <User size={32} />
                                                </div>
                                            )}
                                        </div>
                                        {/* Status Dot */}
                                        <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-4 border-white dark:border-slate-900 ${isOwing ? 'bg-rose-500' : isCredit ? 'bg-emerald-500' : 'bg-indigo-500'}`} />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-slate-900 dark:text-white leading-tight truncate group-hover:text-indigo-600 transition-colors">
                                            {student.full_name}
                                        </h4>
                                        <p className="text-[10px] font-black font-mono text-slate-400 mt-1 uppercase tracking-tighter">
                                            {student.admission_number}
                                        </p>
                                        <div className="mt-2 text-[10px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg inline-block uppercase tracking-wider">
                                            {student.grade}
                                        </div>
                                    </div>
                                </div>

                                {/* Balance Section */}
                                <div className="mt-auto pt-6 border-t border-slate-50 dark:border-slate-800/50">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-2">Current Balance</p>
                                            <h3 className={`text-xl font-black tracking-tight ${isOwing ? 'text-rose-600 dark:text-rose-400' : isCredit ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                                KES {student.balance.toLocaleString()}
                                            </h3>
                                        </div>
                                        <div className={`px-3 py-1.5 rounded-2xl text-[10px] font-black uppercase tracking-wider ${isOwing ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400' :
                                            isCredit ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                                'bg-slate-50 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                            }`}>
                                            {isOwing ? 'Owing' : isCredit ? 'Credit' : 'Settled'}
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[10px] font-black">
                                            <span className="text-slate-500">PAID {Math.round(percent)}%</span>
                                            <span className="text-slate-400">OF {totalBilled.toLocaleString()}</span>
                                        </div>
                                        <div className="relative h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percent}%` }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                                className={`absolute h-full rounded-full ${percent >= 100 ? 'bg-emerald-500' : 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]'}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Action Overlay */}
                                <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-[0.02] transition-opacity pointer-events-none" />
                                <div className="absolute bottom-4 right-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-indigo-500/30">
                                        <ChevronRight size={20} />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {sortedStudents.length === 0 && (
                <div className="text-center py-20 bg-slate-50/50 dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-800">
                    <User size={48} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">No students found</h3>
                    <p className="text-slate-500 font-medium">Try adjusting your filters or search term</p>
                </div>
            )}

        </div>
    );
};

export default FinanceStudentList;
