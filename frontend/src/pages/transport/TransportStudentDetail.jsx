import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, DollarSign, Plus, MapPin, X, User, Map,
    Calendar, CreditCard, CheckCircle, AlertCircle, Navigation,
    TrendingUp, TrendingDown, Wallet, Receipt, Bus
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const TransportStudentDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showRouteModal, setShowRouteModal] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');
    const [formData, setFormData] = useState({
        type: 'PAYMENT',
        amount: '',
        description: '',
        method: 'CASH'
    });
    const [routeData, setRouteData] = useState({
        route_id: '',
        pickup_point: '',
        pickup_location_embed: ''
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const res = await axios.get(`/api/transport/students/${id}/`);
            setData(res.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleTransaction = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/transport/students/${id}/`, {
                action: 'TRANSACTION',
                ...formData
            });
            setShowPaymentModal(false);
            setFormData({ type: 'PAYMENT', amount: '', description: '', method: 'CASH' });
            fetchData();
        } catch (error) {
            alert('Failed to record transaction');
        }
    };

    const handleAssignRoute = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`/api/transport/students/${id}/`, {
                action: 'ASSIGN_ROUTE',
                ...routeData
            });
            setShowRouteModal(false);
            setRouteData({ route_id: '', pickup_point: '', pickup_location_embed: '' });
            fetchData();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to assign route');
        }
    };

    const handleRemoveRoute = async (assignmentId) => {
        if (!confirm('Remove this route assignment?')) return;
        try {
            await axios.post(`/api/transport/students/${id}/`, {
                action: 'REMOVE_ROUTE',
                assignment_id: assignmentId
            });
            fetchData();
        } catch (error) {
            alert('Failed to remove route');
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
                    <Bus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" size={20} />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Loading...</p>
            </div>
        </div>
    );

    if (!data) return <div className="p-8 text-center">Student not found</div>;

    const student = data.student;
    const balance = student.balance;
    const balanceStatus = balance < 0 ? 'credit' : balance > 0 ? 'owing' : 'clear';
    const totalPaid = data.transactions.filter(t => t.type === 'PAYMENT').reduce((sum, t) => sum + t.amount, 0);
    const totalCharged = data.transactions.filter(t => t.type === 'CHARGE').reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-12">
            {/* Back Button */}
            <div className="max-w-7xl mx-auto px-4 pt-4">
                <button
                    onClick={() => navigate('/transport-portal/students')}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={16} />
                    Back to Students
                </button>
            </div>

            {/* Compact Hero Profile */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-4 shadow-lg">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

                    <div className="relative z-10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            {student.photo ? (
                                <img
                                    src={student.photo}
                                    alt={student.name}
                                    className="w-16 h-16 rounded-xl object-cover border-2 border-white/30"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-xl bg-white/20 flex items-center justify-center border-2 border-white/30">
                                    <User size={32} className="text-white" />
                                </div>
                            )}
                            <div>
                                <h1 className="text-xl font-bold text-white mb-1">{student.name}</h1>
                                <div className="flex gap-2 text-xs">
                                    <span className="px-2 py-0.5 bg-white/20 rounded-md text-white font-medium">{student.adm}</span>
                                    <span className="px-2 py-0.5 bg-white/20 rounded-md text-white font-medium">{student.grade}</span>
                                    <span className={`px-2 py-0.5 rounded-md font-medium ${balanceStatus === 'credit' ? 'bg-emerald-500/30 text-emerald-100' :
                                        balanceStatus === 'owing' ? 'bg-red-500/30 text-red-100' :
                                            'bg-white/20 text-white'
                                        }`}>
                                        {balanceStatus === 'credit' ? 'Credit' : balanceStatus === 'owing' ? 'Owing' : 'Clear'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-xs text-white/70 mb-1">Current Balance</p>
                            <p className={`text-2xl font-black ${balance < 0 ? 'text-emerald-300' :
                                balance > 0 ? 'text-red-300' :
                                    'text-white'
                                }`}>
                                {Math.abs(balance).toLocaleString()}
                            </p>
                            <p className="text-xs text-white/60">KES</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compact Stats */}
            <div className="max-w-7xl mx-auto px-4 mb-4">
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">PAID</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total Paid</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{totalPaid.toLocaleString()}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Receipt size={16} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400">CHARGED</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Total Charged</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{totalCharged.toLocaleString()}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-xl p-3 shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <Bus size={16} className="text-purple-600 dark:text-purple-400" />
                            </div>
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">ACTIVE</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Active Routes</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white">{data.assignments.length}</p>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="max-w-7xl mx-auto px-4 mb-4">
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        onClick={() => setShowPaymentModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 py-3 text-sm font-bold"
                    >
                        <Plus size={18} />
                        Record Transaction
                    </Button>
                    <Button
                        onClick={() => setShowRouteModal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-3 text-sm font-bold"
                    >
                        <MapPin size={18} />
                        Assign Route
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-7xl mx-auto px-4 mb-4">
                <div className="bg-white dark:bg-slate-800 rounded-xl p-1 shadow-sm border border-slate-100 dark:border-slate-700 inline-flex gap-1">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'overview'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        <Map size={14} className="inline mr-1.5" />
                        Routes & Map
                    </button>
                    <button
                        onClick={() => setActiveTab('transactions')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'transactions'
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                    >
                        <Receipt size={14} className="inline mr-1.5" />
                        Transactions
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="max-w-7xl mx-auto px-4">
                {activeTab === 'overview' && (
                    <div className="space-y-4">
                        {data.assignments.length > 0 ? (
                            data.assignments.map(assignment => (
                                <div key={assignment.id} className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden h-[600px] group">
                                    {/* Full-Screen Map Background */}
                                    {/* Full-Screen Map Background */}
                                    {(assignment.latitude && assignment.longitude) ? (
                                        <div className="absolute inset-0 z-0 h-full w-full">
                                            <MapContainer
                                                center={[assignment.latitude, assignment.longitude]}
                                                zoom={15}
                                                style={{ height: '100%', width: '100%' }}
                                                className="z-0"
                                            >
                                                <TileLayer
                                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                />
                                                <Marker position={[assignment.latitude, assignment.longitude]}>
                                                    <Popup>
                                                        <b>Pickup Point</b><br />
                                                        {assignment.pickup_point}
                                                    </Popup>
                                                </Marker>
                                            </MapContainer>
                                        </div>
                                    ) : (assignment.pickup_location_embed || assignment.route_map_embed) ? (
                                        <div
                                            className="absolute inset-0 w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
                                            dangerouslySetInnerHTML={{
                                                __html: assignment.pickup_location_embed || assignment.route_map_embed
                                            }}
                                        />
                                    ) : (
                                        <div className="absolute inset-0 w-full h-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                                            <div className="text-center">
                                                <Map size={64} className="mx-auto mb-3 text-slate-300" />
                                                <p className="text-slate-500 text-sm font-medium">No map available</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Floating Stats Bar (Top) */}
                                    <div className="absolute top-4 left-4 right-4 z-10 transition-transform duration-300 transform translate-y-0">
                                        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl p-3 shadow-xl border border-white/20 dark:border-slate-700 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                    <Bus size={20} className="text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{assignment.route_name}</h3>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                        <MapPin size={10} />
                                                        {assignment.pickup_point || 'No pickup point'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right pl-4 border-l border-slate-200 dark:border-slate-700">
                                                <p className="text-lg font-black text-slate-900 dark:text-white leading-none">
                                                    KES {assignment.cost.toLocaleString()}
                                                </p>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Per Term</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Floating Controls (Bottom) */}
                                    <div className="absolute bottom-4 left-4 right-4 z-10 flex justify-between items-center">
                                        {/* Legend */}
                                        <div className="flex gap-2">
                                            {(assignment.pickup_location_embed || (assignment.latitude && assignment.longitude)) && (
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg shadow-lg text-xs font-bold text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                                    Pickup
                                                </div>
                                            )}
                                            {assignment.route_map_embed && (
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-lg shadow-lg text-xs font-bold text-blue-700 dark:text-blue-400 ring-1 ring-blue-500/20">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    Route
                                                </div>
                                            )}
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            onClick={() => handleRemoveRoute(assignment.id)}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg shadow-xl text-xs font-bold flex items-center gap-1.5 transition-all transform hover:scale-105 active:scale-95"
                                        >
                                            <X size={14} />
                                            Remove
                                        </button>
                                    </div>

                                    {/* Gradient Overlay for Text Readability */}
                                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20 pointer-events-none"></div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-12 text-center shadow-lg border border-slate-100 dark:border-slate-700">
                                <Bus size={64} className="mx-auto mb-4 text-slate-300" />
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">No Active Routes</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Assign a route to get started</p>
                                <Button
                                    onClick={() => setShowRouteModal(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm"
                                >
                                    <MapPin size={16} className="mr-2" />
                                    Assign Route
                                </Button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Receipt size={18} className="text-blue-600" />
                                Transaction History
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-900/50">
                                    <tr className="border-b border-slate-100 dark:border-slate-700">
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Date</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Type</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Description</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase">Method</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                    {data.transactions.map(tx => (
                                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                                            <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400 font-mono">{tx.date}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-bold ${tx.type === 'PAYMENT'
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                    }`}>
                                                    {tx.type === 'PAYMENT' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                                    {tx.type}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-xs text-slate-600 dark:text-slate-400">{tx.description}</td>
                                            <td className="px-4 py-3">
                                                <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-mono">
                                                    {tx.method}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className={`font-mono font-bold text-sm ${tx.type === 'PAYMENT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-blue-400'
                                                    }`}>
                                                    {tx.type === 'PAYMENT' ? '+' : '-'} {tx.amount.toLocaleString()}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {data.transactions.length === 0 && (
                                <div className="py-16 text-center">
                                    <CreditCard size={48} className="mx-auto mb-3 text-slate-300" />
                                    <p className="text-slate-400 text-sm">No transactions yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modals remain the same but with adjusted sizes */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in">
                        {/* Gradient Header */}
                        <div className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600">
                            <div className="flex justify-between items-center text-white">
                                <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-sm">
                                        <Wallet size={18} />
                                    </div>
                                    <h3 className="text-lg font-bold">Record Transaction</h3>
                                </div>
                                <button
                                    onClick={() => setShowPaymentModal(false)}
                                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleTransaction} className="p-5 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white font-medium"
                                    >
                                        <option value="PAYMENT">Payment</option>
                                        <option value="CHARGE">Charge</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Method</label>
                                    <select
                                        value={formData.method}
                                        onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                                        className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white font-medium"
                                    >
                                        <option value="CASH">Cash</option>
                                        <option value="MPESA">M-Pesa</option>
                                        <option value="BANK">Bank Transfer</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Amount (KES)</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">KES</span>
                                    <input
                                        type="number"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                        required
                                        placeholder="0.00"
                                        className="w-full pl-12 pr-4 py-2.5 text-lg font-bold font-mono rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">
                                    Description <span className="text-slate-400 lowercase font-normal">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="e.g. Activity Fee"
                                    className="w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none dark:text-white"
                                />
                            </div>

                            <div className="pt-2">
                                <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-sm rounded-xl shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">
                                    Complete Transaction
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showRouteModal && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800 z-10">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Assign Route</h3>
                                <button onClick={() => setShowRouteModal(false)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors text-slate-400 hover:text-red-500">
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleAssignRoute} className="p-4 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Route</label>
                                <select
                                    value={routeData.route_id}
                                    onChange={(e) => setRouteData({ ...routeData, route_id: e.target.value })}
                                    required
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                >
                                    <option value="">-- Select Route --</option>
                                    {data.available_routes.map(route => (
                                        <option key={route.id} value={route.id}>
                                            {route.name} - KES {route.cost_per_term}/term
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Pickup Point</label>
                                <input
                                    type="text"
                                    value={routeData.pickup_point}
                                    onChange={(e) => setRouteData({ ...routeData, pickup_point: e.target.value })}
                                    placeholder="e.g., Sarit Centre"
                                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Pickup Location Map</label>
                                <textarea
                                    value={routeData.pickup_location_embed}
                                    onChange={(e) => setRouteData({ ...routeData, pickup_location_embed: e.target.value })}
                                    rows="3"
                                    placeholder='<iframe src="..."></iframe>'
                                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white resize-none font-mono"
                                ></textarea>
                                <p className="text-xs text-slate-400 mt-1">Paste Google Maps embed code</p>
                            </div>

                            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg text-xs text-amber-800 dark:text-amber-300">
                                <strong>Note:</strong> Assigning will auto-charge the student.
                            </div>

                            <div className="flex gap-2 pt-2">
                                <Button type="button" onClick={() => setShowRouteModal(false)} className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm py-2">
                                    Cancel
                                </Button>
                                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2">
                                    Assign
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransportStudentDetail;
