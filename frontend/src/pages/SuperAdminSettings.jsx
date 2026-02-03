import React, { useState, useEffect } from 'react';
import {
    Settings, Shield, Database, Bell, CreditCard,
    ToggleLeft, ToggleRight, Save, RefreshCw,
    Lock, Globe, Cloud, Smartphone, Mail
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAppStatus } from '../context/AppStatusContext';

const SuperAdminSettings = () => {
    const { refreshStatus } = useAppStatus();
    const [settings, setSettings] = useState({
        system: {
            maintenance_mode: false,
            registration_open: true,
            debug_mode: false,
            allow_api_access: true
        },
        pricing: {
            currency: 'KES',
            basic_price: 2999,
            standard_price: 5999,
            enterprise_price: 14999,
            trial_days: 14
        },
        communication: {
            sms_gateway: 'AfricasTalking',
            sms_active: true,
            email_active: true,
            push_notifications: false
        },
        security: {
            force_2fa_admins: false,
            session_timeout: 60, // minutes
            password_policy: 'strong'
        }
    });

    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('system');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('/api/super-portal/settings/');
            setSettings(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load system settings');
            setLoading(false);
        }
    };

    const handleToggle = (category, key) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: !prev[category][key]
            }
        }));
    };

    const handleChange = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    const handleSave = async () => {
        const toastId = toast.loading('Updating global configurations...');
        try {
            await axios.post('/api/super-portal/settings/', settings);
            await refreshStatus();
            toast.success('System settings updated successfully', { id: toastId });
        } catch (error) {
            console.error('Error saving settings:', error);
            toast.error('Failed to update settings', { id: toastId });
        }
    };

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-3 w-full p-4 rounded-xl transition-all font-bold text-sm text-left ${activeTab === id
                ? 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg shadow-primary-500/20'
                : 'bg-transparent text-slate-500 hover:bg-white/[0.03] hover:text-slate-300'
                }`}
        >
            <Icon size={18} />
            <span>{label}</span>
        </button>
    );

    const Toggle = ({ checked, onChange }) => (
        <button
            onClick={onChange}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${checked ? 'bg-primary-500' : 'bg-slate-700'
                }`}
        >
            <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'
                }`}></div>
        </button>
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[500px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">GLOBAL SETTINGS</h1>
                    <p className="text-slate-500 font-medium text-sm lg:text-base">
                        Configure system-wide parameters and operational modes
                    </p>
                </div>

                <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-wider hover:bg-slate-200 transition-colors shadow-xl shadow-white/5 active:scale-95"
                >
                    <Save size={18} />
                    <span>Save Changes</span>
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1 space-y-2">
                    <TabButton id="system" label="System Control" icon={Settings} />
                    <TabButton id="pricing" label="Pricing & Plans" icon={CreditCard} />
                    <TabButton id="communication" label="Communication" icon={Bell} />
                    <TabButton id="security" label="Security & Access" icon={Shield} />
                    <TabButton id="database" label="Database Config" icon={Database} />
                </div>

                {/* Content Area */}
                <div className="lg:col-span-3">
                    <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] p-8 min-h-[500px]">

                        {/* System Settings */}
                        {activeTab === 'system' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                        <Globe className="text-primary-500" /> Platform Status
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                                            <div>
                                                <h4 className="font-bold text-white">Maintenance Mode</h4>
                                                <p className="text-xs text-slate-500 mt-1">If enabled, the platform will be inaccessible to all non-admin users.</p>
                                            </div>
                                            <Toggle
                                                checked={settings.system.maintenance_mode}
                                                onChange={() => handleToggle('system', 'maintenance_mode')}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                                            <div>
                                                <h4 className="font-bold text-white">School Registration</h4>
                                                <p className="text-xs text-slate-500 mt-1">Allow new schools to sign up and create accounts.</p>
                                            </div>
                                            <Toggle
                                                checked={settings.system.registration_open}
                                                onChange={() => handleToggle('system', 'registration_open')}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                        <Cloud className="text-primary-500" /> Advanced Operations
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                                            <div>
                                                <h4 className="font-bold text-white">Debug Mode</h4>
                                                <p className="text-xs text-slate-500 mt-1">Show detailed error traces in frontend application.</p>
                                            </div>
                                            <Toggle
                                                checked={settings.system.debug_mode}
                                                onChange={() => handleToggle('system', 'debug_mode')}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pricing Settings */}
                        {activeTab === 'pricing' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                    <CreditCard className="text-primary-500" /> Subscription Models
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-2">Base Currency</label>
                                        <select
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm font-bold focus:ring-2 focus:ring-primary-500/50 outline-none"
                                            value={settings.pricing.currency}
                                            onChange={(e) => handleChange('pricing', 'currency', e.target.value)}
                                        >
                                            <option value="KES">KES (Kenyan Shilling)</option>
                                            <option value="USD">USD (US Dollar)</option>
                                            <option value="NGN">NGN (Nigerian Naira)</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-2">Trial Duration (Days)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm font-bold focus:ring-2 focus:ring-primary-500/50 outline-none"
                                            value={settings.pricing.trial_days}
                                            onChange={(e) => handleChange('pricing', 'trial_days', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {['basic', 'standard', 'enterprise'].map((plan) => (
                                        <div key={plan} className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                                            <div>
                                                <h4 className="font-bold text-white capitalize">{plan} Plan</h4>
                                                <p className="text-xs text-slate-500 mt-1">Monthly billing amount</p>
                                            </div>
                                            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2">
                                                <span className="text-xs font-bold text-slate-500">{settings.pricing.currency}</span>
                                                <input
                                                    type="number"
                                                    className="w-24 bg-transparent text-white font-bold text-right outline-none"
                                                    value={settings.pricing[`${plan}_price`]}
                                                    onChange={(e) => handleChange('pricing', `${plan}_price`, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Communication Settings */}
                        {activeTab === 'communication' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div>
                                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                        <Smartphone className="text-primary-500" /> SMS Gateways
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h4 className="font-bold text-white">SMS Service</h4>
                                                <Toggle
                                                    checked={settings.communication.sms_active}
                                                    onChange={() => handleToggle('communication', 'sms_active')}
                                                />
                                            </div>
                                            {settings.communication.sms_active && (
                                                <div className="pt-4 border-t border-slate-800/50">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-2 mb-2 block">Provider</label>
                                                    <select
                                                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-white text-sm font-bold focus:ring-2 focus:ring-primary-500/50 outline-none"
                                                        value={settings.communication.sms_gateway}
                                                        onChange={(e) => handleChange('communication', 'sms_gateway', e.target.value)}
                                                    >
                                                        <option value="AfricasTalking">Africa's Talking (Default)</option>
                                                        <option value="Twilio">Twilio</option>
                                                        <option value="Vonage">Vonage</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                        <Mail className="text-primary-500" /> Email Services
                                    </h3>
                                    <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 flex justify-between items-center">
                                        <div>
                                            <h4 className="font-bold text-white">System Emails</h4>
                                            <p className="text-xs text-slate-500 mt-1">Send welcome emails and alerts</p>
                                        </div>
                                        <Toggle
                                            checked={settings.communication.email_active}
                                            onChange={() => handleToggle('communication', 'email_active')}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Settings */}
                        {activeTab === 'security' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <h3 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                                    <Lock className="text-primary-500" /> Access Control
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-2xl border border-slate-800">
                                        <div>
                                            <h4 className="font-bold text-white">Enforce 2FA for Admins</h4>
                                            <p className="text-xs text-slate-500 mt-1">Require two-factor authentication for school admins.</p>
                                        </div>
                                        <Toggle
                                            checked={settings.security.force_2fa_admins}
                                            onChange={() => handleToggle('security', 'force_2fa_admins')}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-2">Session Timeout (Minutes)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white text-sm font-bold focus:ring-2 focus:ring-primary-500/50 outline-none"
                                            value={settings.security.session_timeout}
                                            onChange={(e) => handleChange('security', 'session_timeout', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Placeholder for DB */}
                        {activeTab === 'database' && (
                            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-6">
                                    <Database className="text-slate-600" size={32} />
                                </div>
                                <h3 className="text-xl font-black text-white text-center">Managed Database</h3>
                                <p className="text-slate-500 text-center max-w-sm mt-2 mb-6">Database configuration is managed by the cloud provider. Direct modifications are restricted.</p>
                                <button className="px-6 py-3 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-700">Check Connections</button>
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SuperAdminSettings;
