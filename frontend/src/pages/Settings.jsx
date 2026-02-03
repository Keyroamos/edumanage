import React, { useState, useEffect } from 'react';
import {
    User, Lock, Bell, Globe, Palette, Database, Shield, Save, FileText, MapPin, Plus, Trash2, Camera, Building2, Link, Copy, RefreshCw, Key, UserPlus, Mail, CheckCircle
} from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useSchool } from '../context/SchoolContext';
import axios from 'axios';

const SettingsSection = ({ title, icon: Icon, children }) => (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Icon size={20} className="text-slate-600 dark:text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
        </div>
        <div className="p-6">
            {children}
        </div>
    </div>
);

const Settings = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const { fetchConfig: refreshGlobalConfig, updateConfig, hasFeature } = useSchool();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [configLoading, setConfigLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [formData, setFormData] = useState({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        current_password: '',
        new_password: '',
        confirm_password: '',
        // School config
        school_name: '',
        school_code: '',
        school_email: '',
        school_phone: '',
        school_address: '',
        admission_number_format: '',
        admission_counter: 0,
        school_logo: null,
        school_logo_preview: null,
        school_logo_file: null,
        portal_slug: '',
        teacher_portal_password: '',
        student_portal_password: '',
        accountant_portal_password: '',
        food_portal_password: '',
        transport_portal_password: '',
        driver_portal_password: '',
        admission_fee: 0
    });
    const [branches, setBranches] = useState([]);
    const [newBranch, setNewBranch] = useState({ name: '', address: '', phone: '' });

    const [portalUsers, setPortalUsers] = useState([]);
    const [portalUsersLoading, setPortalUsersLoading] = useState(false);
    const [newPortalUser, setNewPortalUser] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        position: 'ACCOUNTANT',
        national_id: '',
        date_of_birth: '1990-01-01'
    });

    const fetchPortalUsers = async () => {
        setPortalUsersLoading(true);
        try {
            const response = await axios.get('/api/hr/staff/');
            // Filter only specific roles for portal management
            const roles = ['ACCOUNTANT', 'FOOD_MANAGER', 'TRANSPORT_MANAGER'];
            const users = response.data.staff.filter(s => roles.includes(s.position));
            setPortalUsers(users);
        } catch (error) {
            console.error('Error fetching portal users:', error);
        } finally {
            setPortalUsersLoading(false);
        }
    };

    const handleCreatePortalUser = async () => {
        if (!newPortalUser.first_name || !newPortalUser.email || !newPortalUser.position) {
            setMessage({ type: 'error', text: 'Please fill in all required fields' });
            return;
        }

        setLoading(true);
        try {
            await axios.post('/api/hr/staff/create/', {
                ...newPortalUser,
                staff_type: 'SUPPORT',
                gender: 'M', // Default or add to form
                date_joined: new Date().toISOString().split('T')[0]
            });

            setMessage({ type: 'success', text: `${newPortalUser.position.replace('_', ' ')} user created successfully!` });
            setNewPortalUser({
                first_name: '',
                last_name: '',
                email: '',
                phone: '',
                position: 'ACCOUNTANT',
                national_id: '',
                date_of_birth: '1990-01-01'
            });
            fetchPortalUsers();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to create portal user' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const fetchBranches = async () => {
        try {
            const response = await axios.get('/api/branches/');
            setBranches(response.data.branches || []);
        } catch (error) {
            console.error('Error fetching branches:', error);
        }
    };

    const handleAddBranch = async () => {
        if (!newBranch.name) return;
        try {
            await axios.post('/api/branches/', newBranch);
            setNewBranch({ name: '', address: '', phone: '' });
            fetchBranches();
            setMessage({ type: 'success', text: 'Branch added successfully' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to add branch' });
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleDeleteBranch = async (id) => {
        if (!window.confirm('Are you sure you want to delete this branch?')) return;
        try {
            await axios.delete(`/ api / branches / ${id}/`);
            fetchBranches();
            setMessage({ type: 'success', text: 'Branch deleted successfully' });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Error deleting branch:', error);
            setMessage({ type: 'error', text: 'Failed to delete branch' });
            setTimeout(() => setMessage(null), 3000);
        }
    };

    useEffect(() => {
        if (activeTab === 'branches') {
            fetchBranches();
        } else if (activeTab === 'portal-users') {
            fetchPortalUsers();
        }
    }, [activeTab]);

    useEffect(() => {
        // Fetch school configuration
        const fetchConfig = async () => {
            setConfigLoading(true);
            try {
                const response = await axios.get('/api/config/');
                const config = response.data?.config || response.data || {};
                setFormData(prev => ({
                    ...prev,
                    school_name: config?.school_name || '',
                    school_code: config?.school_code || '',
                    school_email: config?.school_email || '',
                    school_phone: config?.school_phone || '',
                    school_address: config?.school_address || '',
                    admission_number_format: config?.admission_number_format || '',
                    admission_counter: config?.admission_counter || 0,
                    school_logo: config?.school_logo || null,
                    portal_slug: config?.portal_slug || '',
                    teacher_portal_password: config?.teacher_portal_password || '',
                    student_portal_password: config?.student_portal_password || '',
                    accountant_portal_password: config?.accountant_portal_password || '',
                    food_portal_password: config?.food_portal_password || '',
                    transport_portal_password: config?.transport_portal_password || '',
                    driver_portal_password: config?.driver_portal_password || '',
                    admission_fee: config?.admission_fee || 0,
                }));
            } catch (error) {
                console.error('Error fetching config:', error);
            } finally {
                setConfigLoading(false);
            }
        };
        fetchConfig();
    }, []);

    const handleChange = (e) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };

    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/auth/profile/update/', {
                first_name: formData.first_name,
                last_name: formData.last_name,
                email: formData.email
            });

            if (response.data.success) {
                // Update local storage user data
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const updatedUser = { ...currentUser, ...response.data.user };
                localStorage.setItem('user', JSON.stringify(updatedUser));

                setMessage({ type: 'success', text: 'Profile updated successfully!' });

                // If school name was updated via config sync, it might need a refresh
                await refreshGlobalConfig();
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to update profile' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleChangePassword = async () => {
        if (!formData.current_password || !formData.new_password) {
            setMessage({ type: 'error', text: 'Please fill in all password fields' });
            return;
        }

        if (formData.new_password !== formData.confirm_password) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/api/auth/password/change/', {
                current_password: formData.current_password,
                new_password: formData.new_password
            });

            if (response.data.success) {
                setMessage({ type: 'success', text: 'Password changed successfully!' });
                setFormData(prev => ({
                    ...prev,
                    current_password: '',
                    new_password: '',
                    confirm_password: ''
                }));
            }
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to change password' });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const handleSaveSchoolConfig = async () => {
        setLoading(true);
        try {
            const data = new FormData();
            data.append('school_name', formData.school_name);
            data.append('school_code', formData.school_code);
            data.append('school_email', formData.school_email);
            data.append('school_phone', formData.school_phone);
            data.append('school_address', formData.school_address);
            data.append('admission_number_format', formData.admission_number_format);
            data.append('admission_fee', formData.admission_fee);

            // Portal Passwords
            data.append('teacher_portal_password', formData.teacher_portal_password);
            data.append('student_portal_password', formData.student_portal_password);
            data.append('accountant_portal_password', formData.accountant_portal_password);
            data.append('food_portal_password', formData.food_portal_password);
            data.append('transport_portal_password', formData.transport_portal_password);
            data.append('driver_portal_password', formData.driver_portal_password);

            if (formData.school_logo_file) {
                data.append('school_logo', formData.school_logo_file);
            }

            const response = await axios.post('/api/config/update/', data);

            // Check for success and existence of config in any of the common keys
            const savedConfig = response.data?.config || response.data?.saved_data || response.data?.configuration;

            if (response.data?.success && savedConfig) {
                // 1. Update Global Context
                updateConfig(savedConfig);

                // 2. Update User in Local Storage if returned
                if (response.data.user) {
                    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                    const updatedUser = { ...currentUser, ...response.data.user };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                }

                // 3. Update Local State (formData)
                setFormData(prev => ({
                    ...prev,
                    ...(response.data.user ? {
                        first_name: response.data.user.first_name || prev.first_name,
                        last_name: response.data.user.last_name || prev.last_name,
                        email: response.data.user.email || prev.email,
                    } : {}),
                    school_name: savedConfig.school_name || '',
                    school_code: savedConfig.school_code || '',
                    school_email: savedConfig.school_email || '',
                    school_phone: savedConfig.school_phone || '',
                    school_address: savedConfig.school_address || '',
                    admission_number_format: savedConfig.admission_number_format || '',
                    admission_counter: savedConfig.admission_counter || 0,
                    school_logo: savedConfig.school_logo || null,
                    school_logo_preview: null,
                    school_logo_file: null,
                    admission_fee: savedConfig.admission_fee || 0
                }));

                setMessage({ type: 'success', text: 'Institutional settings saved successfully!' });
            } else {
                console.warn('Config save returned unusual data:', response.data);
                if (response.data?.success) {
                    await refreshGlobalConfig();
                    setMessage({ type: 'success', text: 'Institutional settings saved!' });
                } else {
                    const errorDetail = response.data?.error || response.data?.message || 'Sync failed';
                    setMessage({ type: 'error', text: `Settings saved but sync issue: ${errorDetail}` });
                }
            }

            setTimeout(() => setMessage(null), 5000);
        } catch (error) {
            console.error('Error saving config:', error);
            setMessage({ type: 'error', text: error.response?.data?.error || 'Server error while saving configuration' });
            setTimeout(() => setMessage(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const getAdmissionNumberPreview = () => {
        const format = formData.admission_number_format || '{SCHOOL_CODE}/{YEAR}/{COUNTER:04d}';
        const schoolCode = formData.school_code || 'EDU';
        const year = new Date().getFullYear();
        const counter = (formData.admission_counter || 0) + 1;

        let preview = format;
        preview = preview.replace('{SCHOOL_CODE}', schoolCode);
        preview = preview.replace('{YEAR}', year.toString());
        preview = preview.replace('{COUNTER:04d}', counter.toString().padStart(4, '0'));
        preview = preview.replace('{COUNTER:05d}', counter.toString().padStart(5, '0'));
        preview = preview.replace('{COUNTER:03d}', counter.toString().padStart(3, '0'));
        preview = preview.replace('{COUNTER}', counter.toString());
        preview = preview.replace('{GRADE}', 'Grade1');

        return preview;
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        // Only show branches for Enterprise
        ...(hasFeature('MULTI_BRANCH') ? [{ id: 'branches', label: 'Branches', icon: MapPin }] : []),
        // Only show portals for Standard or higher
        ...(hasFeature('FINANCE_MANAGEMENT') ? [
            { id: 'portals', label: 'Portal Access', icon: Link },
            { id: 'portal-passwords', label: 'Portal Passwords', icon: Key },
            { id: 'portal-users', label: 'Portal Users', icon: UserPlus }
        ] : []),
        { id: 'admission', label: 'Admission', icon: FileText },
        { id: 'system', label: 'System', icon: Database }
    ];

    return (
        <div className="p-4 max-w-7xl mx-auto space-y-4">
            {/* Header */}
            <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase mb-0.5">Settings</h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">Manage your account and application preferences</p>
            </div>

            {/* Success/Error Message */}
            {message && (
                <div className={`p-4 rounded-xl ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Tabs */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-2">
                <div className="flex gap-2 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Profile Settings */}
            {activeTab === 'profile' && (
                <div className="space-y-6">
                    <SettingsSection title="Profile Information" icon={User}>
                        <div className="space-y-4">
                            <div className="flex items-center gap-6 mb-6">
                                <div className="h-20 w-20 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-2xl">
                                    {(user.first_name?.[0] || 'U')}{(user.last_name?.[0] || '')}
                                </div>
                                <div>
                                    <Button variant="secondary" size="sm">Change Photo</Button>
                                    <p className="text-xs text-slate-500 mt-2">JPG, PNG or GIF. Max size 2MB</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Input
                                    label="First Name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Last Name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                />
                            </div>

                            <Input
                                type="email"
                                label="Email Address"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                            />

                            <div className="flex justify-end pt-4">
                                <Button onClick={handleSaveProfile} isLoading={loading}>
                                    <Save size={18} className="mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </SettingsSection>
                </div>
            )}

            {/* Security Settings */}
            {activeTab === 'security' && (
                <div className="space-y-6">
                    <SettingsSection title="Change Password" icon={Lock}>
                        <div className="space-y-4">
                            <Input
                                type="password"
                                label="Current Password"
                                name="current_password"
                                value={formData.current_password}
                                onChange={handleChange}
                            />
                            <Input
                                type="password"
                                label="New Password"
                                name="new_password"
                                value={formData.new_password}
                                onChange={handleChange}
                            />
                            <Input
                                type="password"
                                label="Confirm New Password"
                                name="confirm_password"
                                value={formData.confirm_password}
                                onChange={handleChange}
                            />

                            <div className="flex justify-end pt-4">
                                <Button onClick={handleChangePassword} isLoading={loading}>
                                    <Lock size={18} className="mr-2" />
                                    Update Password
                                </Button>
                            </div>
                        </div>
                    </SettingsSection>

                    <SettingsSection title="Two-Factor Authentication" icon={Shield}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-slate-900">Enable 2FA</p>
                                <p className="text-sm text-slate-500">Add an extra layer of security to your account</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                    </SettingsSection>
                </div>
            )}

            {/* Notifications Settings */}
            {activeTab === 'notifications' && (
                <SettingsSection title="Notification Preferences" icon={Bell}>
                    <div className="space-y-4">
                        {[
                            { id: 'email_notifications', label: 'Email Notifications', description: 'Receive email updates about important events' },
                            { id: 'sms_notifications', label: 'SMS Notifications', description: 'Get text messages for urgent alerts' },
                            { id: 'payment_alerts', label: 'Payment Alerts', description: 'Notify when payments are received' },
                            { id: 'attendance_alerts', label: 'Attendance Alerts', description: 'Daily attendance summary reports' }
                        ].map(item => (
                            <div key={item.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                <div>
                                    <p className="font-medium text-slate-900">{item.label}</p>
                                    <p className="text-sm text-slate-500">{item.description}</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                            </div>
                        ))}
                    </div>
                </SettingsSection>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
                <div className="space-y-6">
                    <SettingsSection title="Theme Preferences" icon={Palette}>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-4">Choose Theme</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <button
                                        onClick={() => {
                                            localStorage.setItem('theme', 'light');
                                            document.documentElement.classList.remove('dark');
                                            setMessage({ type: 'success', text: 'Light theme applied!' });
                                            setTimeout(() => setMessage(null), 2000);
                                        }}
                                        className={`p-4 border-2 rounded-xl transition-all hover:scale-105 ${localStorage.getItem('theme') === 'light'
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-slate-200 hover:border-primary-300'
                                            }`}
                                    >
                                        <div className="h-24 rounded-lg mb-3 bg-white border-2 border-slate-200 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-slate-100 rounded-lg mx-auto mb-2"></div>
                                                <div className="space-y-1">
                                                    <div className="h-2 w-16 bg-slate-200 rounded mx-auto"></div>
                                                    <div className="h-2 w-12 bg-slate-200 rounded mx-auto"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-900">Light</p>
                                        <p className="text-xs text-slate-500 mt-1">Clean and bright interface</p>
                                    </button>

                                    <button
                                        onClick={() => {
                                            localStorage.setItem('theme', 'dark');
                                            document.documentElement.classList.add('dark');
                                            setMessage({ type: 'success', text: 'Dark theme applied!' });
                                            setTimeout(() => setMessage(null), 2000);
                                        }}
                                        className={`p-4 border-2 rounded-xl transition-all hover:scale-105 ${(!localStorage.getItem('theme') || localStorage.getItem('theme') === 'dark')
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-slate-200 hover:border-primary-300'
                                            }`}
                                    >
                                        <div className="h-24 rounded-lg mb-3 bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-slate-800 rounded-lg mx-auto mb-2"></div>
                                                <div className="space-y-1">
                                                    <div className="h-2 w-16 bg-slate-700 rounded mx-auto"></div>
                                                    <div className="h-2 w-12 bg-slate-700 rounded mx-auto"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-900">Dark</p>
                                        <p className="text-xs text-slate-500 mt-1">Easy on the eyes</p>
                                    </button>

                                    {/* Auto Theme */}
                                    <button
                                        onClick={() => {
                                            localStorage.setItem('theme', 'auto');
                                            // Check system preference
                                            if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                                                document.documentElement.classList.add('dark');
                                            } else {
                                                document.documentElement.classList.remove('dark');
                                            }
                                            setMessage({ type: 'success', text: 'Auto theme applied!' });
                                            setTimeout(() => setMessage(null), 2000);
                                        }}
                                        className={`p-4 border-2 rounded-xl transition-all hover:scale-105 ${localStorage.getItem('theme') === 'auto'
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-slate-200 hover:border-primary-300'
                                            }`}
                                    >
                                        <div className="h-24 rounded-lg mb-3 bg-gradient-to-br from-white via-slate-200 to-slate-900 border-2 border-slate-300 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="w-12 h-12 bg-white/50 backdrop-blur rounded-lg mx-auto mb-2"></div>
                                                <div className="space-y-1">
                                                    <div className="h-2 w-16 bg-white/70 rounded mx-auto"></div>
                                                    <div className="h-2 w-12 bg-white/70 rounded mx-auto"></div>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-900">Auto</p>
                                        <p className="text-xs text-slate-500 mt-1">Follows system settings</p>
                                    </button>
                                </div>
                            </div>

                            {/* Current Theme Info */}
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-500 rounded-lg">
                                        <Palette className="text-white" size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900">Current Theme</p>
                                        <p className="text-xs text-blue-700 mt-1">
                                            {localStorage.getItem('theme') === 'dark' ? 'Dark Mode' :
                                                localStorage.getItem('theme') === 'auto' ? 'Auto (System Preference)' :
                                                    'Light Mode'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </SettingsSection >

                    <SettingsSection title="Accent Color" icon={Palette}>
                        <div className="space-y-4">
                            <label className="block text-sm font-medium text-slate-700 mb-3">Choose Accent Color</label>
                            <div className="flex flex-wrap gap-4">
                                {[
                                    { name: 'Blue', color: 'bg-blue-500', value: 'blue' },
                                    { name: 'Green', color: 'bg-green-500', value: 'green' },
                                    { name: 'Violet', color: 'bg-violet-500', value: 'violet' },
                                    { name: 'Red', color: 'bg-red-500', value: 'red' },
                                    { name: 'Orange', color: 'bg-orange-500', value: 'orange' },
                                    { name: 'Pink', color: 'bg-pink-500', value: 'pink' },
                                    { name: 'Indigo', color: 'bg-indigo-500', value: 'indigo' },
                                    { name: 'Teal', color: 'bg-teal-500', value: 'teal' }
                                ].map(({ name, color, value }) => (
                                    <button
                                        key={value}
                                        onClick={() => {
                                            localStorage.setItem('accentColor', value);
                                            setMessage({ type: 'success', text: `${name} accent applied!` });
                                            setTimeout(() => setMessage(null), 2000);
                                        }}
                                        className="group relative"
                                        title={name}
                                    >
                                        <div className={`w-12 h-12 rounded-full ${color} hover:scale-110 transition-transform shadow-lg ${localStorage.getItem('accentColor') === value ? 'ring-4 ring-offset-2 ring-slate-400' : ''
                                            }`}></div>
                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {name}
                                        </span>
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-4">
                                Note: Accent color changes will be applied in future updates
                            </p>
                        </div>
                    </SettingsSection>
                </div >
            )}

            {/* Admission Settings */}
            {
                activeTab === 'admission' && (
                    <SettingsSection title="Admission Number Configuration" icon={FileText}>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Format Template
                                </label>
                                <Input
                                    name="admission_number_format"
                                    value={formData.admission_number_format || ''}
                                    onChange={handleChange}
                                    placeholder="{SCHOOL_CODE}/{YEAR}/{COUNTER:04d}"
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    Available placeholders: <code className="bg-slate-100 px-1 py-0.5 rounded">{'{' + 'SCHOOL_CODE' + '}'}</code>,
                                    <code className="bg-slate-100 px-1 py-0.5 rounded ml-1">{'{' + 'YEAR' + '}'}</code>,
                                    <code className="bg-slate-100 px-1 py-0.5 rounded ml-1">{'{' + 'COUNTER:04d' + '}'}</code>,
                                    <code className="bg-slate-100 px-1 py-0.5 rounded ml-1">{'{' + 'GRADE' + '}'}</code>
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Admission Fee ({formData.default_currency || 'KES'})
                                </label>
                                <Input
                                    type="number"
                                    name="admission_fee"
                                    value={formData.admission_fee}
                                    onChange={handleChange}
                                    placeholder="0.00"
                                />
                                <p className="text-xs text-slate-500 mt-2">
                                    This one-time fee will be charged to all new students upon registration.
                                </p>
                            </div>

                            {/* Live Preview */}
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-blue-500 rounded-lg">
                                        <FileText className="text-white" size={20} />
                                    </div>
                                    <p className="text-sm font-semibold text-blue-900">Live Preview</p>
                                </div>
                                <div className="bg-white rounded-xl p-4 border-2 border-blue-300">
                                    <p className="text-xs text-slate-500 mb-1">Next Admission Number:</p>
                                    <div className="font-mono text-2xl font-bold text-blue-700">
                                        {getAdmissionNumberPreview()}
                                    </div>
                                </div>
                                <p className="text-xs text-blue-700 mt-3 flex items-center gap-1">
                                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                    This format will be applied to all new student registrations
                                </p>
                            </div>

                            {/* Format Examples */}
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                                <p className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
                                    <span className="inline-block w-1 h-4 bg-primary-500 rounded"></span>
                                    Format Examples
                                </p>
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                        <code className="text-slate-600 text-sm">{'{' + 'SCHOOL_CODE' + '}'}/{'{' + 'YEAR' + '}'}/{'{' + 'COUNTER:04d' + '}'}</code>
                                        <span className="text-slate-400 mx-3">→</span>
                                        <span className="font-mono text-slate-900 font-semibold">EDU/2024/0001</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                        <code className="text-slate-600 text-sm">{'{' + 'YEAR' + '}'}-{'{' + 'SCHOOL_CODE' + '}'}-{'{' + 'COUNTER:05d' + '}'}</code>
                                        <span className="text-slate-400 mx-3">→</span>
                                        <span className="font-mono text-slate-900 font-semibold">2024-EDU-00001</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200">
                                        <code className="text-slate-600 text-sm">{'{' + 'SCHOOL_CODE' + '}'}{'{' + 'YEAR' + '}'}{'{' + 'COUNTER:03d' + '}'}</code>
                                        <span className="text-slate-400 mx-3">→</span>
                                        <span className="font-mono text-slate-900 font-semibold">EDU2024001</span>
                                    </div>
                                </div>
                            </div>

                            {/* Placeholder Guide */}
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                                <p className="text-sm font-semibold text-amber-900 mb-3">Placeholder Guide:</p>
                                <div className="space-y-2 text-sm text-amber-800">
                                    <div className="flex gap-3">
                                        <code className="bg-amber-100 px-2 py-0.5 rounded font-mono">{'{' + 'SCHOOL_CODE' + '}'}</code>
                                        <span>- Your school&apos;s unique code (e.g., EDU, ABC)</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <code className="bg-amber-100 px-2 py-0.5 rounded font-mono">{'{' + 'YEAR' + '}'}</code>
                                        <span>- Current year (e.g., 2024, 2025)</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <code className="bg-amber-100 px-2 py-0.5 rounded font-mono">{'{' + 'COUNTER:04d' + '}'}</code>
                                        <span>- Auto-incrementing number with 4-digit padding (0001, 0002...)</span>
                                    </div>
                                    <div className="flex gap-3">
                                        <code className="bg-amber-100 px-2 py-0.5 rounded font-mono">{'{' + 'GRADE' + '}'}</code>
                                        <span>- Student&apos;s grade/class (optional)</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-slate-200">
                                <Button onClick={handleSaveSchoolConfig} isLoading={loading}>
                                    <Save size={18} className="mr-2" />
                                    Save Admission Format
                                </Button>
                            </div>
                        </div>
                    </SettingsSection>
                )
            }

            {/* Portal Access Settings */}
            {
                activeTab === 'portals' && (
                    <div className="space-y-6">
                        <SettingsSection title="Portal Access Links" icon={Link}>
                            <div className="space-y-6">
                                {/* Info Banner */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-2xl p-6">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-500 rounded-lg">
                                            <Shield className="text-white" size={20} />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-blue-900 dark:text-blue-100 mb-1">Secure Portal Access</h4>
                                            <p className="text-sm text-blue-700 dark:text-blue-300">
                                                Each user role has a unique portal link. Share these links with the respective users to grant them access to their dedicated portals.
                                                You can regenerate the access code anytime for security purposes.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Portal Links Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { role: 'Teachers', icon: '👨‍🏫', color: 'blue', path: 'teacher' },
                                        { role: 'Students', icon: '🎓', color: 'green', path: 'student' },
                                        { role: 'Accountant', icon: '💼', color: 'purple', path: 'accountant' },
                                        ...(hasFeature('FOOD_MANAGEMENT') ? [{ role: 'Food Manager', icon: '🍽️', color: 'orange', path: 'food' }] : []),
                                        ...(hasFeature('TRANSPORT_MANAGEMENT') ? [
                                            { role: 'Transport Manager', icon: '🚌', color: 'yellow', path: 'transport' },
                                            { role: 'Drivers', icon: '🚗', color: 'red', path: 'driver' }
                                        ] : [])
                                    ].map(({ role, icon, color, path }) => {
                                        const portalUrl = `${window.location.origin}/portal/${formData.portal_slug || 'loading'}/${path}`;

                                        return (
                                            <div key={role} className={`bg-white dark:bg-slate-900 rounded-xl border-2 border-${color}-200 dark:border-${color}-800 p-5 hover:shadow-lg transition-all`}>
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className={`text-3xl bg-${color}-50 dark:bg-${color}-900/20 p-2 rounded-lg`}>
                                                        {icon}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-slate-900 dark:text-white">{role}</h4>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">Portal Access</p>
                                                    </div>
                                                </div>

                                                <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3 mb-3">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Portal Link:</p>
                                                    <div className="flex items-center gap-2">
                                                        <code className="flex-1 text-xs font-mono text-slate-700 dark:text-slate-300 truncate">
                                                            {portalUrl}
                                                        </code>
                                                        <button
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(portalUrl);
                                                                setMessage({ type: 'success', text: `${role} portal link copied!` });
                                                                setTimeout(() => setMessage(null), 2000);
                                                            }}
                                                            className={`p-2 bg-${color}-500 hover:bg-${color}-600 text-white rounded-lg transition-colors`}
                                                            title="Copy link"
                                                        >
                                                            <Copy size={14} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    Share this link with {role.toLowerCase()} to access their portal
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Security Actions */}
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="p-2 bg-amber-500 rounded-lg">
                                                <RefreshCw className="text-white" size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-amber-900 dark:text-amber-100 mb-1">Regenerate Access Code</h4>
                                                <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                                                    Current Code: <code className="bg-amber-100 dark:bg-amber-900/40 px-2 py-1 rounded font-mono font-bold">{formData.portal_slug || 'Not set'}</code>
                                                </p>
                                                <p className="text-xs text-amber-600 dark:text-amber-400">
                                                    Regenerating will invalidate all existing portal links. You'll need to share the new links with all users.
                                                </p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={async () => {
                                                if (!window.confirm('Are you sure? This will change all portal access links.')) return;

                                                try {
                                                    setLoading(true);
                                                    const response = await axios.post('/api/config/regenerate-portal/');
                                                    if (response.data.success) {
                                                        setFormData(prev => ({ ...prev, portal_slug: response.data.portal_slug }));
                                                        setMessage({ type: 'success', text: response.data.message });
                                                    }
                                                } catch (error) {
                                                    setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to regenerate' });
                                                } finally {
                                                    setLoading(false);
                                                    setTimeout(() => setMessage(null), 5000);
                                                }
                                            }}
                                            isLoading={loading}
                                        >
                                            <RefreshCw size={16} className="mr-2" />
                                            Regenerate
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </SettingsSection>
                    </div>
                )
            }

            {/* Portal Passwords Settings */}
            {
                activeTab === 'portal-passwords' && (
                    <div className="space-y-6">
                        <SettingsSection title="Portal Authentication Settings" icon={Key}>
                            <div className="space-y-6">
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
                                    <div className="p-2 bg-blue-500 rounded-lg h-fit text-white">
                                        <Shield size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-blue-900 dark:text-blue-100">Portal User Credentials</h4>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            Except for students who use their <strong>Admission Numbers</strong> as usernames, all other portal users use their <strong>Email Addresses</strong> as usernames. Set the default access passwords for each portal role below.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-slate-900 dark:text-white border-b pb-2">Academic & Student Portals</h4>
                                        <Input
                                            label="Teacher Portal Password"
                                            name="teacher_portal_password"
                                            type="text"
                                            value={formData.teacher_portal_password}
                                            onChange={handleChange}
                                            placeholder="Set password for teachers"
                                            icon={Lock}
                                        />
                                        <Input
                                            label="Student Portal Password"
                                            name="student_portal_password"
                                            type="text"
                                            value={formData.student_portal_password}
                                            onChange={handleChange}
                                            placeholder="Set password for students"
                                            icon={Lock}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-semibold text-slate-900 dark:text-white border-b pb-2">Finance & Operations Portals</h4>
                                        <Input
                                            label="Accountant Portal Password"
                                            name="accountant_portal_password"
                                            type="text"
                                            value={formData.accountant_portal_password}
                                            onChange={handleChange}
                                            placeholder="Set password for accountants"
                                            icon={Lock}
                                        />
                                        {hasFeature('FOOD_MANAGEMENT') && (
                                            <Input
                                                label="Food Manager Portal Password"
                                                name="food_portal_password"
                                                type="text"
                                                value={formData.food_portal_password}
                                                onChange={handleChange}
                                                placeholder="Set password for food managers"
                                                icon={Lock}
                                            />
                                        )}
                                    </div>

                                    {hasFeature('TRANSPORT_MANAGEMENT') && (
                                        <div className="space-y-4 md:col-span-2">
                                            <h4 className="font-semibold text-slate-900 dark:text-white border-b pb-2">Transport & Logistics Portals</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Input
                                                    label="Transport Manager Password"
                                                    name="transport_portal_password"
                                                    type="text"
                                                    value={formData.transport_portal_password}
                                                    onChange={handleChange}
                                                    placeholder="Set password for transport managers"
                                                    icon={Lock}
                                                />
                                                <Input
                                                    label="Driver Portal Password"
                                                    name="driver_portal_password"
                                                    type="text"
                                                    value={formData.driver_portal_password}
                                                    onChange={handleChange}
                                                    placeholder="Set password for drivers"
                                                    icon={Lock}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <Button
                                        onClick={handleSaveSchoolConfig}
                                        isLoading={loading}
                                    >
                                        <Save size={18} className="mr-2" />
                                        Save Portal Passwords
                                    </Button>
                                </div>
                            </div>
                        </SettingsSection>
                    </div>
                )
            }

            {/* Portal Users Management */}
            {
                activeTab === 'portal-users' && (
                    <div className="space-y-6">
                        <SettingsSection title="Create Portal User" icon={UserPlus}>
                            <div className="space-y-6">
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3">
                                    <div className="p-2 bg-amber-500 rounded-lg h-fit text-white">
                                        <Key size={18} />
                                    </div>
                                    <div className="text-sm text-amber-800 dark:text-amber-200">
                                        <p className="font-bold mb-1">Password Connection</p>
                                        <p>
                                            New users will be created with the password: <strong className="bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded font-mono">
                                                {newPortalUser.position === 'ACCOUNTANT' ? formData.accountant_portal_password :
                                                    newPortalUser.position === 'FOOD_MANAGER' ? formData.food_portal_password :
                                                        formData.transport_portal_password}
                                            </strong>
                                        </p>
                                        <p className="mt-1">You can change this default in the <strong className="cursor-pointer underline" onClick={() => setActiveTab('portal-passwords')}>Portal Passwords</strong> tab.</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <Input
                                        label="First Name"
                                        value={newPortalUser.first_name}
                                        onChange={(e) => setNewPortalUser({ ...newPortalUser, first_name: e.target.value })}
                                        placeholder="Enter first name"
                                        required
                                    />
                                    <Input
                                        label="Last Name"
                                        value={newPortalUser.last_name}
                                        onChange={(e) => setNewPortalUser({ ...newPortalUser, last_name: e.target.value })}
                                        placeholder="Enter last name"
                                    />
                                    <Input
                                        label="Email Address"
                                        type="email"
                                        value={newPortalUser.email}
                                        onChange={(e) => setNewPortalUser({ ...newPortalUser, email: e.target.value })}
                                        placeholder="user@example.com"
                                        required
                                        icon={Mail}
                                    />
                                    <Input
                                        label="Phone Number"
                                        value={newPortalUser.phone}
                                        onChange={(e) => setNewPortalUser({ ...newPortalUser, phone: e.target.value })}
                                        placeholder="+254..."
                                    />
                                    <Input
                                        label="National ID"
                                        value={newPortalUser.national_id}
                                        onChange={(e) => setNewPortalUser({ ...newPortalUser, national_id: e.target.value })}
                                        placeholder="ID Number"
                                        required
                                    />
                                    <Input
                                        label="Date of Birth"
                                        type="date"
                                        value={newPortalUser.date_of_birth}
                                        onChange={(e) => setNewPortalUser({ ...newPortalUser, date_of_birth: e.target.value })}
                                        required
                                    />
                                    <div className="space-y-1">
                                        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                            Role/Position
                                        </label>
                                        <select
                                            className="w-full h-10 px-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                            value={newPortalUser.position}
                                            onChange={(e) => setNewPortalUser({ ...newPortalUser, position: e.target.value })}
                                        >
                                            <option value="ACCOUNTANT">Accountant (Finance Portal)</option>
                                            {hasFeature('FOOD_MANAGEMENT') && <option value="FOOD_MANAGER">Food Manager (Food Portal)</option>}
                                            {hasFeature('TRANSPORT_MANAGEMENT') && <option value="TRANSPORT_MANAGER">Transport Manager (Transport Portal)</option>}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <Button onClick={handleCreatePortalUser} isLoading={loading}>
                                        <Plus size={18} className="mr-2" />
                                        Create User Account
                                    </Button>
                                </div>
                            </div>
                        </SettingsSection>

                        <SettingsSection title="Existing Portal Users" icon={User}>
                            {portalUsersLoading ? (
                                <div className="flex justify-center py-8">
                                    <RefreshCw className="animate-spin text-primary-600" size={24} />
                                </div>
                            ) : portalUsers.length === 0 ? (
                                <div className="text-center py-8 text-slate-500">
                                    No portal users created yet
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                                <th className="py-3 px-4 font-semibold text-sm text-slate-700 dark:text-slate-300">Name</th>
                                                <th className="py-3 px-4 font-semibold text-sm text-slate-700 dark:text-slate-300">Email</th>
                                                <th className="py-3 px-4 font-semibold text-sm text-slate-700 dark:text-slate-300">Role</th>
                                                <th className="py-3 px-4 font-semibold text-sm text-slate-700 dark:text-slate-300">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {portalUsers.map((u) => (
                                                <tr key={u.id} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0">
                                                    <td className="py-3 px-4 text-sm text-slate-900 dark:text-white font-medium">
                                                        {u.first_name} {u.last_name}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm text-slate-500 dark:text-slate-400">
                                                        {u.email}
                                                    </td>
                                                    <td className="py-3 px-4 text-sm">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.position === 'ACCOUNTANT' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30' :
                                                            u.position === 'FOOD_MANAGER' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' :
                                                                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30'
                                                            }`}>
                                                            {u.position.replace('_', ' ')}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-4 text-sm">
                                                        <span className="flex items-center gap-1 text-green-600">
                                                            <CheckCircle size={14} />
                                                            Active
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </SettingsSection>
                    </div>
                )
            }

            {/* System Settings */}
            {
                activeTab === 'system' && (
                    <div className="space-y-6">
                        <SettingsSection title="School Information" icon={Globe}>
                            {configLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                                    <p className="text-sm font-medium text-slate-500">Loading school configuration...</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {/* Logo Upload Section */}
                                    <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                                        <div className="relative group">
                                            <div className="h-24 w-24 rounded-2xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary-500">
                                                {formData.school_logo_preview || formData.school_logo ? (
                                                    <img
                                                        src={formData.school_logo_preview || formData.school_logo}
                                                        alt="School Logo"
                                                        className="h-full w-full object-contain"
                                                    />
                                                ) : (
                                                    <Building2 className="text-slate-400" size={32} />
                                                )}
                                            </div>
                                            <label className="absolute -bottom-2 -right-2 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg cursor-pointer transition-all hover:scale-110">
                                                <Camera size={14} />
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onloadend = () => {
                                                                setFormData(prev => ({
                                                                    ...prev,
                                                                    school_logo_file: file,
                                                                    school_logo_preview: reader.result
                                                                }));
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        <div className="text-center sm:text-left">
                                            <h4 className="font-bold text-slate-900 dark:text-white">Institution Logo</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                                                This logo will appear on all sidebars, login pages, and official receipts.
                                                Recommended size: 512x512px.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Input
                                            label="School Name"
                                            name="school_name"
                                            value={formData.school_name || ''}
                                            onChange={handleChange}
                                        />
                                        <Input
                                            label="School Code"
                                            name="school_code"
                                            value={formData.school_code || ''}
                                            onChange={handleChange}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                label="Phone Number"
                                                name="school_phone"
                                                value={formData.school_phone || ''}
                                                onChange={handleChange}
                                            />
                                            <Input
                                                type="email"
                                                label="School Email"
                                                name="school_email"
                                                value={formData.school_email || ''}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                                School Address
                                            </label>
                                            <textarea
                                                name="school_address"
                                                value={formData.school_address || ''}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all outline-none min-h-[100px]"
                                                placeholder="Enter school physical address..."
                                            />
                                        </div>
                                        <div className="flex justify-end pt-4">
                                            <Button onClick={handleSaveSchoolConfig}>
                                                <Save size={18} className="mr-2" />
                                                Save Changes
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </SettingsSection>

                        <SettingsSection title="Database & Backup" icon={Database}>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between py-3 border-b border-slate-100">
                                    <div>
                                        <p className="font-medium text-slate-900">Automatic Backups</p>
                                        <p className="text-sm text-slate-500">Daily database backups at 2:00 AM</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" defaultChecked />
                                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                    </label>
                                </div>
                                <div className="pt-2">
                                    <Button variant="secondary">
                                        <Database size={18} className="mr-2" />
                                        Backup Now
                                    </Button>
                                </div>
                            </div>
                        </SettingsSection>
                    </div >
                )
            }

            {/* Branches Settings */}
            {
                activeTab === 'branches' && (
                    <div className="space-y-6">
                        <SettingsSection title="Manage Branches" icon={MapPin}>
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                                    <Input
                                        placeholder="Branch Name"
                                        value={newBranch.name}
                                        onChange={(e) => setNewBranch({ ...newBranch, name: e.target.value })}
                                    />
                                    <Input
                                        placeholder="Address (Optional)"
                                        value={newBranch.address}
                                        onChange={(e) => setNewBranch({ ...newBranch, address: e.target.value })}
                                    />
                                    <div className="flex gap-2">
                                        <Input
                                            placeholder="Phone (Optional)"
                                            value={newBranch.phone}
                                            onChange={(e) => setNewBranch({ ...newBranch, phone: e.target.value })}
                                        />
                                        <Button onClick={handleAddBranch} disabled={!newBranch.name}>
                                            <Plus size={18} />
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <h4 className="font-medium text-slate-900 dark:text-white">Existing Branches</h4>
                                    {branches.length === 0 ? (
                                        <p className="text-slate-500 italic">No branches added yet.</p>
                                    ) : (
                                        <div className="grid gap-3">
                                            {branches.map(branch => (
                                                <div key={branch.id} className="flex justify-between items-center p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white">{branch.name}</p>
                                                        <div className="flex gap-4 text-sm text-slate-500">
                                                            {branch.address && <span>{branch.address}</span>}
                                                            {branch.phone && <span>{branch.phone}</span>}
                                                        </div>
                                                    </div>
                                                    <Button variant="ghost" className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDeleteBranch(branch.id)}>
                                                        <Trash2 size={18} />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </SettingsSection>
                    </div>
                )
            }
        </div >
    );
};

export default Settings;
