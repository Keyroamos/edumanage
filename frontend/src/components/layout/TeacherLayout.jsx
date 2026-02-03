import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Menu, Moon, Sun } from 'lucide-react';
import TeacherSidebar from './TeacherSidebar';
import { useSchool } from '../../context/SchoolContext';
import TrialExpiredOverlay from '../TrialExpiredOverlay';

const TeacherLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();

    // Get user from local storage
    const userString = localStorage.getItem('user');
    const user = userString ? JSON.parse(userString) : null;
    const { isLocked } = useSchool();
    const expired = isLocked();

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        navigate('/teacher-login');
    };

    const toggleTheme = () => {
        const currentTheme = localStorage.getItem('theme') || 'dark';
        if (currentTheme === 'dark') {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        } else {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        }
    }

    if (!user) {
        // Fallback if no user is found/logged out
        return <Outlet />;
    }

    // We assume the stored user object has the structure we need, specifically { id: ..., first_name: ..., last_name: ... }
    // The "id" here should ideally be the TEACHER ID. If the login response returns a user ID and a teacher ID, we need to ensure we use the right one.
    // Based on previous login logic, we redirect to /teacher/:id using `user.teacher.pk`.
    // Let's assume the context or local storage might need the teacher details. 
    // However, for the sidebar, we might need to rely on the URL param or just the stored user data. 
    // Since TeacherDashboard uses useParams() to get ID, we can assume layouts wrap routes where we can access context or just pass the user.
    // But typically the Sidebar needs the ID to build links.
    // *Important*: `user` object in localStorage needs to have the correct ID for links to work. 
    // If the logged in user is associated with a teacher, we should use that. 

    // For now, we will pass the "user" object to the Sidebar. 
    // The Sidebar uses `user.id`. We must ensure that map correctly. 

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">
            {expired && <TrialExpiredOverlay />}
            <TeacherSidebar
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                user={user}
                onLogout={handleLogout}
            />

            <div className="flex-1 flex flex-col min-w-0">
                {/* Mobile Header */}
                <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 lg:hidden p-4 flex items-center justify-between z-30">
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-500">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-slate-900 dark:text-white">Teacher Portal</span>
                    <div className="w-8"></div> {/* Spacer for balance */}
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar relative">
                    {/* Theme Toggle - Floating or Top Right */}
                    <div className="absolute top-4 right-4 z-40 hidden lg:block">
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 shadow-sm transition-colors"
                        >
                            <span className="dark:hidden"><Moon size={20} /></span>
                            <span className="hidden dark:inline"><Sun size={20} /></span>
                        </button>
                    </div>

                    <div className="max-w-7xl mx-auto h-full">
                        <Outlet context={{ user }} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TeacherLayout;
