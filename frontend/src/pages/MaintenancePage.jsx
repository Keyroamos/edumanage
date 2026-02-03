import React from 'react';
import { Hammer, AlertTriangle } from 'lucide-react';

const MaintenancePage = () => {
    return (
        <div className="min-h-screen bg-slate-950 flex shadow-inner items-center justify-center p-6 sm:p-12 relative overflow-hidden">
            {/* Ambient background glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-2xl w-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-12 rounded-[3rem] text-center shadow-2xl relative z-10 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl flex items-center justify-center shadow-lg shadow-orange-500/20 mx-auto mb-10 rotate-3">
                    <Hammer className="text-white animate-bounce" size={48} />
                </div>

                <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-6 leading-tight">
                    SYSTEM UNDER <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400 underline decoration-orange-500/30">MAINTENANCE.</span>
                </h1>

                <p className="text-slate-400 text-lg sm:text-xl font-medium mb-10 leading-relaxed max-w-md mx-auto">
                    We're currently performing some critical system updates to enhance your experience.
                    Master Control remains operational for technical staff.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                    <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center">
                        <span className="text-amber-500 font-black text-2xl mb-1">Expected Up</span>
                        <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">~ 15 Minutes</span>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-2xl flex flex-col items-center">
                        <span className="text-primary-500 font-black text-2xl mb-1">Status</span>
                        <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">Optimizing DB</span>
                    </div>
                </div>

                <div className="flex items-center justify-center gap-3 text-slate-500 bg-slate-950/30 py-4 rounded-2xl border border-slate-800/50">
                    <AlertTriangle size={18} className="text-amber-500" />
                    <span className="text-sm font-bold tracking-wide">Regular portal access is temporarily suspended.</span>
                </div>
            </div>
        </div>
    );
};

export default MaintenancePage;
