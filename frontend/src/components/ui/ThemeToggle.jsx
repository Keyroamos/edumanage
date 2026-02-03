import React, { useState, useEffect } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeToggle = ({ className = '', collapsed = false }) => {
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else if (theme === 'auto') {
            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const cycleTheme = () => {
        if (theme === 'light') setTheme('dark');
        else if (theme === 'dark') setTheme('auto');
        else setTheme('light');
    };

    const getIcon = () => {
        if (theme === 'light') return Sun;
        if (theme === 'dark') return Moon;
        return Monitor;
    };

    const Icon = getIcon();

    return (
        <button
            onClick={cycleTheme}
            className={`
                relative flex items-center justify-center p-2 rounded-lg transition-all duration-200
                hover:bg-slate-100 dark:hover:bg-slate-800
                text-slate-500 dark:text-slate-400
                hover:text-amber-500 dark:hover:text-amber-400
                ${className}
            `}
            title={`Current theme: ${theme}`}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={theme}
                    initial={{ y: -10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 10, opacity: 0 }}
                    transition={{ duration: 0.1 }}
                >
                    <Icon size={18} />
                </motion.div>
            </AnimatePresence>
            {!collapsed && (
                <span className="ml-3 text-sm font-medium capitalize lg:hidden">{theme} Mode</span>
            )}
        </button>
    );
};

export default ThemeToggle;
