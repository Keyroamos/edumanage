import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';
import Pricing from '../components/landing/Pricing';
import { HelpCircle } from 'lucide-react';

const PricingPage = () => {
    const navigate = useNavigate();

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            <PublicNavbar />

            <main className="pt-20">
                {/* Hero Section */}
                <div className="pt-20 pb-12 md:pt-32 md:pb-20 text-center px-6">
                    <div className="max-w-3xl mx-auto space-y-6">
                        <span className="inline-block py-1.5 px-4 rounded-full bg-slate-100 text-slate-600 text-xs font-bold tracking-wider uppercase mb-2">
                            Simple Pricing
                        </span>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
                            Start for free. <span className="text-slate-400">Scale as you grow.</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
                            Transparent pricing designed for schools of all sizes. No hidden fees, no surprise charges.
                        </p>
                    </div>
                </div>

                {/* Pricing Component */}
                <div className="relative z-10">
                    <Pricing onSignUp={(plan) => navigate(`/signup?plan=${plan}`)} />
                </div>

                {/* FAQ Section */}
                <section className="py-24 bg-slate-50 border-t border-slate-100">
                    <div className="max-w-4xl mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-4">Frequently Asked Questions</h2>
                            <p className="text-slate-500">Everything you need to know about billing and subscriptions.</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {[
                                { q: "Can I upgrade my plan later?", a: "Yes, you can upgrade instantly. Billing is prorated for the remainder of the billing cycle." },
                                { q: "Is there a setup fee?", a: "No. There are no setup fees, maintenance fees, or hidden charges." },
                                { q: "Do you offer training?", a: "Yes, all plans include access to video tutorials, documentation, and priority support." },
                                { q: "How secure is my data?", a: "We use bank-grade encryption and daily backups to ensure your data is always safe." }
                            ].map((faq, i) => (
                                <div key={i} className="flex gap-4 items-start">
                                    <div className="shrink-0 mt-1">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <HelpCircle size={14} />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-slate-900 mb-2">{faq.q}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <PublicFooter />
        </div>
    );
};

export default PricingPage;
