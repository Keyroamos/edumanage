import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const SchoolContext = createContext();

export const SchoolProvider = ({ children }) => {
    const [config, setConfig] = useState(() => {
        const cached = localStorage.getItem('school_config');
        return cached ? JSON.parse(cached) : {
            school_name: 'EduManage',
            school_code: 'EDU',
            school_email: '',
            school_phone: '',
            school_address: '',
            school_logo: null,
        };
    });
    const [loading, setLoading] = useState(true);

    const fetchConfig = useCallback(async () => {
        try {
            const response = await axios.get('/api/config/');
            // Handle both nested (response.data.config) and direct (response.data) formats
            const data = response.data.config || response.data;
            setConfig(data);
            localStorage.setItem('school_config', JSON.stringify(data));
        } catch (error) {
            console.error('Error fetching school config:', error);
            // Don't clear config on failure (might be 401), keep cached version
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch on mount
    useEffect(() => {
        fetchConfig();
    }, [fetchConfig]);

    // Listens for login events to refresh config
    useEffect(() => {
        const handleLogin = () => fetchConfig();
        window.addEventListener('login', handleLogin);
        return () => window.removeEventListener('login', handleLogin);
    }, [fetchConfig]);

    const updateConfig = (newConfig) => {
        setConfig(prev => {
            const updated = { ...prev, ...newConfig };
            // If newConfig has school_logo, and it's a URL, update it
            if (newConfig.school_logo) {
                updated.school_logo = newConfig.school_logo;
            }
            localStorage.setItem('school_config', JSON.stringify(updated));
            return updated;
        });
    };

    const hasFeature = useCallback((feature) => {
        if (!config || !config.subscription) return false;

        const plan = config.subscription.plan || 'Basic';

        const featureMap = {
            'STUDENT_MANAGEMENT': ['Basic', 'Standard', 'Enterprise', 'Trial'],
            'ACADEMIC_MANAGEMENT': ['Basic', 'Standard', 'Enterprise', 'Trial'],
            'ATTENDANCE': ['Basic', 'Standard', 'Enterprise', 'Trial'],
            'SCHEDULE': ['Basic', 'Standard', 'Enterprise', 'Trial'],
            'FINANCE_MANAGEMENT': ['Basic', 'Standard', 'Enterprise', 'Trial'],
            'HR_MANAGEMENT': ['Standard', 'Enterprise', 'Trial'],
            'COMMUNICATION': ['Enterprise', 'Trial'],
            'TRANSPORT_MANAGEMENT': ['Enterprise', 'Trial'],
            'FOOD_MANAGEMENT': ['Enterprise', 'Trial'],
        };

        return featureMap[feature]?.includes(plan) || false;
    }, [config]);

    const isLocked = useCallback(() => {
        if (!config || !config.subscription) return false;

        // If they have an active subscription, Not locked
        if (config.subscription.status === 'Active') return false;

        // If status is Trial, check the date
        if (config.subscription.status === 'Trial') {
            const trialEnd = new Date(config.subscription.trial_end);
            return new Date() > trialEnd;
        }

        // If status is Expired, it's locked
        if (config.subscription.status === 'Expired') return true;

        return false;
    }, [config]);

    return (
        <SchoolContext.Provider value={{ config, fetchConfig, updateConfig, hasFeature, isLocked, loading }}>
            {children}
        </SchoolContext.Provider>
    );
};

export const useSchool = () => {
    const context = useContext(SchoolContext);
    if (!context) {
        throw new Error('useSchool must be used within a SchoolProvider');
    }
    return context;
};
