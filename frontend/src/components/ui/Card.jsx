import React from 'react';

const Card = ({ children, className = '', hover = false }) => {
    return (
        <div className={`
            bg-white dark:bg-slate-900 
            rounded-3xl border border-slate-100 dark:border-slate-800/50 
            shadow-sm transition-all duration-300
            ${hover ? 'hover:shadow-xl hover:border-primary-500/30' : ''}
            ${className}
        `}>
            {children}
        </div>
    );
};

export default Card;
