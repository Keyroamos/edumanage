import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowLeft, Printer, Share2,
    CheckCircle, FileText, Building2, GraduationCap, MapPin, Phone, Mail, QrCode
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { useSchool } from '../../context/SchoolContext';
import { useReactToPrint } from 'react-to-print';

const FinanceTransactionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { config } = useSchool();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const componentRef = useRef();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`/api/finance/transactions/${id}/`);
                setData(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `Receipt_${data?.transaction?.id || 'doc'}`,
    });

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (!data) return <div className="p-12 text-center text-slate-500">Transaction not found.</div>;

    const { transaction, student } = data;

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 bg-slate-50 dark:bg-slate-950/20 min-h-screen">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-medium"
                >
                    <ArrowLeft size={18} /> Back to Ledger
                </button>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Button variant="outline" className="flex-1 sm:flex-initial gap-2 border-slate-200 hover:bg-slate-50" onClick={handlePrint}>
                        <Printer size={18} /> Print Receipt
                    </Button>
                </div>
            </div>

            {/* Receipt Container */}
            <div className="flex justify-center items-start">
                <div
                    ref={componentRef}
                    className="w-full max-w-[210mm] bg-white text-slate-950 shadow-2xl overflow-hidden relative"
                    style={{
                        fontFamily: "'Inter', sans-serif",
                        padding: '12mm'
                    }}
                >
                    {/* Watermark Logo (Mock) */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none overflow-hidden">
                        <GraduationCap size={400} strokeWidth={1} />
                    </div>

                    {/* Official Border Top */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-indigo-600"></div>

                    {/* Header Section */}
                    <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg overflow-hidden shrink-0">
                                    {config.school_logo ? (
                                        <img src={config.school_logo} alt="School Logo" className="h-full w-full object-cover" />
                                    ) : (
                                        <Building2 size={24} />
                                    )}
                                </div>
                                <div>
                                    <h1 className="text-xl font-bold uppercase tracking-tight text-indigo-950 leading-tight">
                                        {config.school_name}
                                    </h1>
                                    <p className="text-indigo-600 font-semibold tracking-widest text-[9px] uppercase">Official Financial Document</p>
                                </div>
                            </div>
                            <div className="text-[11px] text-slate-500 space-y-0.5 pl-1 leading-relaxed">
                                <p className="flex items-center gap-2"><MapPin size={11} className="text-slate-400" /> {config.school_address}</p>
                                <p className="flex items-center gap-2"><Phone size={11} className="text-slate-400" /> {config.school_phone} | <Mail size={11} className="text-slate-400" /> {config.school_email}</p>
                            </div>
                        </div>

                        <div className="text-right space-y-2">
                            <div className="bg-indigo-50 text-indigo-700 font-bold text-xl px-5 py-2 rounded-2xl inline-block ring-1 ring-indigo-100 uppercase tracking-tighter">
                                RECEIPT
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Receipt Number</p>
                                <p className="text-sm font-mono font-bold text-slate-900 tracking-tight">#{transaction.id.toString().padStart(8, '0')}</p>
                            </div>
                            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-[9px] font-bold uppercase ring-1 ring-emerald-100">
                                <CheckCircle size={11} strokeWidth={3} /> Payment Captured
                            </div>
                        </div>
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        {/* Student Details */}
                        <div className="bg-slate-50/50 p-5 rounded-2xl ring-1 ring-slate-100">
                            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1.5 font-sans">Student Information</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[11px] text-slate-500">Full Name</span>
                                    <span className="text-[12px] font-bold text-slate-900 uppercase">{student.name}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[11px] text-slate-500">Admission No.</span>
                                    <span className="text-[11px] font-mono font-bold text-slate-900">{student.admission_number}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[11px] text-slate-500">Current Grade</span>
                                    <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-100">{student.grade}</span>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details */}
                        <div className="bg-slate-50/50 p-5 rounded-2xl ring-1 ring-slate-100">
                            <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1.5 font-sans">Transaction Details</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[11px] text-slate-500">Date & Time</span>
                                    <span className="text-[11px] font-semibold text-slate-700">{transaction.date}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[11px] text-slate-500">Method</span>
                                    <span className="text-[11px] font-bold text-slate-900 uppercase">{transaction.method}</span>
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-[11px] text-slate-500">Ref Code</span>
                                    <span className="text-[11px] font-mono font-bold text-indigo-700">{transaction.reference || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Financial Summary Table */}
                    <div className="mb-8">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left border-b border-slate-200">
                                    <th className="py-3 px-4 bg-slate-900 text-white font-bold uppercase text-[9px] tracking-widest rounded-tl-xl">Description of Service/Fee</th>
                                    <th className="py-3 px-4 bg-slate-900 text-white font-bold uppercase text-[9px] tracking-widest text-right">Unit Price</th>
                                    <th className="py-3 px-4 bg-slate-900 text-white font-bold uppercase text-[9px] tracking-widest text-right rounded-tr-xl">Amount (KES)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                <tr>
                                    <td className="py-5 px-4">
                                        <p className="font-bold text-[13px] text-slate-900">{transaction.description}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[8px] font-bold text-white bg-indigo-500 px-1.5 py-0.5 rounded uppercase">Category</span>
                                            <span className="text-[10px] font-medium text-slate-400 capitalize">{transaction.type?.toLowerCase().replace('_', ' ')}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-4 text-right font-mono text-[12px] text-slate-500">
                                        {transaction.amount.toLocaleString()}.00
                                    </td>
                                    <td className="py-5 px-4 text-right font-mono text-[14px] font-bold text-slate-900">
                                        {transaction.amount.toLocaleString()}.00
                                    </td>
                                </tr>
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="2" className="py-5 text-right pr-4">
                                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Total Net Payment</p>
                                    </td>
                                    <td className={`py-5 px-4 text-right bg-indigo-50 ${student.balance > 0 ? '' : 'rounded-b-xl'}`}>
                                        <p className="text-xl font-bold text-indigo-700">
                                            <span className="text-xs font-bold mr-1">KES</span>
                                            {transaction.amount.toLocaleString()}.00
                                        </p>
                                    </td>
                                </tr>
                                {student.balance > 0 && (
                                    <tr>
                                        <td colSpan="2" className="py-4 text-right pr-4 border-t border-slate-100">
                                            <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Outstanding Balance</p>
                                        </td>
                                        <td className="py-4 px-4 text-right bg-red-50 rounded-b-xl border-t border-white">
                                            <p className="text-sm font-bold text-red-600">
                                                <span className="text-[10px] mr-1">KES</span>
                                                {student.balance.toLocaleString()}.00
                                            </p>
                                        </td>
                                    </tr>
                                )}
                            </tfoot>
                        </table>
                    </div>

                    {/* Footer Auth Section */}
                    <div className="grid grid-cols-2 gap-12 pt-6 border-t border-slate-100">
                        <div className="space-y-5">
                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 inline-block">
                                <div className="h-20 w-20 bg-white flex items-center justify-center border-2 border-slate-100">
                                    {/* Mock QR Code */}
                                    <QrCode size={64} className="text-slate-200" />
                                </div>
                                <p className="text-[7px] text-slate-400 mt-1.5 font-mono uppercase text-center">Scan to Verify</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight leading-normal">
                                    Disclaimers & Conditions:<br />
                                    <span className="font-medium">1. Computer-generated official receipt.<br />
                                        2. Fees are non-refundable/transferable.<br />
                                        3. Retain for future academic queries.</span>
                                </p>
                            </div>
                        </div>

                        <div className="space-y-10">
                            <div className="text-right">
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mb-1">Served By:</p>
                                <p className="text-[13px] font-bold text-slate-800 italic">{transaction.recorded_by}</p>
                                <p className="text-[8px] text-slate-400 font-mono mt-0.5">Authorized Finance Officer</p>
                            </div>

                            <div className="space-y-3">
                                <div className="border-b border-slate-200 pb-1 flex justify-between items-baseline">
                                    <span className="text-[8px] font-bold text-slate-300 uppercase">OFFICIAL SEAL / STAMP</span>
                                    <div className="h-16 w-16 rounded-full border-2 border-dashed border-slate-100"></div>
                                </div>
                                <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold uppercase">
                                    <span>Date of Issue: {new Date().toLocaleDateString()}</span>
                                    <span className="font-mono">CID: {Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Copyright */}
                    <div className="mt-8 text-center">
                        <p className="text-[8px] text-slate-300 font-bold uppercase tracking-[0.3em]">
                            {config.school_name} - {new Date().getFullYear()} - OFFICIAL DOCUMENT
                        </p>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body {
                        background: white !important;
                        print-color-adjust: exact;
                        -webkit-print-color-adjust: exact;
                    }
                }
            `}</style>
        </div>
    );
};

export default FinanceTransactionDetail;
