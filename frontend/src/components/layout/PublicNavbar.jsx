import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Menu, X, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';

const PublicNavbar = ({ darkMode = false, alwaysSolid = false }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        if (location.pathname !== '/') {
            navigate('/', { state: { scrollTo: id } });
        } else {
            const element = document.getElementById(id);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
        setIsMobileMenuOpen(false);
    };

    const isSolid = isScrolled || isMobileMenuOpen || alwaysSolid;

    return (
        <>
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isSolid
                    ? (darkMode ? 'bg-slate-900/90 backdrop-blur-md border-b border-slate-800' : 'bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm')
                    : 'bg-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    {/* Logo */}
                    <div
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => navigate('/')}
                    >
                        <div className="bg-primary-600 p-2 rounded-xl text-white shadow-lg shadow-primary-600/20">
                            <BookOpen size={24} />
                        </div>
                        <span className={`text-xl font-bold tracking-tight ${!isSolid && darkMode ? 'text-white' : (isSolid && darkMode ? 'text-white' : 'text-slate-900')}`}>
                            EduManage
                        </span>
                    </div>

                    {/* Desktop Navigation */}
                    <div className={`hidden md:flex items-center gap-8 text-sm font-medium ${!isSolid && darkMode ? 'text-slate-300' : (isSolid && darkMode ? 'text-slate-300' : 'text-slate-600')}`}>
                        <button onClick={() => scrollToSection('features')} className="hover:text-primary-600 transition-colors">Features</button>
                        <button onClick={() => navigate('/pricing')} className={`hover:text-primary-600 transition-colors ${location.pathname === '/pricing' ? 'text-primary-600 font-bold' : ''}`}>Pricing</button>
                        <button onClick={() => scrollToSection('about')} className="hover:text-primary-600 transition-colors">About</button>
                    </div>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <Button variant="ghost" onClick={() => navigate('/login')} className={`${!isSolid && darkMode ? 'text-white hover:text-white hover:bg-white/10' : (isSolid && darkMode ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:text-primary-600 hover:bg-slate-50')}`}>
                            Login
                        </Button>
                        <Button onClick={() => navigate('/pricing')} className="shadow-lg shadow-primary-600/30">
                            Get Started
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className={`md:hidden p-2 rounded-lg transition-colors ${!isSolid && darkMode ? 'text-white hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'}`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div className={`fixed inset-0 z-40 pt-24 px-6 md:hidden animate-in fade-in slide-in-from-top-10 duration-200 ${darkMode ? 'bg-slate-900 border-t border-slate-800' : 'bg-white'}`}>
                    <div className={`flex flex-col gap-6 text-lg font-medium ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                        <button
                            onClick={() => scrollToSection('features')}
                            className={`flex items-center justify-between p-4 rounded-xl ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                        >
                            Features <ChevronRight size={16} />
                        </button>
                        <button
                            onClick={() => { navigate('/pricing'); setIsMobileMenuOpen(false); }}
                            className={`flex items-center justify-between p-4 rounded-xl ${location.pathname === '/pricing'
                                ? (darkMode ? 'bg-primary-900/20 text-primary-400' : 'bg-primary-50 text-primary-600')
                                : (darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50')
                                }`}
                        >
                            Pricing <ChevronRight size={16} />
                        </button>
                        <div className={`h-px my-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
                        <Button variant="secondary" onClick={() => navigate('/login')} className={`w-full justify-center py-4 text-base ${darkMode ? 'bg-slate-800 text-white hover:bg-slate-700 border-none' : ''}`}>
                            Login
                        </Button>
                        <Button onClick={() => navigate('/pricing')} className="w-full justify-center py-4 text-base shadow-xl shadow-primary-600/20">
                            Get Started Free
                        </Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default PublicNavbar;
