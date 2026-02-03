import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users, Shield, Zap, TrendingUp, CheckCircle2, ChevronRight,
    BookOpen, Calculator, Calendar, MessageSquare, Truck, BarChart3,
    ArrowRight, Globe, Layers, Smartphone, Play, Star
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import PublicNavbar from '../components/layout/PublicNavbar';
import PublicFooter from '../components/layout/PublicFooter';

// Image Imports
import heroImg from '../assets/images/hero.png';
import dashboardImg from '../assets/images/dashboard.png';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        {
            title: 'Complete Student Management',
            description: 'From admission to alumni. Track performance, attendance, and discipline in one secure profile.',
            icon: Users,
            color: 'blue'
        },
        {
            title: 'Automated Finance & Billing',
            description: 'Effortless fee collection with M-Pesa integration, automated invoices, and real-time financial tracking.',
            icon: Calculator,
            color: 'green'
        },
        {
            title: 'Staff HR & Payroll',
            description: 'Streamline teacher management, leave requests, and payroll processing in a few clicks.',
            icon: Shield,
            color: 'purple'
        },
        {
            title: 'Advanced Academics',
            description: 'CBC-compliant grading, automated report cards, and deep performance analytics.',
            icon: BarChart3,
            color: 'orange'
        },
        {
            title: 'Transport Logistics',
            description: 'Real-time fleet management, route optimization, and parent notifications.',
            icon: Truck,
            color: 'indigo'
        },
        {
            title: 'Instant Communication',
            description: 'Keep parents in the loop with bulk SMS, email alerts, and a dedicated parent portal.',
            icon: MessageSquare,
            color: 'rose'
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
            <PublicNavbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-6 overflow-hidden">
                <div className="max-w-4xl mx-auto text-center relative z-10">

                    {/* Pill Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 mb-8 bg-slate-50 border border-slate-200 rounded-full px-4 py-1.5 shadow-sm hover:bg-slate-100 transition-colors cursor-pointer group"
                    >
                        <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900">Introducing Advanced Analytics 2.0</span>
                        <ArrowRight size={12} className="text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
                    </motion.div>

                    {/* Main Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.15] mb-6"
                    >
                        Manage your school. <br className="hidden md:block" />
                        Anywhere. Anytime.
                    </motion.h1>

                    {/* Subheadline */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-normal"
                    >
                        Stay connected with your students, staff, and parents globally using EduManage's unified platform. Automate finance, track performance, and simplify operations.
                    </motion.p>

                    {/* Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4"
                    >
                        <Button
                            size="lg"
                            onClick={() => navigate('/pricing')}
                            className="bg-slate-900 text-white hover:bg-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all w-full sm:w-auto px-8 h-12 rounded-lg font-semibold text-base"
                        >
                            Get Started
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}
                            className="border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 w-full sm:w-auto px-8 h-12 rounded-lg font-semibold text-base flex items-center gap-2"
                        >
                            <Play size={16} fill="currentColor" className="text-slate-400" />
                            Book a Demo
                        </Button>
                    </motion.div>

                    {/* Trust Indicators (Optional) */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.6 }}
                        className="mt-16 pt-8 border-t border-slate-100 flex flex-col items-center gap-4"
                    >
                        <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Trusted by 500+ schools worldwide</p>
                        <div className="flex -space-x-2">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" />
                                </div>
                            ))}
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                +500
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Dashboard Preview Removed */}

            {/* Features Grid (Minimal) */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">Everything you need. <span className="text-slate-400">Nothing you don't.</span></h2>
                        <p className="text-lg text-slate-500 leading-relaxed">
                            A complete operating system designed to make your school generic, predictable, and scalable.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:border-slate-200 transition-all duration-300"
                            >
                                <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-6 bg-white border border-slate-100 shadow-sm text-slate-700 group-hover:text-blue-600 transition-colors`}>
                                    <feature.icon size={24} strokeWidth={2} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed text-sm">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Feature Showcase Section - Cleaner */}
            <section className="py-24 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto px-6 space-y-32">
                    {/* Item 1 */}
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 relative p-8 bg-slate-50 rounded-3xl border border-slate-100">
                            <img src={dashboardImg} alt="Finance Dashboard" className="relative rounded-xl shadow-lg border border-slate-200" />
                        </div>
                        <div className="space-y-6 order-1 lg:order-2">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-bold border border-green-100 uppercase tracking-widest">
                                Finance
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Financial clarity for your institution.</h2>
                            <p className="text-lg text-slate-500 leading-relaxed">
                                Track every cent that comes in and goes out. From fee collection to expense tracking, payroll, and asset management.
                            </p>
                            <div className="pt-4 grid grid-cols-2 gap-4">
                                {['Fee Reminders', 'M-Pesa Integration', 'Expense Approvals', 'Real-time Reports'].map((item, i) => (
                                    <div key={i} className="flex items-center gap-2 text-slate-700 font-medium text-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        {item}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Item 2 */}
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-bold border border-purple-100 uppercase tracking-widest">
                                Academics
                            </div>
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">Empower teaching, simplify grading.</h2>
                            <p className="text-lg text-slate-500 leading-relaxed">
                                Give teachers the tools they need to focus on teaching, not paperwork. Track attendance, grading, and behavior in real-time.
                            </p>
                            <div className="pt-4">
                                <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50">
                                    Explore Academic Tools
                                </Button>
                            </div>
                        </div>
                        <div className="relative p-8 bg-slate-50 rounded-3xl border border-slate-100">
                            <img src={heroImg} alt="Academic Tools" className="relative rounded-xl shadow-lg border border-slate-200" />
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section - Minimal */}
            <section className="py-24 px-6 bg-slate-900 border-t border-slate-800">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">Ready to modernize your school?</h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Join hundreds of forward-thinking schools that trust EduManage. Start your free 14-day trial today, no credit card required.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button size="lg" onClick={() => navigate('/pricing')} className="bg-white text-slate-900 hover:bg-slate-100 h-12 px-8 font-semibold text-base border-transparent">
                            Get Started Now
                        </Button>
                    </div>
                </div>
            </section>

            <PublicFooter />
        </div>
    );
};

export default LandingPage;
