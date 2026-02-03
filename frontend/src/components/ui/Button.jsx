import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const Button = React.forwardRef(({
    className,
    variant = 'primary',
    size = 'md',
    isLoading,
    children,
    ...props
}, ref) => {

    const variants = {
        primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30 border-transparent',
        secondary: 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700 shadow-sm',
        ghost: 'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent shadow-none',
        outline: 'bg-transparent text-primary-600 dark:text-primary-400 border-primary-600 dark:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10 shadow-none',
        destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/30 border-transparent',
    };

    const sizes = {
        sm: 'h-8 px-2.5 text-xs',
        md: 'h-9.5 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
    };

    return (
        <motion.button
            ref={ref}
            whileTap={{ scale: 0.98 }}
            className={twMerge(
                'inline-flex items-center justify-center rounded-xl font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none border',
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading}
            {...props}
        >
            {isLoading ? (
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            ) : null}
            {children}
        </motion.button>
    );
});

Button.displayName = 'Button';

export default Button;
