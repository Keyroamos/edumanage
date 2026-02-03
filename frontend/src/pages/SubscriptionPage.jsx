import React, { useState } from 'react';
import { useSchool } from '../context/SchoolContext';
import { Zap, Star, Crown, CheckCircle2, AlertCircle, Clock, ShieldCheck, X, Phone, TrendingUp } from 'lucide-react';
import Button from '../components/ui/Button';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const SubscriptionPage = () => {
    const { config } = useSchool();
    const { subscription } = config;
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('idle'); // idle, processing, success, error
    const [paymentError, setPaymentError] = useState('');
    const [paymentReference, setPaymentReference] = useState('');

    const plans = {
        Basic: {
            icon: Zap,
            color: 'emerald',
            price: 1499,
            priceLabel: '1,499'
        },
        Standard: {
            icon: Star,
            color: 'blue',
            price: 2499,
            priceLabel: '2,499'
        },
        Enterprise: {
            icon: Crown,
            color: 'violet',
            price: 3499,
            priceLabel: '3,499'
        }
    };

    const currentPlanName = subscription?.plan || 'Basic';
    const [selectedPlanName, setSelectedPlanName] = useState(currentPlanName);

    const currentPlan = plans[currentPlanName];
    const targetPlan = plans[selectedPlanName];
    const Icon = targetPlan.icon;

    // Calculate due amount
    const calculateDueAmount = () => {
        if (!subscription || (subscription.status !== 'Active' && subscription.status !== 'Trial')) {
            return targetPlan.price;
        }

        // If in trial, pay full price of target plan
        if (subscription.status === 'Trial') {
            return targetPlan.price;
        }

        // If active, calculate difference for higher plans
        if (targetPlan.price > currentPlan.price) {
            return targetPlan.price - currentPlan.price;
        }

        return targetPlan.price; // Default to target plan price (e.g. for renewals or same plan)
    };

    const dueAmount = calculateDueAmount();

    const daysRemaining = subscription?.trial_end
        ? Math.ceil((new Date(subscription.trial_end) - new Date()) / (1000 * 60 * 60 * 24))
        : 0;

    const handleUpgrade = async (e) => {
        e.preventDefault();
        setLoading(true);
        setStatus('processing');

        try {
            const response = await axios.post('/api/mpesa/stk-push/', {
                phone: phone,
                amount: dueAmount,
                account_ref: config.school_name?.substring(0, 12) || 'SUB_UPGRADE',
                description: `Upgrade to ${selectedPlanName} Plan`,
                is_subscription: true,
                target_plan: selectedPlanName
            });

            if (response.data.success || response.data.message) {
                const ref = response.data.reference;
                setPaymentReference(ref);
                setStatus('waiting');
                setLoading(false);

                // Start polling for payment confirmation
                pollPaymentStatus(ref);
            } else {
                setStatus('error');
                setLoading(false);
            }
        } catch (error) {
            console.error('Payment Error:', error);
            const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Something went wrong while initiating the payment.';
            setStatus('error');
            setPaymentError(errorMsg);
            setLoading(false);
        }
    };

    const pollPaymentStatus = async (reference) => {
        let attempts = 0;
        const maxAttempts = 40; // Poll for up to 2 minutes

        const checkStatus = async () => {
            try {
                // Call the verification endpoint with the payment reference
                const verifyResponse = await axios.post('/api/paystack/verify-subscription/', {
                    reference: reference || paymentReference
                });

                if (verifyResponse.data.success && verifyResponse.data.upgraded) {
                    setStatus('success');
                    setTimeout(() => {
                        window.location.reload();
                    }, 2000);
                    return;
                }

                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkStatus, 3000);
                } else {
                    setStatus('success');
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
                attempts++;
                if (attempts < maxAttempts) {
                    setTimeout(checkStatus, 3000);
                } else {
                    setStatus('success');
                }
            }
        };

        // Start checking after 5 seconds
        setTimeout(checkStatus, 5000);
    };

    return (
        <div className="p-6 lg:p-10 max-w-6xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Subscription Plan</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your institution's subscription and billing.</p>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Current Plan Card & Upgrade Selector */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden">
                        <div className={`absolute top-0 right-0 w-64 h-64 bg-${currentPlan.color}-500/5 blur-[100px] -z-10`} />

                        <div className="flex flex-col sm:flex-row items-start justify-between gap-6">
                            <div className="flex items-center gap-5">
                                <div className={`w-20 h-20 rounded-3xl flex items-center justify-center bg-${currentPlan.color}-50 dark:bg-${currentPlan.color}-900/20 text-${currentPlan.color}-600 dark:text-${currentPlan.color}-400 shadow-sm shadow-${currentPlan.color}-500/10`}>
                                    <Icon size={40} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{subscription?.plan} Edition</h2>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-${currentPlan.color}-100 dark:bg-${currentPlan.color}-900/30 text-${currentPlan.color}-700 dark:text-${currentPlan.color}-400`}>
                                            {subscription?.status}
                                        </span>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                        Your institution is currently on the <b>{subscription?.plan}</b> plan.
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Monthly Billing</p>
                                <p className="text-3xl font-black text-slate-900 dark:text-white leading-none">
                                    KES {currentPlan.priceLabel}
                                    <span className="text-sm font-medium text-slate-400">/mo</span>
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12">
                            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shadow-sm">
                                    <Clock size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Next Billing Date</p>
                                    <p className="font-bold text-slate-900 dark:text-white">
                                        {subscription?.trial_end ? new Date(subscription.trial_end).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-slate-400 shadow-sm">
                                    <ShieldCheck size={20} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Payment Status</p>
                                    <p className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                        Active {subscription?.status === 'Trial' ? 'Trial' : 'Subscription'}
                                        <CheckCircle2 size={14} />
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upgrade Logic Section */}
                    {subscription?.status === 'Active' && selectedPlanName !== currentPlanName && (
                        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 p-6 rounded-[2.5rem] flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                                <TrendingUp size={24} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-amber-900 dark:text-amber-400">Pro-rated Upgrade</h4>
                                <p className="text-xs text-amber-700 dark:text-amber-500 leading-relaxed font-medium">
                                    You are upgrading from {currentPlanName} to {selectedPlanName}. You'll only pay the difference:
                                    <span className="font-bold ml-1">KES {dueAmount.toLocaleString()}</span>.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Plan Selector */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white shrink-0">Available Plans</h3>
                            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {Object.entries(plans).map(([name, plan]) => {
                                const isCurrent = name === currentPlanName;
                                const isSelected = selectedPlanName === name;

                                return (
                                    <button
                                        key={name}
                                        onClick={() => setSelectedPlanName(name)}
                                        className={`p-6 rounded-[2.5rem] border-2 transition-all flex flex-col items-center text-center gap-4 relative overflow-hidden group
                                            ${isSelected
                                                ? `border-${plan.color}-500 bg-${plan.color}-50 dark:bg-${plan.color}-900/10`
                                                : `border-slate-100 dark:border-slate-800 hover:border-${plan.color}-200 dark:hover:border-${plan.color}-800 bg-white dark:bg-slate-900`
                                            }`}
                                    >
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110
                                            ${isSelected
                                                ? `bg-${plan.color}-500 text-white shadow-${plan.color}-500/20`
                                                : `bg-${plan.color}-50 dark:bg-${plan.color}-900/20 text-${plan.color}-600 dark:text-${plan.color}-400`
                                            }`}>
                                            <plan.icon size={28} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{name}</p>
                                            <p className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? `text-${plan.color}-600` : 'text-slate-400'}`}>
                                                KES {plan.priceLabel}/mo
                                            </p>
                                        </div>

                                        {isCurrent && (
                                            <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-slate-900 text-[8px] font-black uppercase text-white">Current</div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Trial Status & Help */}
                <div className="space-y-6">
                    {subscription?.status === 'Trial' && (
                        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20 border border-white/5">
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/20 rounded-full blur-2xl" />
                            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-violet-600/20 rounded-full blur-2xl" />

                            <div className="relative z-10 flex flex-col">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-widest mb-6 border border-white/10">
                                    <Clock size={12} />
                                    Trial Countdown
                                </div>
                                <h3 className="text-4xl font-black mb-2 tracking-tighter">
                                    {daysRemaining} <span className="text-lg font-bold text-slate-400 tracking-normal uppercase">days</span>
                                </h3>
                                <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
                                    Your trial expires on <b>{new Date(subscription.trial_end).toLocaleDateString()}</b>.
                                    Upgrade now to activate your full <b>{selectedPlanName}</b> subscription.
                                </p>

                                <div className="space-y-3">
                                    <Button
                                        onClick={() => setIsPaymentModalOpen(true)}
                                        className="w-full py-4 text-base shadow-xl shadow-indigo-600/30 bg-indigo-600 hover:bg-indigo-500"
                                    >
                                        {selectedPlanName === currentPlanName ? 'Activate Plan' : `Upgrade to ${selectedPlanName}`}
                                    </Button>
                                    <p className="text-[10px] text-center text-slate-500 font-medium">
                                        Secure payment via M-Pesa
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {subscription?.status === 'Active' && selectedPlanName !== currentPlanName && (
                        <div className="bg-indigo-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-600/20">
                            <h3 className="text-xl font-black mb-4">Confirm Upgrade</h3>
                            <p className="text-indigo-100 text-sm mb-6 leading-relaxed">
                                Switch to the <b>{selectedPlanName}</b> plan immediately. Your features will update as soon as the payment is confirmed.
                            </p>
                            <Button
                                onClick={() => setIsPaymentModalOpen(true)}
                                className="w-full bg-white text-indigo-600 hover:bg-white/90 py-4 shadow-xl"
                            >
                                Pay KES {dueAmount.toLocaleString()}
                            </Button>
                        </div>
                    )}

                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-6 shadow-sm">
                            <AlertCircle size={24} />
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Need help?</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6">
                            Questions about our plans? Our team is here to help you scale your institution.
                        </p>
                        <Button variant="outline" className="w-full py-3 rounded-2xl">
                            Contact Support
                        </Button>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <AnimatePresence>
                {isPaymentModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPaymentModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-white/10 overflow-hidden"
                        >
                            <div className="p-8 sm:p-10">
                                <div className="flex justify-between items-start mb-8">
                                    <div className={`w-14 h-14 rounded-2xl bg-${targetPlan.color}-100 dark:bg-${targetPlan.color}-900/30 text-${targetPlan.color}-600 dark:text-${targetPlan.color}-400 flex items-center justify-center`}>
                                        <targetPlan.icon size={32} />
                                    </div>
                                    <button
                                        onClick={() => setIsPaymentModalOpen(false)}
                                        className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                    >
                                        <X size={20} className="text-slate-400" />
                                    </button>
                                </div>

                                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                                    {selectedPlanName === currentPlanName ? 'Renew Sub' : `Upgrade to ${selectedPlanName}`}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">
                                    {subscription?.status === 'Active'
                                        ? `Confirm your upgrade to the ${selectedPlanName} edition.`
                                        : `Experience the full power of EduManage ${selectedPlanName} edition.`}
                                </p>

                                {status === 'idle' || status === 'processing' ? (
                                    <form onSubmit={handleUpgrade} className="space-y-6">
                                        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                            <div className="flex justify-between items-center mb-4">
                                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                                                    {subscription?.status === 'Active' && selectedPlanName !== currentPlanName ? 'Upgrade Pay' : 'Payable'}
                                                </span>
                                                <span className="text-2xl font-black text-slate-900 dark:text-white">KES {dueAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="h-px bg-slate-200 dark:bg-slate-700 mb-4" />
                                            <div className="flex items-center gap-3 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                <CheckCircle2 size={14} />
                                                <span>Instant Activation after Payment</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">M-Pesa Phone Number</label>
                                            <div className="relative">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <Phone size={18} />
                                                </div>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={phone}
                                                    onChange={(e) => setPhone(e.target.value)}
                                                    placeholder="e.g. 0712345678"
                                                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white font-bold placeholder:text-slate-500 focus:ring-2 focus:ring-violet-500 transition-all shadow-inner"
                                                />
                                            </div>
                                        </div>

                                        <Button
                                            type="submit"
                                            isLoading={loading}
                                            className="w-full py-4 text-base bg-emerald-600 hover:bg-emerald-500 shadow-xl shadow-emerald-600/20"
                                        >
                                            {loading ? 'Sending Request...' : `Pay KES ${dueAmount.toLocaleString()}`}
                                        </Button>
                                    </form>
                                ) : status === 'waiting' ? (
                                    <div className="text-center py-8 space-y-6">
                                        <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                                            <div className="w-12 h-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin"></div>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Waiting for Payment...</h3>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                                Please complete the M-Pesa payment on your phone. We're monitoring your payment and will upgrade your account automatically once confirmed.
                                            </p>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                                            <Clock size={14} className="animate-pulse" />
                                            <span>This may take up to 2 minutes</span>
                                        </div>
                                    </div>
                                ) : status === 'success' ? (
                                    <div className="text-center py-8 space-y-6">
                                        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
                                            <CheckCircle2 size={48} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Upgrade Complete!</h3>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                                Your subscription has been upgraded successfully. Refreshing your dashboard...
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-8 space-y-6">
                                        <div className="w-20 h-20 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
                                            <AlertCircle size={48} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Payment Failed</h3>
                                            <p className="text-slate-500 dark:text-slate-400 font-medium">
                                                {paymentError || "Something went wrong while initiating the payment."}
                                            </p>
                                        </div>
                                        <Button onClick={() => setStatus('idle')} variant="outline" className="w-full">Try Again</Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SubscriptionPage;

