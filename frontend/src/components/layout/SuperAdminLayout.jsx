import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SuperAdminSidebar from './SuperAdminSidebar';
import { Menu, X } from 'lucide-react';

const SuperAdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row">
            {/* Mobile Header */}
            <header className="lg:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-black text-xs">HC</span>
                    </div>
                    <span className="font-black text-white text-sm tracking-tight text-[10px] uppercase">Hyperion Core</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* Sidebar with mobile overlay */}
            <div className={`
                fixed inset-y-0 left-0 z-50 transition-all duration-300 lg:translate-x-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                {/* Overlay backdrop for mobile */}
                <div
                    className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    onClick={() => setIsSidebarOpen(false)}
                />
                <SuperAdminSidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            {/* Scrollable Main Content */}
            <main className="flex-1 lg:ml-72 p-4 lg:p-8 min-h-screen relative overflow-x-hidden">
                {/* Ambient background glows */}
                <div className="fixed top-0 right-0 w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-primary-600/5 rounded-full blur-[80px] lg:blur-[120px] -z-0 pointer-events-none"></div>
                <div className="fixed bottom-0 left-0 lg:left-72 w-[300px] lg:w-[500px] h-[300px] lg:h-[500px] bg-rose-600/5 rounded-full blur-[80px] lg:blur-[120px] -z-0 pointer-events-none"></div>

                <div className="relative z-10 max-w-full lg:max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default SuperAdminLayout;
