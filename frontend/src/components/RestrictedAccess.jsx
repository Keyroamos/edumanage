import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ArrowLeft, Crown, Star, Zap } from 'lucide-react';
import Button from './ui/Button';

const RestrictedAccess = ({ feature, requiredPlan }) => {
    const navigate = useNavigate();

    const planData = {
        Standard: {
            icon: Star,
            color: 'blue',
            price: '2,499'
        },
        Enterprise: {
            icon: Crown,
            color: 'violet',
            price: '3,499'
        }
    };

    const target = planData[requiredPlan] || planData.Standard;
    const PlanIcon = target.icon;

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-8 text-center">
            <div className="relative mb-8">
                <div className="w-24 h-24 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                    <Lock size={40} />
                </div>
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg border-4 border-white dark:border-slate-900">
                    <Crown size={16} />
                </div>
            </div>

            <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
                Upgrade Required
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10 font-medium leading-relaxed">
                The <span className="text-slate-900 dark:text-white font-bold">{feature}</span> module is not available in your current plan.
                Upgrade to the <span className={`text-${target.color}-600 dark:text-${target.color}-400 font-bold`}>{requiredPlan} Edition</span> to unlock this and many more powerful features.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <Button
                    variant="outline"
                    onClick={() => navigate(-1)}
                    className="flex-1 rounded-2xl py-4"
                >
                    <ArrowLeft size={18} className="mr-2" />
                    Go Back
                </Button>
                <Button
                    onClick={() => navigate('/subscription')}
                    className={`flex-1 rounded-2xl py-4 bg-${target.color}-600 hover:bg-${target.color}-500 shadow-xl shadow-${target.color}-600/20`}
                >
                    Upgrade Now
                </Button>
            </div>

            <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-2xl opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <Zap className="text-emerald-500 mb-2" size={20} />
                    <p className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">Basic</p>
                </div>
                <div className="p-4 rounded-2xl border border-blue-200 dark:border-blue-800 bg-blue-50/10 dark:bg-blue-900/10">
                    <Star className="text-blue-500 mb-2" size={20} />
                    <p className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">Standard</p>
                </div>
                <div className="p-4 rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50/10 dark:bg-violet-900/10">
                    <Crown className="text-violet-500 mb-2" size={20} />
                    <p className="text-xs font-bold text-slate-900 dark:text-white tracking-tight">Enterprise</p>
                </div>
            </div>
        </div>
    );
};

export default RestrictedAccess;
