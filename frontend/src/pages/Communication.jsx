import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    MessageSquare, Send, Users, GraduationCap, User, Filter,
    History, CheckCircle2, XCircle, Clock, ChevronRight,
    Search, AlertCircle, BarChart3, Mail, Bell, ShieldPlus,
    LayoutDashboard, Target, ClipboardList, Plus, Copy, Sparkles
} from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { useSchool } from '../context/SchoolContext';
import { toast } from 'react-hot-toast';
import SearchableSelect from '../components/ui/SearchableSelect';
import { motion, AnimatePresence } from 'framer-motion';

const Communication = () => {
    const { config } = useSchool();
    const [activeTab, setActiveTab] = useState('send'); // 'send' or 'history'
    const [messages, setMessages] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        recipient_type: 'ALL_STUDENTS',
        message: '',
        specific_grade: '',
        specific_student: '',
        specific_employee: '',
        fee_min: '',
        fee_max: '',
        assessment_term: 1,
        assessment_type: 'mid-term'
    });

    const [grades, setGrades] = useState([]);
    const [students, setStudents] = useState([]);
    const [staff, setStaff] = useState([]);

    useEffect(() => {
        fetchData();
        fetchTemplates();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [msgRes, gradeRes, studentRes, staffRes] = await Promise.all([
                axios.get('/api/sms/'),
                axios.get('/api/grades/'),
                axios.get('/api/students/'),
                axios.get('/api/hr/staff/')
            ]);
            setMessages(msgRes.data.messages || []);

            // Deduplicate grades locally to ensure UI is clean
            const rawGrades = gradeRes.data.grades || [];
            const uniqueGrades = [];
            const seen = new Set();
            for (const g of rawGrades) {
                if (!seen.has(g.name)) {
                    seen.add(g.name);
                    uniqueGrades.push(g);
                }
            }
            setGrades(uniqueGrades);

            setStudents(studentRes.data.students || []);
            setStaff(staffRes.data.staff || []);
        } catch (error) {
            console.error('Error fetching communication data:', error);
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplates = async () => {
        try {
            const res = await axios.get('/api/communication/templates/');
            setTemplates(res.data.templates || []);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const handleSendSMS = async (e) => {
        if (e) e.preventDefault();
        if (!formData.message) {
            toast.error('Please enter a message');
            return;
        }

        setSending(true);
        try {
            const response = await axios.post('/api/sms/send/bulk/', formData);
            if (response.data.success) {
                toast.success(`Message sent to ${response.data.recipients} recipients`);
                setFormData({
                    ...formData,
                    message: ''
                });
                fetchData();
                setActiveTab('history');
            }
        } catch (error) {
            console.error('Error sending SMS:', error);
            toast.error(error.response?.data?.error || 'Failed to send message');
        } finally {
            setSending(false);
        }
    };

    const applyTemplate = (template) => {
        setFormData(prev => ({ ...prev, message: template.message }));
        toast.success(`Template "${template.name}" applied`);
    };

    const insertPlaceholder = (placeholder) => {
        setFormData(prev => ({ ...prev, message: prev.message + placeholder }));
    };

    const recipientTypes = [
        { id: 'ALL_STUDENTS', label: 'All Parents', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
        { id: 'GRADE', label: 'Specific Class', icon: GraduationCap, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { id: 'FEES_REMINDER', label: 'Fee Reminders', icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { id: 'ASSESSMENT_RESULTS', label: 'Assessment Results', icon: ClipboardList, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
        { id: 'ALL_TEACHERS', label: 'All Teachers', icon: User, color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20' },
        { id: 'ALL_STAFF', label: 'All Staff', icon: ShieldPlus, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
        { id: 'INDIVIDUAL', label: 'Individual Student', icon: User, color: 'text-sky-500', bg: 'bg-sky-50 dark:bg-sky-900/20' },
        { id: 'INDIVIDUAL_STAFF', label: 'Individual Staff', icon: User, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    ];

    const placeholders = [
        { tag: '{student_name}', label: 'Student Name' },
        { tag: '{parent_name}', label: 'Parent Name' },
        { tag: '{balance}', label: 'Fee Balance' },
        { tag: '{results}', label: 'Exam Results' },
        { tag: '{term}', label: 'Term' },
        { tag: '{exam_type}', label: 'Exam Type' },
        { tag: '{school_name}', label: 'School Name' },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case 'SENT': return <span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle2 size={12} /> Sent</span>;
            case 'FAILED': return <span className="bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><XCircle size={12} /> Failed</span>;
            case 'PENDING': return <span className="bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1"><Clock size={12} /> Pending</span>;
            default: return status;
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-8 min-h-screen bg-slate-50 dark:bg-slate-900/50">
            <PageHeader
                title="Communication Portal"
                subtitle="Manage mass SMS and school-wide communications"
                icon={<MessageSquare className="text-white" />}
                gradient="from-indigo-600 via-violet-600 to-purple-700"
            />

            {/* Premium Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'Messages Sent', val: messages.filter(m => m.status === 'SENT').length, icon: Send, color: 'indigo' },
                    { label: 'Deliveries', val: messages.reduce((acc, curr) => acc + (curr.status === 'SENT' ? curr.recipients_count : 0), 0), icon: CheckCircle2, color: 'emerald' },
                    { label: 'Failed', val: messages.filter(m => m.status === 'FAILED').length, icon: AlertCircle, color: 'rose' },
                    { label: 'SMS Balance', val: 'Unlimited', icon: Mail, color: 'amber' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                    >
                        <Card className={`p-6 border-none bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all group`}>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{stat.label}</p>
                                    <h3 className="text-3xl font-black mt-2 text-slate-900 dark:text-white tabular-nums">
                                        {stat.val}
                                    </h3>
                                </div>
                                <div className={`p-4 bg-${stat.color}-50 dark:bg-${stat.color}-900/20 rounded-2xl text-${stat.color}-600 dark:text-${stat.color}-400 group-hover:scale-110 transition-transform`}>
                                    <stat.icon size={24} />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Navigation Tabs */}
            <div className="flex p-1 bg-white dark:bg-slate-800 rounded-2xl w-fit border border-slate-200 dark:border-slate-700">
                <button
                    onClick={() => setActiveTab('send')}
                    className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'send'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    <Send size={18} /> Compose
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${activeTab === 'history'
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                >
                    <History size={18} /> Logs
                </button>
            </div>

            {activeTab === 'send' ? (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left: Configuration (Col 7) */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* 1. Recipient Selection */}
                        <Card className="p-8 bg-white dark:bg-slate-800 border-none shadow-sm relative z-20 overflow-visible">
                            <div className="absolute top-0 right-0 p-8 opacity-5 overflow-hidden">
                                <Users size={120} />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                <div className="p-2 bg-indigo-600 rounded-lg"><Target size={20} className="text-white" /></div>
                                Target Audience
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {recipientTypes.map((type) => (
                                    <button
                                        key={type.id}
                                        onClick={() => setFormData({ ...formData, recipient_type: type.id })}
                                        className={`flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all gap-3 group relative overflow-hidden ${formData.recipient_type === type.id
                                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 shadow-inner'
                                            : 'border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-500'
                                            }`}
                                    >
                                        <div className={`p-3 rounded-xl ${formData.recipient_type === type.id ? 'bg-indigo-600 text-white' : type.bg + ' ' + type.color}`}>
                                            <type.icon size={24} />
                                        </div>
                                        <span className={`text-xs font-black text-center ${formData.recipient_type === type.id ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-600 dark:text-slate-400'}`}>
                                            {type.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {/* Dynamically shown filters based on selection */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={formData.recipient_type}
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-slate-100 dark:border-slate-700"
                                >
                                    {(formData.recipient_type === 'GRADE' || formData.recipient_type === 'FEES_REMINDER' || formData.recipient_type === 'ASSESSMENT_RESULTS') && (
                                        <div>
                                            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Target Grade / Class</label>
                                            <select
                                                value={formData.specific_grade}
                                                onChange={(e) => setFormData({ ...formData, specific_grade: e.target.value })}
                                                className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 text-slate-900 dark:text-white font-bold outline-none transition-all"
                                            >
                                                <option value="">All Classes</option>
                                                {grades.map(g => (
                                                    <option key={g.id} value={g.id}>{g.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {formData.recipient_type === 'FEES_REMINDER' && (
                                        <>
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Min Owed Balance (KES)</label>
                                                <input
                                                    type="number"
                                                    value={formData.fee_min}
                                                    onChange={(e) => setFormData({ ...formData, fee_min: e.target.value })}
                                                    placeholder="0"
                                                    className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 text-slate-900 dark:text-white font-bold outline-none"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {formData.recipient_type === 'ASSESSMENT_RESULTS' && (
                                        <>
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Academic Term</label>
                                                <select
                                                    value={formData.assessment_term}
                                                    onChange={(e) => setFormData({ ...formData, assessment_term: e.target.value })}
                                                    className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 text-slate-900 dark:text-white font-bold outline-none"
                                                >
                                                    <option value="1">Term 1</option>
                                                    <option value="2">Term 2</option>
                                                    <option value="3">Term 3</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-black text-slate-400 uppercase mb-2">Assessment Type</label>
                                                <select
                                                    value={formData.assessment_type}
                                                    onChange={(e) => setFormData({ ...formData, assessment_type: e.target.value })}
                                                    className="w-full p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 text-slate-900 dark:text-white font-bold outline-none"
                                                >
                                                    <option value="opener">Opener Results</option>
                                                    <option value="mid-term">Mid-Term Results</option>
                                                    <option value="end-term">End-Term Results</option>
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    {formData.recipient_type === 'INDIVIDUAL' && (
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Select Student</label>
                                            <SearchableSelect
                                                options={students.map(s => ({ value: s.id, label: `${s.full_name} (${s.admission_number})` }))}
                                                value={formData.specific_student}
                                                onChange={(val) => setFormData({ ...formData, specific_student: val })}
                                                placeholder="Type to search student..."
                                                className="z-50"
                                            />
                                        </div>
                                    )}

                                    {formData.recipient_type === 'INDIVIDUAL_STAFF' && (
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-black text-slate-400 uppercase mb-2">Select Staff member</label>
                                            <SearchableSelect
                                                options={staff.map(s => ({ value: s.id, label: `${s.first_name} ${s.last_name} (${s.position})` }))}
                                                value={formData.specific_employee}
                                                onChange={(val) => setFormData({ ...formData, specific_employee: val })}
                                                placeholder="Type to search staff..."
                                                className="z-50"
                                            />
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                        </Card>

                        {/* 2. Message Composition */}
                        <Card className="p-8 bg-white dark:bg-slate-800 border-none shadow-sm relative">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                                <div className="p-2 bg-purple-600 rounded-lg"><MessageSquare size={20} className="text-white" /></div>
                                Compose Message
                            </h3>

                            <div className="space-y-6">
                                <div>
                                    <div className="flex justify-between items-end mb-2">
                                        <label className="block text-xs font-black text-slate-400 uppercase">Message Content</label>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${formData.message.length > 160 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {formData.message.length} / 160 ({(Math.ceil(formData.message.length / 160) || 1)} SMS)
                                        </span>
                                    </div>
                                    <textarea
                                        value={formData.message}
                                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="Type your message here..."
                                        className="w-full h-48 p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-indigo-500 text-slate-900 dark:text-white font-medium outline-none resize-none transition-all placeholder:text-slate-400"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-400 uppercase mb-3">Quick Insert Placeholders</label>
                                    <div className="flex flex-wrap gap-2">
                                        {placeholders.map((p, i) => (
                                            <button
                                                key={i}
                                                onClick={() => insertPlaceholder(p.tag)}
                                                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white text-slate-600 dark:text-slate-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 group"
                                            >
                                                <Plus size={12} className="group-hover:rotate-90 transition-transform" />
                                                {p.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    onClick={handleSendSMS}
                                    disabled={sending || !formData.message}
                                    className="w-full py-4 text-lg font-black bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                                >
                                    {sending ? (
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    ) : (
                                        <>
                                            <Send size={24} />
                                            SEND MESSAGE NOW
                                        </>
                                    )}
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Right: Templates Sidebar (Col 4) */}
                    <div className="lg:col-span-4 space-y-8">
                        <Card className="p-6 bg-indigo-600 text-white border-none shadow-xl overflow-hidden relative">
                            <div className="absolute -bottom-8 -right-8 opacity-20 rotate-12">
                                <Sparkles size={160} />
                            </div>
                            <h4 className="text-lg font-black mb-1">AI Smart Templates</h4>
                            <p className="text-indigo-100 text-sm mb-6 font-medium">Ready-made formats for common school scenarios.</p>

                            <div className="space-y-3 relative z-10">
                                {templates.map((tpl) => (
                                    <button
                                        key={tpl.id}
                                        onClick={() => applyTemplate(tpl)}
                                        className="w-full text-left p-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 transition-all group"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-black uppercase tracking-widest text-indigo-200">{tpl.category}</span>
                                            <Copy size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                        <p className="font-bold text-sm mb-2">{tpl.name}</p>
                                        <p className="text-[11px] text-indigo-100 line-clamp-2 italic">"{tpl.message}"</p>
                                    </button>
                                ))}
                            </div>
                        </Card>

                        <Card className="p-6 bg-white dark:bg-slate-800 border-none shadow-sm">
                            <h4 className="text-sm font-black text-slate-400 uppercase mb-4">Tips for Results</h4>
                            <ul className="space-y-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                                <li className="flex gap-2">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    <span>The system automatically pulls the latest marks for the selected term & type.</span>
                                </li>
                                <li className="flex gap-2">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    <span>Use <b>{'{results}'}</b> to insert the list of subjects and marks.</span>
                                </li>
                                <li className="flex gap-2">
                                    <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                    <span>Individual messages are sent to parents of the selected class.</span>
                                </li>
                            </ul>
                        </Card>
                    </div>
                </div>
            ) : (
                /* Logs Tab */
                <Card className="bg-white dark:bg-slate-800 border-none shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                    <th className="p-6">Time & Author</th>
                                    <th className="p-6">Audience</th>
                                    <th className="p-6">Content</th>
                                    <th className="p-6">Recipients</th>
                                    <th className="p-6 text-center">Status</th>
                                    <th className="p-6 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {messages.map((msg, idx) => (
                                    <tr key={idx} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-900 dark:text-white uppercase">
                                                    {new Date(msg.sent_at || msg.created_at).toLocaleDateString('en-GB')}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-1">{msg.sent_by}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-1.5 rounded-lg border border-indigo-100 dark:border-indigo-800">
                                                {msg.recipient_type_display}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-[280px] font-medium" title={msg.message}>
                                                {msg.message}
                                            </p>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <div className="p-1.5 bg-slate-100 dark:bg-slate-900 rounded-lg text-slate-500"><Users size={14} /></div>
                                                <span className="text-sm font-black text-slate-900 dark:text-white">{msg.recipients_count}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex justify-center">
                                                {getStatusBadge(msg.status)}
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <button className="p-2 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-slate-200 dark:hover:border-slate-600 rounded-xl text-slate-400 hover:text-indigo-600 transition-all shadow-sm">
                                                <ChevronRight size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {messages.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-6">
                                                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center">
                                                    <History size={48} className="text-slate-300" />
                                                </div>
                                                <div>
                                                    <p className="text-slate-900 dark:text-white font-black text-2xl">No Message Logs</p>
                                                    <p className="text-slate-500 font-medium max-w-xs mx-auto mt-2">Historical communication records will be displayed here for auditing purposes.</p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default Communication;
