import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Bell, Search, ChevronDown, User as UserIcon, BookOpen, GraduationCap } from 'lucide-react';
import axios from 'axios';
import { useSchool } from '../../context/SchoolContext';
import TrialExpiredOverlay from '../TrialExpiredOverlay';

const DashboardLayout = () => {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { isLocked } = useSchool();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const expired = isLocked();
    const isSubscriptionPage = location.pathname === '/subscription';

    // Safety check - if no user, might redirect, but ProtectedLayout usually handles this.
    // However, if user is null/empty object, we handle it gracefully in Sidebar display.

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Search functionality
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                try {
                    const response = await axios.get('/api/search/', {
                        params: { q: searchQuery }
                    });
                    setSearchResults(response.data.results || []);
                    setShowResults(true);
                } catch (error) {
                    console.error('Search error:', error);
                }
            } else {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Close search results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleResultClick = (url) => {
        navigate(url);
        setShowResults(false);
        setSearchQuery('');
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'student': return <UserIcon size={16} className="text-blue-500 dark:text-blue-400" />;
            case 'teacher': return <GraduationCap size={16} className="text-green-500 dark:text-green-400" />;
            case 'staff': return <UserIcon size={16} className="text-indigo-500 dark:text-indigo-400" />;
            case 'subject': return <BookOpen size={16} className="text-violet-500 dark:text-violet-400" />;
            default: return <UserIcon size={16} className="text-slate-500 dark:text-slate-400" />;
        }
    };

    const getTypeBadge = (type) => {
        const badges = {
            student: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
            teacher: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400',
            staff: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400',
            subject: 'bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-400'
        };
        return badges[type] || 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden transition-colors duration-200">
            {expired && !isSubscriptionPage && <TrialExpiredOverlay />}
            <Sidebar
                isOpen={isSidebarOpen}
                onClose={() => setSidebarOpen(false)}
                user={user}
                onLogout={handleLogout}
            />

            <div className="flex-1 flex flex-col h-screen overflow-hidden relative ml-0 lg:ml-72">
                {/* Global Header */}
                <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 px-6 py-3 flex justify-between items-center h-16 transition-colors duration-200">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 transition-colors"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                    </div>

                    <div className="flex items-center space-x-3 md:space-x-6">
                        {/* Search Bar with Results Dropdown */}
                        <div className="hidden md:flex relative" ref={searchRef}>
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none z-10" />
                            <input
                                type="text"
                                placeholder="Search students, teachers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => searchResults?.length > 0 && setShowResults(true)}
                                className="pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/50 focus:border-primary-300 dark:focus:border-primary-700 rounded-xl text-sm transition-all w-64 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500"
                            />

                            {/* Search Results Dropdown */}
                            {showResults && searchResults?.length > 0 && (
                                <div className="absolute top-full mt-2 w-96 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
                                    <div className="p-2 max-h-96 overflow-y-auto custom-scrollbar">
                                        {searchResults.map((result, idx) => (
                                            <button
                                                key={`${result.type}-${result.id}`}
                                                onClick={() => handleResultClick(result.url)}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
                                            >
                                                {result.avatar ? (
                                                    <img
                                                        src={result.avatar}
                                                        alt={result.title}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                                                        {getTypeIcon(result.type)}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium text-slate-900 dark:text-white text-sm truncate">{result.title}</p>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeBadge(result.type)}`}>
                                                            {result.type}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{result.subtitle}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Notifications */}
                        <button className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border-2 border-white dark:border-slate-900"></span>
                        </button>

                        {/* User Menu Trigger */}
                        <div className="hidden md:flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 rounded-xl transition-colors">
                            <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold border border-primary-200 dark:border-primary-800">
                                {user.first_name?.[0]}
                            </div>
                            <ChevronDown size={16} className="text-slate-400 dark:text-slate-500" />
                        </div>
                    </div>
                </header>

                {/* Main Content Scroll Area */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 dark:bg-slate-900 scroll-smooth">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
