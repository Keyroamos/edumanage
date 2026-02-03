import { Zap, Star, Crown, Check } from 'lucide-react';
import Button from '../ui/Button';
import { useAppStatus } from '../../context/AppStatusContext';

const Pricing = ({ onSignUp }) => {
    const { basic_price, standard_price, enterprise_price, currency } = useAppStatus();

    const plans = [
        {
            name: 'Basic',
            price: basic_price?.toLocaleString() || '1,499',
            color: 'emerald',
            icon: Zap,
            features: [
                'Student Management',
                'Admission Registration',
                'Accounting & Finance',
                'Fee Management',
                'Academic Management',
                '1 Branch'
            ],
            cta: 'Get Started',
            popular: false
        },
        {
            name: 'Standard',
            price: standard_price?.toLocaleString() || '2,499',
            color: 'blue',
            icon: Star,
            features: [
                'Everything in Basic',
                'Teacher & Staff Portal',
                'Student Portal',
                'Finance Portal',
                'Fee Structure per Class',
                'Payments & Balances',
                'Fee Statements',
                'HR & Staff Management',
                'Exams & Grading',
                'Report Cards'
            ],
            cta: 'Choose Standard',
            popular: true
        },
        {
            name: 'Enterprise',
            price: enterprise_price?.toLocaleString() || '3,499',
            color: 'violet',
            icon: Crown,
            features: [
                'Everything in Standard',
                'Communication (SMS)',
                'Transport Portal',
                'Food Management Portal',
                'Driver Portal',
                'Multi-branch (Unlimited)',
                'Advanced Financial Reports',
                'Priority Support',
                'Custom School Branding'
            ],
            cta: 'Choose Enterprise',
            popular: false
        }
    ];

    return (
        <div className="max-w-7xl mx-auto px-6 pb-24">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                {plans.map((plan, index) => (
                    <div
                        key={index}
                        className={`relative rounded-[2rem] p-8 flex flex-col items-center text-center h-full bg-white transition-all duration-300
                            ${plan.popular
                                ? 'shadow-2xl shadow-blue-900/20 scale-105 z-10 border-2 border-blue-500'
                                : 'shadow-xl shadow-slate-200/50 border border-slate-100 hover:scale-[1.02] hover:shadow-2xl'
                            }
                        `}
                    >
                        {plan.popular && (
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-6 py-2 rounded-full text-xs font-bold shadow-lg shadow-blue-500/30 flex items-center gap-2 uppercase tracking-wide">
                                <Star size={14} fill="currentColor" />
                                Most Popular
                            </div>
                        )}

                        <div className="mb-8 pt-4 w-full">
                            <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-${plan.color}-50 text-${plan.color}-600 mb-6 shadow-sm`}>
                                <plan.icon size={28} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{plan.name}</h3>
                            <div className="mt-6 flex items-baseline justify-center gap-1">
                                <span className="text-sm font-bold text-slate-400">{currency || 'KES'}</span>
                                <span className="text-5xl font-black text-slate-900 tracking-tighter">{plan.price}</span>
                                <span className="text-slate-400 font-medium">/mo</span>
                            </div>
                            <p className="text-slate-500 text-sm mt-3 font-medium">
                                {plan.popular ? 'Perfect for growing colleges.' : 'Great for starting out.'}
                            </p>
                            <div className="mt-4 inline-block px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider">
                                7-Day Free Trial
                            </div>
                        </div>

                        <div className="space-y-4 flex-1 mb-8 w-full">
                            {plan.features.map((feature, i) => (
                                <div key={i} className="flex items-center justify-center gap-3 group">
                                    <div className={`mt-1 bg-${plan.color}-100 rounded-full p-1 group-hover:bg-${plan.color}-200 transition-colors`}>
                                        <Check size={12} className={`text-${plan.color}-700 font-bold`} strokeWidth={3} />
                                    </div>
                                    <span className="text-slate-600 text-sm font-bold group-hover:text-slate-900 transition-colors">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-auto">
                            <Button
                                className={`w-full py-4 text-base font-bold rounded-xl shadow-lg transition-transform active:scale-95 ${plan.popular
                                    ? 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-blue-500/25'
                                    : 'bg-slate-900 hover:bg-slate-800 text-white shadow-slate-900/20'
                                    }`}
                                onClick={() => onSignUp(plan.name)}
                            >
                                {plan.cta}
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Pricing;
