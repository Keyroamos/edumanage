import React from 'react';
import { twMerge } from 'tailwind-merge';

const Input = React.forwardRef(({ className, icon: Icon, label, error, ...props }, ref) => {
    return (
        <div className="w-full space-y-2">
            {label && (
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-1 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    ref={ref}
                    className={twMerge(
                        'flex h-9.5 w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-primary-500 dark:focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/10 dark:focus:ring-primary-500/20 disabled:cursor-not-allowed disabled:opacity-50',
                        Icon && 'pl-10',
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
                        className
                    )}
                    {...props}
                />
            </div>
            {error && (
                <p className="text-sm text-red-500 ml-1 animate-in slide-in-from-top-1 fade-in">
                    {error}
                </p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
