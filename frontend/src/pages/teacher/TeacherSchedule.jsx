import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Users } from 'lucide-react';
import axios from 'axios';

const TeacherSchedule = () => {
    const { id } = useParams();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTeacherData = async () => {
            try {
                const response = await axios.get(`/api/teachers/${id}/`);
                setTeacher(response.data.teacher);
            } catch (error) {
                console.error("Error fetching teacher:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTeacherData();
    }, [id]);

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    if (!teacher) return <div className="p-10 text-center">Profile not found.</div>;

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20">
            <div className="mb-2 md:mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">Weekly Schedule</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 md:mt-2 text-sm md:text-base">Your teaching timetable.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-6 shadow-sm border border-slate-100 dark:border-slate-700">
                {teacher.schedule && teacher.schedule.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {teacher.schedule.map(cls => (
                            <div key={cls.id} className="flex gap-4 p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all">
                                <div className="flex flex-col items-center justify-center w-14 md:w-16 bg-slate-50 dark:bg-slate-700 rounded-lg text-center aspect-square shrink-0">
                                    <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">{cls.day.substring(0, 3)}</span>
                                    <span className="font-bold text-indigo-600 text-base md:text-lg">{cls.time.split(':')[0]}</span>
                                </div>
                                <div className="flex flex-col justify-center min-w-0">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-base md:text-lg truncate">{cls.subject}</h4>
                                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-0.5 md:mt-1">
                                        <Users size={14} className="shrink-0" />
                                        <span className="font-medium bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-xs truncate">{cls.grade}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="bg-slate-50 dark:bg-slate-700/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={32} className="text-slate-300 dark:text-slate-500" />
                        </div>
                        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No Schedule Found</h3>
                        <p className="text-slate-500 italic">No classes have been scheduled for you this week.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TeacherSchedule;
