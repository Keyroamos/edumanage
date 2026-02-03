import React, { useState, useEffect } from 'react';
import {
    Activity, Server, Database, Shield,
    CheckCircle, AlertTriangle, XCircle,
    RefreshCw, Clock, HardDrive, Cpu,
    Globe, Lock, Zap
} from 'lucide-react';

const PlatformHealth = () => {
    // Mock Data simulating real-time system metrics
    const [systemMetrics, setSystemMetrics] = useState({
        cpu: 24,
        memory: 42,
        storage: 36,
        uptime: '99.98%',
        latency: 45
    });

    const [services, setServices] = useState([
        { id: 1, name: 'Core API Gateway', status: 'operational', uptime: '99.99%', latency: '45ms' },
        { id: 2, name: 'Authentication Service', status: 'operational', uptime: '100%', latency: '28ms' },
        { id: 3, name: 'Database Clusters (PostgreSQL)', status: 'operational', uptime: '99.95%', latency: '12ms' },
        { id: 4, name: 'Storage Buckets (Media)', status: 'operational', uptime: '99.90%', latency: '140ms' },
        { id: 5, name: 'Notification Engine (SMS/Email)', status: 'degraded', uptime: '98.50%', latency: '850ms', issue: 'High Latency' },
        { id: 6, name: 'Payment Processing (Paystack)', status: 'operational', uptime: '99.99%', latency: '250ms' },
        { id: 7, name: 'Background Workers (Celery)', status: 'operational', uptime: '100%', latency: 'N/A' },
        { id: 8, name: 'Real-time Socket Server', status: 'operational', uptime: '99.98%', latency: '15ms' }
    ]);

    const [logs, setLogs] = useState([
        { id: 101, type: 'info', message: 'Automated backup completed successfully', timestamp: '2 mins ago' },
        { id: 102, type: 'warning', message: 'High memory usage detected on Worker-04', timestamp: '15 mins ago' },
        { id: 103, type: 'success', message: 'Deployment #4592 deployed to production', timestamp: '1 hour ago' },
        { id: 104, type: 'info', message: 'Database optimization routine finished', timestamp: '3 hours ago' },
    ]);

    // Simulate "Real-time" updates
    useEffect(() => {
        const interval = setInterval(() => {
            setSystemMetrics(prev => ({
                ...prev,
                cpu: Math.min(100, Math.max(10, prev.cpu + (Math.random() * 10 - 5))),
                memory: Math.min(100, Math.max(20, prev.memory + (Math.random() * 5 - 2.5))),
                latency: Math.max(10, Math.floor(prev.latency + (Math.random() * 20 - 10)))
            }));
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'operational': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'degraded': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            case 'down': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
            case 'maintenance': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'operational': return <CheckCircle size={16} />;
            case 'degraded': return <AlertTriangle size={16} />;
            case 'down': return <XCircle size={16} />;
            case 'maintenance': return <RefreshCw size={16} />;
            default: return <Activity size={16} />;
        }
    };

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight mb-2">PLATFORM HEALTH</h1>
                    <p className="text-slate-500 font-medium text-sm lg:text-base">
                        Real-time system performance monitoring and status reports
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2">
                        <div className="relative">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-500 animate-ping opacity-75"></div>
                        </div>
                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">System Operational</span>
                    </div>
                    <button className="p-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-white transition-all hover:bg-slate-800">
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* CPU Metric */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-32 bg-purple-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-purple-500/10 transition-all duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center">
                                <Cpu size={20} className="text-purple-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">CPU Load</span>
                        </div>
                        <div className="flex items-end gap-2 text-white">
                            <span className="text-4xl font-black tracking-tight">{Math.round(systemMetrics.cpu)}%</span>
                            <span className="text-sm font-bold text-slate-500 mb-1.5">Usage</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-500"
                                style={{ width: `${systemMetrics.cpu}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Memory Metric */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-32 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/10 transition-all duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center">
                                <Server size={20} className="text-blue-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Memory</span>
                        </div>
                        <div className="flex items-end gap-2 text-white">
                            <span className="text-4xl font-black tracking-tight">{Math.round(systemMetrics.memory)}%</span>
                            <span className="text-sm font-bold text-slate-500 mb-1.5">Free</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all duration-500"
                                style={{ width: `${systemMetrics.memory}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Database Metric */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-32 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-emerald-500/10 transition-all duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center">
                                <Activity size={20} className="text-emerald-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Avg Latency</span>
                        </div>
                        <div className="flex items-end gap-2 text-white">
                            <span className="text-4xl font-black tracking-tight">{Math.round(systemMetrics.latency)}</span>
                            <span className="text-sm font-bold text-slate-500 mb-1.5">ms</span>
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-emerald-400">
                            <Zap size={10} fill="currentColor" />
                            <span>Optimal Response Time</span>
                        </div>
                    </div>
                </div>

                {/* Network Metric */}
                <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-3xl p-6 relative overflow-hidden group">
                    <div className="absolute right-0 top-0 p-32 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-amber-500/10 transition-all duration-500"></div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center">
                                <Globe size={20} className="text-amber-400" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Uptime</span>
                        </div>
                        <div className="flex items-end gap-2 text-white">
                            <span className="text-4xl font-black tracking-tight">{systemMetrics.uptime}</span>
                            <span className="text-sm font-bold text-slate-500 mb-1.5">30 Days</span>
                        </div>
                        <div className="flex items-center gap-2 mt-4 text-[10px] font-bold text-slate-500">
                            <CheckCircle size={10} />
                            <span>No outages recently</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Services Status List */}
                <div className="lg:col-span-2 space-y-4">
                    <h3 className="text-lg font-black text-white pl-2">Service Status</h3>

                    <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] overflow-hidden">
                        {services.map((service, index) => (
                            <div
                                key={service.id}
                                className={`p-6 flex items-center justify-between group hover:bg-white/[0.02] transition-colors border-b border-slate-800/50 last:border-0`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-2 h-2 rounded-full ${service.status === 'operational' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">{service.name}</h4>
                                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                            <span className="font-medium">Uptime: {service.uptime}</span>
                                            <span>•</span>
                                            <span className="font-medium">Latency: {service.latency}</span>
                                        </div>
                                    </div>
                                </div>

                                <span className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${getStatusColor(service.status)}`}>
                                    {getStatusIcon(service.status)}
                                    {service.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Incident Log */}
                <div className="space-y-4">
                    <h3 className="text-lg font-black text-white pl-2">System Logs</h3>
                    <div className="bg-slate-900/40 border border-slate-800 rounded-[2rem] p-6 space-y-6">
                        {logs.map((log) => (
                            <div key={log.id} className="relative pl-6 border-l border-slate-800">
                                <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full border-2 border-slate-900 ${log.type === 'info' ? 'bg-blue-500' :
                                        log.type === 'warning' ? 'bg-amber-500' :
                                            log.type === 'success' ? 'bg-emerald-500' : 'bg-slate-500'
                                    }`}></div>

                                <p className="text-xs font-bold text-white mb-1 leading-relaxed">{log.message}</p>
                                <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5">
                                    <Clock size={10} /> {log.timestamp}
                                </span>
                            </div>
                        ))}

                        <button className="w-full py-4 rounded-xl border border-dashed border-slate-700 text-slate-500 text-xs font-black uppercase tracking-widest hover:bg-slate-800 hover:text-white transition-all">
                            View Master Log
                        </button>
                    </div>

                    {/* Security Snapshot */}
                    <div className="bg-gradient-to-br from-indigo-600 to-blue-600 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-900/20">
                        <div className="flex items-start justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-black mb-1">Security Shield</h3>
                                <p className="text-blue-100/70 text-xs font-bold">Firewall Active & Monitoring</p>
                            </div>
                            <Shield size={28} className="text-blue-200" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                <p className="text-2xl font-black">0</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Threats Found</p>
                            </div>
                            <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
                                <p className="text-2xl font-black">2K+</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Reqs / Min</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlatformHealth;
