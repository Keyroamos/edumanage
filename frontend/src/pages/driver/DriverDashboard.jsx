
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Phone, MapPin, Truck, AlertTriangle } from 'lucide-react';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix for Leaflet default icon not appearing
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const DriverDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const res = await axios.get('/api/transport/driver/dashboard/');
            setData(res.data);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to load dashboard. Ensure you are assigned a vehicle.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
        </div>
    );

    if (error) return (
        <div className="p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-500 mb-4">
                <AlertTriangle size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Access Error</h3>
            <p className="text-slate-500">{error}</p>
        </div>
    );

    const handleSetLocation = (studentId) => {
        if (!navigator.geolocation) {
            alert('Geolocation is not supported by your browser');
            return;
        }

        const confirmUpdate = window.confirm("Are you at the student's pickup point right now? This will save your current GPS location.");
        if (!confirmUpdate) return;

        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const { latitude, longitude } = position.coords;
                await axios.post(`/api/transport/student/${studentId}/location/update/`, {
                    lat: latitude,
                    lng: longitude
                });
                alert('Location saved successfully!');
                fetchDashboard();
            } catch (err) {
                console.error(err);
                alert('Failed to save location. Please try again.');
            }
        }, (err) => {
            console.error(err);
            alert('Unable to retrieve location. Please enable GPS permissions.');
        }, { enableHighAccuracy: true });
    };

    const validMarkers = (data?.students || []).filter(s => s.lat && s.lng && (s.lat !== 0 || s.lng !== 0));
    const center = validMarkers.length > 0
        ? [validMarkers[0].lat, validMarkers[0].lng]
        : [-1.2921, 36.8219];

    return (
        <div className="space-y-6 pb-20 animate-fade-in-up">
            {/* Vehicle Card */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 dark:bg-indigo-900/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <div className="relative z-10">
                    <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">Assigned Vehicle</p>
                    <div className="flex justify-between items-end">
                        <div>
                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 font-mono tracking-tight">{data?.vehicle?.plate || 'N/A'}</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">{data?.vehicle?.model || 'Unknown Model'}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-bold">
                                {data?.vehicle?.capacity || 0} Seats
                            </span>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Truck size={18} className="text-indigo-500" />
                        <span className="font-bold">{data?.route?.name || 'Unassigned Route'}</span>
                    </div>
                </div>
            </div>

            {/* Map */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg border border-slate-100 dark:border-slate-700 overflow-hidden h-[400px] z-0 relative">
                {validMarkers.length > 0 ? (
                    <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {validMarkers.map(student => (
                            <Marker key={student.id} position={[student.lat, student.lng]}>
                                <Popup>
                                    <div className="text-center min-w-[150px]">
                                        <b className="block mb-1 text-sm">{student.name}</b>
                                        <span className="text-xs text-slate-500 block">{student.pickup_point}</span>
                                        {student.phone !== 'N/A' && (
                                            <a href={`tel:${student.phone}`} className="inline-block mt-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md font-bold">
                                                Call Parent
                                            </a>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center bg-slate-50 dark:bg-slate-900/50">
                        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                            <MapPin size={32} className="opacity-50" />
                        </div>
                        <p className="font-medium text-slate-600 dark:text-slate-300">No GPS coordinates found</p>
                        <p className="text-sm mt-1 mb-4">Use the list below to set pickup locations.</p>
                    </div>
                )}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-sm z-[400]">
                    {validMarkers.length} Markers
                </div>
            </div>

            {/* Student List */}
            <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white px-1 mb-4 flex items-center gap-2">
                    <MapPin size={20} className="text-indigo-600" />
                    Pickup List ({(data?.students || []).length})
                </h3>
                <div className="space-y-3">
                    {(data?.students || []).map((student, index) => (
                        <div key={student.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4 flex-1">
                                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-400 text-lg shadow-inner shrink-0">
                                    {index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-slate-900 dark:text-white truncate">{student.name}</h4>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-start gap-1 mt-0.5">
                                        <MapPin size={14} className="mt-0.5 shrink-0" />
                                        <span className="truncate">{student.pickup_point || 'No point set'}</span>
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pl-16 sm:pl-0">
                                {(!student.lat || !student.lng) ? (
                                    <button
                                        onClick={() => handleSetLocation(student.id)}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                                    >
                                        <MapPin size={14} />
                                        Set Location
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleSetLocation(student.id)}
                                        className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
                                    >
                                        Update
                                    </button>
                                )}

                                {student.phone !== 'N/A' && (
                                    <a href={`tel:${student.phone}`} className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors shadow-sm">
                                        <Phone size={20} />
                                    </a>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
