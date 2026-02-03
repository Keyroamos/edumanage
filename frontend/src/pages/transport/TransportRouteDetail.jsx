import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, MapPin, Users, DollarSign, Map, Bus,
    Navigation, Search, X, Truck, User
} from 'lucide-react';
import Button from '../../components/ui/Button';

const TransportRouteDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        id: null,
        name: '',
        cost_per_term: '',
        cost_per_month: '',
        description: '',
        pickup_points: '',
        map_embed_code: ''
    });

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const res = await axios.get(`/api/transport/routes/${id}/`);
            setData(res.data);
            // Pre-fill form data
            const r = res.data.route;
            setFormData({
                id: r.id,
                name: r.name,
                cost_per_term: r.cost_per_term,
                cost_per_month: r.cost_per_month,
                description: r.description || '',
                pickup_points: r.pickup_points || '',
                map_embed_code: r.map_embed_code || ''
            });
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/transport/routes/', {
                action: 'UPDATE',
                ...formData
            });
            setShowModal(false);
            fetchData();
        } catch (error) {
            alert('Failed to update route');
        }
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
            <div className="flex flex-col items-center gap-4">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
                    <Bus className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={20} />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">Loading Route...</p>
            </div>
        </div>
    );

    if (!data) return <div className="p-8 text-center">Route not found</div>;

    const { route, students } = data;

    const filteredStudents = students.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.adm.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-12">
            {/* Back Button & Header */}
            <div className="max-w-7xl mx-auto px-4 pt-4 flex justify-between items-center">
                <button
                    onClick={() => navigate('/transport-portal/routes')}
                    className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm font-medium"
                >
                    <ArrowLeft size={16} />
                    Back to Routes
                </button>
                <button
                    onClick={() => setShowModal(true)}
                    className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                >
                    Edit Route
                </button>
            </div>

            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

                    <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-white/20 backdrop-blur-md rounded-xl">
                                    <Bus size={32} className="text-white" />
                                </div>
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white/90 text-sm font-bold border border-white/20">
                                    Active Route
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                                {route.name}
                            </h1>
                            <p className="text-indigo-100 text-lg max-w-xl mb-6 flex items-start gap-2">
                                <Navigation size={20} className="mt-1 shrink-0" />
                                {route.description || 'No description provided'}
                            </p>

                            <div className="flex flex-wrap gap-4">
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Cost Per Term</p>
                                    <p className="text-2xl font-black text-white">
                                        <span className="text-lg font-normal text-indigo-300 mr-1">KES</span>
                                        {route.cost_per_term.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Students</p>
                                    <p className="text-2xl font-black text-white flex items-center gap-2">
                                        <Users size={20} />
                                        {route.student_count}
                                    </p>
                                </div>
                                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
                                    <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider mb-1">Potential Revenue</p>
                                    <p className="text-2xl font-black text-white">
                                        <span className="text-lg font-normal text-indigo-300 mr-1">KES</span>
                                        {route.potential_revenue.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Map Preview Card */}
                        <div className="relative h-64 md:h-full min-h-[300px] bg-indigo-900/40 backdrop-blur-sm rounded-2xl border-4 border-white/10 overflow-hidden shadow-inner">
                            {route.map_embed_code ? (
                                <div
                                    className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
                                    dangerouslySetInnerHTML={{ __html: route.map_embed_code }}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-indigo-200">
                                    <Map size={48} className="mb-4 opacity-50" />
                                    <p>No map preview available</p>
                                </div>
                            )}

                            {/* Overlay Controls */}
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <button
                                    onClick={() => setShowModal(true)}
                                    className="px-4 py-2 bg-white text-indigo-900 rounded-lg shadow-lg text-xs font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors"
                                >
                                    <MapPin size={14} />
                                    Edit Map
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-3 gap-6">
                {/* Left Column: Stats & Info */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <MapPin size={20} className="text-indigo-600" />
                                Pickup Points
                            </h3>
                            <button onClick={() => setShowModal(true)} className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Edit</button>
                        </div>
                        <div className="space-y-3">
                            {route.pickup_points ? (
                                route.pickup_points.split(',').map((point, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{point.trim()}</span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-sm">No specific pickup points listed.</p>
                            )}
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <Truck size={20} className="text-indigo-600" />
                            Assigned Vehicles
                        </h3>
                        <div className="space-y-3">
                            {route.assigned_vehicles && route.assigned_vehicles.length > 0 ? (
                                route.assigned_vehicles.map((v, index) => (
                                    <button
                                        key={index}
                                        onClick={() => navigate(`/transport-portal/vehicles/${v.id}`)}
                                        className="w-full flex flex-col gap-1 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700 text-left hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 font-mono">{v.plate}</span>
                                            <span className="text-xs text-slate-400">{v.model}</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                            <User size={12} />
                                            {v.driver}
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="text-center p-4">
                                    <p className="text-slate-400 text-sm">No vehicles assigned.</p>
                                    <button onClick={() => navigate('/transport-portal/vehicles')} className="text-xs text-indigo-600 font-bold mt-1">Manage Vehicles</button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
                                <DollarSign size={20} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Revenue Status</h3>
                        </div>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300 mb-4">
                            Based on currently assigned students.
                        </p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-emerald-800 dark:text-emerald-200">Term Revenue</span>
                                <span className="font-bold text-emerald-900 dark:text-emerald-100">KES {route.potential_revenue.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-emerald-800 dark:text-emerald-200">Monthly Est.</span>
                                <span className="font-bold text-emerald-900 dark:text-emerald-100">KES {(route.potential_revenue / 3).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Student List */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col h-full min-h-[500px]">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <Users size={24} className="text-indigo-600" />
                                    Assigned Students
                                    <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-bold">
                                        {students.length}
                                    </span>
                                </h3>
                            </div>

                            <div className="relative w-full sm:w-64">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                                    <Search size={16} />
                                </span>
                                <input
                                    type="text"
                                    placeholder="Search students..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-auto">
                            {filteredStudents.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Student</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Grade</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Pickup Point</th>
                                            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                                            <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {filteredStudents.map((student) => (
                                            <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                                            {student.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{student.name}</p>
                                                            <p className="text-xs text-slate-500">{student.adm}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs font-bold">
                                                        {student.grade}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                                                        <MapPin size={14} className="text-slate-400" />
                                                        {student.pickup_point || 'Default'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${student.balance < 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' :
                                                        'bg-red-100 text-red-700 dark:bg-red-900/30'
                                                        }`}>
                                                        {student.balance < 0 ? 'PAID' : 'OWING'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button
                                                        onClick={() => navigate(`/transport-portal/students/${student.id}`)}
                                                        className="text-indigo-600 hover:text-indigo-700 font-bold text-xs hover:bg-indigo-50 dark:hover:bg-indigo-900/30 px-3 py-1.5 rounded-lg transition-colors"
                                                    >
                                                        View Profile
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-12 text-center h-64">
                                    <Users size={48} className="text-slate-300 mb-4" />
                                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No students found</h3>
                                    <p className="text-slate-500 text-sm">Try searching for a different name or admission number.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white dark:bg-slate-800 rounded-3xl w-full max-w-lg shadow-2xl animate-scale-in overflow-hidden">
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Edit Route Details
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 md:p-8">
                            <form onSubmit={handleUpdate} className="space-y-5">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Route Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Cost Per Term</label>
                                        <input
                                            type="number"
                                            value={formData.cost_per_term}
                                            onChange={(e) => setFormData({ ...formData, cost_per_term: e.target.value })}
                                            required
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white font-mono font-bold"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Cost Per Month</label>
                                        <input
                                            type="number"
                                            value={formData.cost_per_month}
                                            onChange={(e) => setFormData({ ...formData, cost_per_month: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white font-mono font-bold"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Description</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        rows="2"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none"
                                    ></textarea>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Pickup Points</label>
                                    <textarea
                                        value={formData.pickup_points}
                                        onChange={(e) => setFormData({ ...formData, pickup_points: e.target.value })}
                                        rows="4"
                                        placeholder="Comma-separated pickup points..."
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none"
                                    ></textarea>
                                    <p className="text-xs text-slate-400 mt-1 ml-1">Separate points with commas (e.g. Kencom, Railways, Westlands)</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Route Map Embed Code</label>
                                    <textarea
                                        value={formData.map_embed_code}
                                        onChange={(e) => setFormData({ ...formData, map_embed_code: e.target.value })}
                                        rows="3"
                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white resize-none font-mono text-xs"
                                    ></textarea>
                                </div>

                                <div className="pt-2 flex gap-3">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20">
                                        Update Details
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransportRouteDetail;
