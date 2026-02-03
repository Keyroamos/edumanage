import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Ensure axios is imported
import {
    Utensils, Printer, Search, CheckCircle, User,
    Calendar, Filter, AlertCircle
} from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import Button from '../../components/ui/Button';

const FoodServingList = () => {
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState('');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [checkedState, setCheckedState] = useState({});

    // Ref for printing
    const printRef = useRef();
    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `Serving_List_${new Date().toISOString().split('T')[0]}`
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (selectedItem) {
            fetchList(selectedItem);
        } else {
            setStudents([]);
        }
    }, [selectedItem]);

    const fetchInitialData = async () => {
        try {
            const res = await axios.get('/api/food/serving-list/');
            setItems(res.data.items);
            if (res.data.items.length > 0) {
                setSelectedItem(res.data.items[0].id);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchList = async (itemId) => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/food/serving-list/?item_id=${itemId}`);
            setStudents(res.data.students);

            // Initialize checked state for students already served today
            const initialChecked = {};
            res.data.students.forEach(student => {
                if (student.served_today) {
                    initialChecked[student.id] = true;
                }
            });
            setCheckedState(initialChecked);
        } catch (error) {
            console.error("Failed to fetch serving list", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheck = async (studentId) => {
        // Optimistic UI update
        const wasChecked = checkedState[studentId];
        setCheckedState(prev => ({
            ...prev,
            [studentId]: !prev[studentId]
        }));

        // Only charge if marking as served (checking), not unchecking
        if (!wasChecked && selectedItem) {
            try {
                const res = await axios.post('/api/food/mark-served/', {
                    student_id: studentId,
                    item_id: selectedItem
                });

                if (res.data.success) {
                    // Show success feedback (optional)
                    console.log(`Charged KES ${res.data.charged}. New balance: KES ${res.data.new_balance}`);
                }
            } catch (error) {
                console.error("Failed to charge student", error);
                // Revert optimistic update on error
                setCheckedState(prev => ({
                    ...prev,
                    [studentId]: false
                }));
                alert('Failed to mark student as served. Please try again.');
            }
        }
    };

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.adm.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getSelectedItemName = () => {
        const item = items.find(i => i.id == selectedItem);
        return item ? item.name : 'Selected Meal';
    };

    if (loading && items.length === 0) return (
        <div className="h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-6 flex flex-col h-[calc(100vh-120px)] animate-fade-in-up">

            {/* Header Area - No Print */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Utensils className="text-orange-600" />
                        Kitchen Serving List
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">Select a meal to generate the serving checklist</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <select
                        value={selectedItem}
                        onChange={(e) => setSelectedItem(e.target.value)}
                        className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 dark:text-white min-w-[200px]"
                    >
                        <option value="">-- Select Meal --</option>
                        {items.map(item => (
                            <option key={item.id} value={item.id}>{item.name} ({item.billing_cycle})</option>
                        ))}
                    </select>

                    <Button
                        onClick={handlePrint}
                        disabled={students.length === 0}
                        className="bg-slate-900 dark:bg-slate-700 text-white hover:bg-slate-800 dark:hover:bg-slate-600 shadow-md flex items-center gap-2 justify-center"
                    >
                        <Printer size={18} /> Print List
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">

                {/* Search Sidebar - No Print */}
                <div className="lg:w-80 flex-shrink-0 flex flex-col bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input
                                type="text"
                                placeholder="Find student..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div></div>
                        ) : filteredStudents.length > 0 ? (
                            filteredStudents.map(student => (
                                <div
                                    key={student.id}
                                    onClick={() => handleCheck(student.id)}
                                    className={`p-3 rounded-xl flex items-center gap-3 cursor-pointer transition-colors border ${checkedState[student.id]
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                                        : 'hover:bg-slate-50 dark:hover:bg-slate-700 border-transparent hover:border-slate-100'
                                        }`}
                                >
                                    {student.photo ? (
                                        <img src={student.photo} alt={student.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400">
                                            <User size={18} />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{student.name}</p>
                                        <p className="text-xs text-slate-500">{student.adm} • {student.grade}</p>
                                    </div>
                                    {checkedState[student.id] && (
                                        <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-slate-400 text-sm">
                                <Filter size={24} className="mx-auto mb-2 opacity-50" />
                                <p>No students found</p>
                            </div>
                        )}
                    </div>
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 text-center text-xs text-slate-500">
                        {Object.keys(checkedState).filter(k => checkedState[k]).length} of {students.length} served
                    </div>
                </div>

                {/* Printable Area Target */}
                <div className="flex-1 bg-white shadow-sm border border-slate-200 rounded-3xl overflow-hidden flex flex-col">
                    <div className="flex-1 overflow-y-auto p-8" ref={printRef}>
                        {/* Print Header */}
                        <div className="mb-8 border-b-2 border-slate-900 pb-4">
                            <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-2">Meal Serving List</h2>
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-lg font-bold text-slate-700">Meal: <span className="text-orange-600">{getSelectedItemName()}</span></p>
                                    <p className="text-sm text-slate-500">Date: {new Date().toLocaleDateString('en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Count</p>
                                    <p className="text-3xl font-black text-slate-900">{students.length}</p>
                                </div>
                            </div>
                        </div>

                        {/* Print Grid */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                            {students.map((student, index) => (
                                <div key={student.id} className="flex items-center gap-4 py-2 border-b border-dotted border-slate-300 break-inside-avoid">
                                    <span className="font-mono text-slate-400 w-6 text-sm">{index + 1}.</span>
                                    {student.photo ? (
                                        <img src={student.photo} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                            <User size={16} />
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800 text-sm leading-tight">{student.name}</p>
                                        <p className="text-xs text-slate-500 font-mono">{student.adm} • {student.grade}</p>
                                    </div>
                                    {checkedState[student.id] ? (
                                        <div className="w-6 h-6 border-2 border-emerald-500 bg-emerald-500 rounded-md flex items-center justify-center">
                                            <CheckCircle size={16} className="text-white" strokeWidth={3} />
                                        </div>
                                    ) : (
                                        <div className="w-6 h-6 border-2 border-slate-300 rounded-md"></div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {students.length === 0 && (
                            <div className="py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-lg">
                                No Subscriptions Found for this Item
                            </div>
                        )}

                        {/* Print Footer */}
                        <div className="mt-12 pt-4 border-t border-slate-200 flex justify-between text-xs text-slate-400 font-mono">
                            <p>Authorized Signature: __________________________</p>
                            <p>Generated by EduManage System</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default FoodServingList;
