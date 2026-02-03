import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AppStatusContext = createContext();

export const AppStatusProvider = ({ children }) => {
    const [status, setStatus] = useState({
        maintenance_mode: false,
        registration_open: true,
        basic_price: 1499,
        standard_price: 2499,
        enterprise_price: 3499,
        currency: 'KES',
        loading: true
    });

    useEffect(() => {
        fetchStatus();
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await axios.get('/api/app-status/');
            setStatus({
                ...response.data,
                loading: false
            });
        } catch (error) {
            console.error('Error fetching app status:', error);
            setStatus(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <AppStatusContext.Provider value={{ ...status, refreshStatus: fetchStatus }}>
            {children}
        </AppStatusContext.Provider>
    );
};

export const useAppStatus = () => useContext(AppStatusContext);
