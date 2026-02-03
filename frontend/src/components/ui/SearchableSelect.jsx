import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';

const SearchableSelect = ({
    options,
    value,
    onChange,
    placeholder = "Select option...",
    searchPlaceholder = "Search...",
    className = ""
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const dropdownRef = useRef(null);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium cursor-pointer flex items-center justify-between"
            >
                <span className={!selectedOption ? "text-slate-400" : ""}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={18} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="p-2 border-b border-slate-50 dark:border-slate-800 flex items-center gap-2">
                        <Search size={16} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 text-sm py-1 text-slate-900 dark:text-white"
                            autoFocus
                        />
                    </div>
                    <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option.value}
                                    onClick={() => {
                                        onChange(option.value);
                                        setIsOpen(false);
                                        setSearchQuery("");
                                    }}
                                    className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${value === option.value
                                            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <span>{option.label}</span>
                                    {value === option.value && <Check size={14} />}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-xs text-slate-500">
                                No results found
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SearchableSelect;
