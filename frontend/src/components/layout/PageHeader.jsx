import React from 'react';
import { motion } from 'framer-motion';

const PageHeader = ({ title, subtitle, icon, gradient = "from-primary-600 to-primary-700" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-r ${gradient} rounded-3xl p-8 text-white shadow-xl relative overflow-hidden`}
        >
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-3xl -ml-10 -mb-10"></div>

            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                    {icon && (
                        <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl shadow-inner border border-white/30">
                            {icon}
                        </div>
                    )}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2">
                            {title}
                        </h1>
                        {subtitle && (
                            <p className="text-white/80 font-medium text-sm md:text-base max-w-xl leading-relaxed">
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>

                <div className="hidden md:block">
                    <div className="px-4 py-2 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 text-xs font-bold uppercase tracking-widest">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default PageHeader;
