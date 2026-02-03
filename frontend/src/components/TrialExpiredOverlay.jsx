import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CreditCard, AlertCircle, ArrowRight } from 'lucide-react';
import Button from './ui/Button';

const TrialExpiredOverlay = () => {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden text-center p-8 sm:p-12">
                <div className="w-20 h-20 rounded-3xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <Lock size={40} />
                </div>

                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                    Trial Period Expired
                </h2>

                <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium leading-relaxed">
                    Your 7-day free trial has come to an end. To continue managing your institution and access all features, please upgrade to a premium plan.
                </p>

                <div className="space-y-4">
                    <Button
                        className="w-full py-4 text-base bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20"
                        onClick={() => navigate('/subscription')}
                    >
                        <CreditCard size={18} className="mr-2" />
                        Upgrade Now
                        <ArrowRight size={18} className="ml-2" />
                    </Button>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-start gap-3 text-left">
                        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            Your data is safe! You can still view some records in read-only mode, but all management actions are locked until a subscription is active.
                        </p>
                    </div>
                </div>

                <p className="mt-8 text-xs text-slate-400 underline cursor-pointer hover:text-slate-600 dark:hover:text-slate-300" onClick={() => window.location.reload()}>
                    Already upgraded? Refresh page
                </p>
            </div>
        </div>
    );
};

export default TrialExpiredOverlay;
