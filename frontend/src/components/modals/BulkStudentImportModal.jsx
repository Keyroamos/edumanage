import React, { useState } from 'react';
import { X, Upload, Download, CheckCircle, AlertCircle, Loader2, FileText, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import axios from 'axios';
import toast from 'react-hot-toast';

const BulkStudentImportModal = ({ isOpen, onClose, onRefresh }) => {
    const [file, setFile] = useState(null);
    const [importing, setImporting] = useState(false);
    const [results, setResults] = useState(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
                toast.error('Please upload an Excel file (.xlsx or .xls)');
                return;
            }
            setFile(selectedFile);
            setResults(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file first');
            return;
        }

        setImporting(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/api/students/bulk-import/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                setResults(response.data.summary);
                toast.success(`Successfully imported ${response.data.summary.imported} students!`);
                if (onRefresh) onRefresh();
            }
        } catch (error) {
            console.error('Import error:', error);
            const errorMsg = error.response?.data?.error || 'Failed to import students';
            toast.error(errorMsg);
        } finally {
            setImporting(false);
        }
    };

    const downloadTemplate = async () => {
        try {
            const response = await axios.get('/api/students/template/', {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'student_template.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Download error:', error);
            toast.error('Failed to download template');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                >
                    {/* Header */}
                    <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400">
                                <FileText size={20} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Bulk Student Admission</h3>
                                <p className="text-xs text-slate-500">Import student records from Excel</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
                            <X size={20} className="text-slate-500" />
                        </button>
                    </div>

                    <div className="p-6">
                        {!results ? (
                            <div className="space-y-6">
                                {/* Instructions */}
                                <div className="bg-primary-50 dark:bg-primary-900/10 border border-primary-100 dark:border-primary-800/50 rounded-2xl p-4 flex gap-4">
                                    <Info className="text-primary-500 shrink-0" size={20} />
                                    <div className="text-sm">
                                        <p className="font-bold text-primary-900 dark:text-primary-300 mb-1">Important Instructions</p>
                                        <ul className="text-primary-700 dark:text-primary-400 space-y-1 list-disc ml-4">
                                            <li>Use the official template for best results.</li>
                                            <li>Columns: <b>First Name</b>, <b>Last Name</b>, and <b>Grade</b> are required.</li>
                                            <li>System will create user accounts automatically for each student.</li>
                                            <li>Admission fees will be recorded as cash payments by default.</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Upload Area */}
                                <div
                                    className={`relative border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center transition-all ${file ? 'border-primary-500 bg-primary-50/20 dark:bg-primary-900/10' : 'border-slate-200 dark:border-slate-800 hover:border-primary-400'
                                        }`}
                                >
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept=".xlsx,.xls"
                                    />
                                    <div className={`h-16 w-16 rounded-2xl flex items-center justify-center mb-4 transition-transform ${file ? 'bg-primary-500 text-white scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                        }`}>
                                        <Upload size={32} />
                                    </div>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                                        {file ? file.name : 'Click or drag Excel file here'}
                                    </p>
                                    <p className="text-xs text-slate-500">Only .xlsx or .xls files supported</p>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-between pt-4">
                                    <Button variant="outline" onClick={downloadTemplate}>
                                        <Download size={18} className="mr-2" />
                                        Download Template
                                    </Button>
                                    <div className="flex gap-3">
                                        <Button variant="ghost" onClick={onClose}>Cancel</Button>
                                        <Button
                                            onClick={handleUpload}
                                            disabled={!file || importing}
                                            isLoading={importing}
                                        >
                                            {importing ? 'Importing Students...' : 'Start Import'}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Success Summary */}
                                <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800/50 rounded-2xl p-6 text-center">
                                    <div className="h-16 w-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/20">
                                        <CheckCircle size={32} />
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Import Completed!</h4>
                                    <div className="grid grid-cols-3 gap-4 mt-6">
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <p className="text-sm text-slate-500 mb-1">Total Rows</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white">{results.total}</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <p className="text-sm text-slate-500 mb-1">Imported</p>
                                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{results.imported}</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <p className="text-sm text-slate-500 mb-1">Skipped/Failed</p>
                                            <p className="text-2xl font-black text-red-600 dark:text-red-400">{results.skipped}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Errors/Warnings */}
                                {results.errors && results.errors.length > 0 && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-4">
                                        <div className="flex items-center gap-2 mb-3 text-red-600 dark:text-red-400">
                                            <AlertCircle size={18} />
                                            <p className="text-sm font-bold uppercase tracking-wider">Issues Encountered ({results.errors.length})</p>
                                        </div>
                                        <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-2">
                                            {results.errors.map((error, idx) => (
                                                <p key={idx} className="text-xs text-slate-600 dark:text-slate-400 p-2 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                                    {error}
                                                </p>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-center pt-4">
                                    <Button onClick={onClose} className="px-12 rounded-full">Done</Button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default BulkStudentImportModal;
