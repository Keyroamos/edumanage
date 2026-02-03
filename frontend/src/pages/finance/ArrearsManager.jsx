import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
    Search, Filter, Download, Printer, Users,
    ArrowUpDown, ChevronRight, FileText, AlertCircle,
    Calendar, DollarSign, PieChart, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactToPrint } from 'react-to-print';
import Button from '../../components/ui/Button';

const ArrearsManager = () => {
    const [students, setStudents] = useState([]);
    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        grade: 'ALL',
        min_balance: 1,
        search: ''
    });

    const componentRef = useRef();

    useEffect(() => {
        fetchGrades();
        fetchArrears();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchArrears();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.grade, filters.min_balance]);

    const fetchGrades = async () => {
        try {
            const res = await axios.get('/api/grades/');
            setGrades(res.data.grades || []);
        } catch (err) {
            console.error('Error fetching grades:', err);
        }
    };

    const fetchArrears = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/finance/arrears/', {
                params: {
                    grade: filters.grade,
                    min_balance: filters.min_balance
                }
            });
            setStudents(res.data.students || []);
        } catch (err) {
            console.error('Error fetching arrears:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Fee_Arrears_Report_${new Date().toISOString().split('T')[0]}`,
    });

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        s.admission_number.toLowerCase().includes(filters.search.toLowerCase())
    );

    const totalArrears = students.reduce((sum, s) => sum + s.balance, 0);

    return (
        <div className="space-y-6">
            {/* Control Bar */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-900/40 backdrop-blur-md p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search name or admission..."
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all font-bold"
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                        />
                    </div>

                    <select
                        className="bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl py-3 px-6 text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500/20"
                        value={filters.grade}
                        onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
                    >
                        <option value="ALL">All Classes</option>
                        {grades.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>

                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Min Balance:</span>
                        <input
                            type="number"
                            className="bg-transparent border-none p-0 w-20 text-sm font-black focus:ring-0"
                            value={filters.min_balance}
                            onChange={(e) => setFilters(prev => ({ ...prev, min_balance: e.target.value }))}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto">
                    <Button
                        variant="outline"
                        onClick={handlePrint}
                        className="flex-1 lg:flex-initial h-12 rounded-2xl border-slate-200 dark:border-slate-800 font-black uppercase tracking-widest text-[11px] gap-2"
                    >
                        <Printer size={16} /> Print Report
                    </Button>
                </div>
            </div>

            {/* Summary Stat */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-600 rounded-[2rem] p-8 text-white shadow-lg shadow-indigo-500/20">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-2">Total Arrears</p>
                    <h2 className="text-4xl font-black tracking-tighter">KES {totalArrears.toLocaleString()}</h2>
                    <div className="mt-4 flex items-center gap-2 text-[10px] font-bold bg-white/10 w-fit px-3 py-1 rounded-full">
                        <Users size={12} /> {students.length} Students listed
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Selected Class</p>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white">
                        {filters.grade === 'ALL' ? 'Platform Wide' : grades.find(g => g.id.toString() === filters.grade.toString())?.name || 'Loading...'}
                    </h2>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Filters Applied</p>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                {filters.grade === 'ALL' ? 'All Grades' : '1 Grade'}
                            </span>
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-black uppercase tracking-tighter">
                                Min KES {parseInt(filters.min_balance).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                <th className="px-8 py-5">Student Information</th>
                                <th className="px-8 py-5">Term 1</th>
                                <th className="px-8 py-5">Term 2</th>
                                <th className="px-8 py-5">Term 3</th>
                                <th className="px-8 py-5">Yearly Fees</th>
                                <th className="px-8 py-5 text-right">Balance Due</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="inline-block w-8 h-8 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
                                        <p className="mt-4 text-xs font-black uppercase tracking-widest text-slate-400">Fetching Records...</p>
                                    </td>
                                </tr>
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-8 py-20 text-center">
                                        <div className="bg-slate-50 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <AlertCircle className="text-slate-300" size={32} />
                                        </div>
                                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No arrears found matching filters</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredStudents.map((s, idx) => (
                                    <motion.tr
                                        key={s.id}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                                    >
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-slate-500 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    {s.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-slate-900 dark:text-white">{s.name}</p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Adm: {s.admission_number}</span>
                                                        <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                                                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-tighter bg-indigo-500/10 px-1.5 rounded">{s.grade}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-xs font-bold text-slate-600 dark:text-slate-400">
                                            KES {s.term1_fees.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5 text-xs font-bold text-slate-600 dark:text-slate-400">
                                            KES {s.term2_fees.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5 text-xs font-bold text-slate-600 dark:text-slate-400">
                                            KES {s.term3_fees.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5 text-xs font-black text-slate-900 dark:text-white">
                                            KES {s.yearly_fees.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <span className="text-sm font-black text-rose-600 bg-rose-50 dark:bg-rose-500/10 px-4 py-2 rounded-2xl ring-1 ring-rose-600/20">
                                                KES {s.balance.toLocaleString()}
                                            </span>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Hidden Print Content */}
            <div style={{ display: 'none' }}>
                <div ref={componentRef} className="p-12 text-slate-900" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <div className="flex justify-between items-start mb-12 border-b-2 border-slate-900 pb-8">
                        <div>
                            <h1 className="text-3xl font-black uppercase tracking-tight">Fee Arrears Report</h1>
                            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-2">
                                Class: {filters.grade === 'ALL' ? 'All Classes' : filteredStudents[0]?.grade || filters.grade}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs font-black uppercase text-slate-400">Generated On</p>
                            <p className="font-bold">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        </div>
                    </div>

                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-900 text-white text-[10px] uppercase font-black tracking-widest">
                                <th className="p-4 border border-slate-900 text-left">Student</th>
                                <th className="p-4 border border-slate-900 text-left">Adm No</th>
                                <th className="p-4 border border-slate-900 text-left">Class</th>
                                <th className="p-4 border border-slate-900 text-right">Term 1</th>
                                <th className="p-4 border border-slate-900 text-right">Term 2</th>
                                <th className="p-4 border border-slate-900 text-right">Term 3</th>
                                <th className="p-4 border border-slate-900 text-right">Yearly</th>
                                <th className="p-4 border border-slate-900 text-right">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map(s => (
                                <tr key={s.id} className="text-[11px] font-medium border-b border-slate-200">
                                    <td className="p-4 font-bold border-x border-slate-100">{s.name}</td>
                                    <td className="p-4 border-r border-slate-100">{s.admission_number}</td>
                                    <td className="p-4 border-r border-slate-100">{s.grade}</td>
                                    <td className="p-4 text-right border-r border-slate-100">{s.term1_fees.toLocaleString()}</td>
                                    <td className="p-4 text-right border-r border-slate-100">{s.term2_fees.toLocaleString()}</td>
                                    <td className="p-4 text-right border-r border-slate-100">{s.term3_fees.toLocaleString()}</td>
                                    <td className="p-4 text-right font-bold border-r border-slate-100">{s.yearly_fees.toLocaleString()}</td>
                                    <td className="p-4 text-right font-black text-rose-600 border-x border-slate-100 bg-rose-50/30">{s.balance.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-slate-50 font-black">
                                <td colSpan="7" className="p-4 text-right uppercase tracking-widest text-xs">Total Outstanding Arrears</td>
                                <td className="p-4 text-right text-lg text-rose-600 bg-rose-50 border-2 border-rose-600 uppercase">KES {totalArrears.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div className="mt-20 flex justify-between">
                        <div className="text-center w-64 pt-4 border-t border-slate-300">
                            <p className="text-[10px] font-black uppercase text-slate-400">Finance Manager Signature</p>
                        </div>
                        <div className="text-center w-64 pt-4 border-t border-slate-300">
                            <p className="text-[10px] font-black uppercase text-slate-400">School Principal Signature</p>
                        </div>
                    </div>

                    <div className="mt-12 text-center text-[8px] text-slate-300 font-bold uppercase tracking-[0.5em]">
                        Internal Use Only - Confidential Data
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArrearsManager;
