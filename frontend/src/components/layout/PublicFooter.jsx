import React from 'react';
import { BookOpen, Twitter, Linkedin, Facebook, Instagram, Send, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import Button from '../ui/Button';

const PublicFooter = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 pt-20 pb-10 border-t border-slate-800">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 lg:gap-8 mb-16">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2 text-white">
                            <div className="bg-gradient-to-br from-blue-600 to-violet-600 p-2 rounded-xl shadow-lg shadow-blue-900/20">
                                <BookOpen size={24} className="text-white" />
                            </div>
                            <span className="text-2xl font-black tracking-tight">EduManage</span>
                        </div>
                        <p className="text-slate-400 text-base leading-relaxed max-w-sm">
                            The complete operating system for modern schools using the new curriculum. Simple, powerful, and affordable.
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Facebook, Linkedin, Instagram].map((Icon, i) => (
                                <a key={i} href="#" className="p-2 bg-slate-800 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 group">
                                    <Icon size={18} className="group-hover:scale-110 transition-transform" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-1">
                        <h4 className="text-white font-bold mb-6 text-lg">Product</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/#features" className="hover:text-blue-400 transition-colors block">Features</Link></li>
                            <li><Link to="/pricing" className="hover:text-blue-400 transition-colors block">Pricing</Link></li>
                            <li><Link to="/#school-os" className="hover:text-blue-400 transition-colors block">School OS</Link></li>
                            <li><Link to="/#roadmap" className="hover:text-blue-400 transition-colors block">Roadmap</Link></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-1">
                        <h4 className="text-white font-bold mb-6 text-lg">Resources</h4>
                        <ul className="space-y-4 text-sm">
                            <li><a href="#" className="hover:text-blue-400 transition-colors block">Documentation</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors block">Help Center</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors block">Blog</a></li>
                            <li><a href="#" className="hover:text-blue-400 transition-colors block">Community</a></li>
                        </ul>
                    </div>

                    <div className="lg:col-span-1">
                        <h4 className="text-white font-bold mb-6 text-lg">Legal</h4>
                        <ul className="space-y-4 text-sm">
                            <li><Link to="/legal/privacy" className="hover:text-blue-400 transition-colors block">Privacy Policy</Link></li>
                            <li><Link to="/legal/terms" className="hover:text-blue-400 transition-colors block">Terms of Service</Link></li>
                            <li><Link to="/legal/cookies" className="hover:text-blue-400 transition-colors block">Cookie Policy</Link></li>
                            <li><Link to="/legal/security" className="hover:text-blue-400 transition-colors block">Security</Link></li>
                        </ul>
                    </div>

                    {/* Newsletter / CTA Column */}
                    <div className="lg:col-span-1">
                        <h4 className="text-white font-bold mb-6 text-lg">Stay Updated</h4>
                        <div className="space-y-4">
                            <p className="text-xs text-slate-500">Get the latest updates and resources delivered to your inbox.</p>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="Enter email"
                                    className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600"
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-500 transition-colors">
                                    <Send size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
                    <p>© 2026 EduManage Inc. All rights reserved.</p>
                    <div className="flex items-center gap-2 bg-slate-800/50 px-3 py-1.5 rounded-full border border-slate-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        <span className="text-xs font-medium text-slate-400">All Systems Operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default PublicFooter;
