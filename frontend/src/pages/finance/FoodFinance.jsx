import React, { useState, useEffect } from 'react';
import { Utensils, ChefHat, TrendingUp, Wallet, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const FoodFinance = () => {
    const [income, setIncome] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIncome();
    }, []);

    const fetchIncome = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/finance/transactions/all/?source=FOOD');
            setIncome(res.data.transactions || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-xl text-orange-600 dark:text-orange-400">
                            <ChefHat size={24} />
                        </div>
                        Food Finance
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium ml-14 mt-1">Cafeteria revenue and meal payment tracking</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
                        <p className="text-[10px] font-bold text-emerald-600 uppercase">Total Realized</p>
                        <p className="text-lg font-black text-emerald-700">KES {income.reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20"><div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-orange-600 animate-spin"></div></div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Revenue Ledger</h3>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Realized Income</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                                <tr className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                    <th className="px-6 py-4">Student/Recipient</th>
                                    <th className="px-6 py-4">Transaction Details</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                    <th className="px-6 py-4">Method</th>
                                    <th className="px-6 py-4 text-center">Reference</th>
                                    <th className="px-6 py-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {income.map((tx, idx) => (
                                    <tr key={idx} className="hover:bg-orange-50/30 dark:hover:bg-orange-500/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                                    <Utensils size={14} />
                                                </div>
                                                <span className="text-sm font-bold">{tx.title}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-slate-500 font-medium">{tx.source} Payment</span>
                                        </td>
                                        <td className="px-6 py-4 text-right font-black text-emerald-600 text-sm">
                                            + KES {tx.amount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded uppercase">{tx.method || 'CASH'}</span>
                                        </td>
                                        <td className="px-6 py-4 text-center text-xs font-mono text-slate-400">
                                            {tx.reference}
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs font-medium text-slate-500">
                                            {tx.date}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {income.length === 0 && (
                            <div className="text-center py-24">
                                <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No food revenue recorded yet</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FoodFinance;
