import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
    User, BookOpen, Calendar, Mail, Phone, Briefcase, MapPin, Shield
} from 'lucide-react';
import axios from 'axios';

const TeacherProfile = () => {
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

        if (id) fetchTeacherData();
    }, [id]);

    if (loading) return <div className="p-10 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    if (!teacher) return <div className="p-10 text-center">Profile not found.</div>;

    const InfoRow = ({ label, value, icon: Icon }) => (
        <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            {Icon && <Icon className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />}
            <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">{value || 'N/A'}</p>
            </div>
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 pb-20">
            <div className="mb-2 md:mb-6">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">My Profile</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1 md:mt-2 text-sm md:text-base">View and manage your personal details.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Left Column: Identity Card */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center">
                        <div className="w-24 h-24 md:w-32 md:h-32 mb-4 md:mb-6 relative">
                            {teacher.personal.avatar ? (
                                <img src={teacher.personal.avatar} alt="Profile" className="w-full h-full rounded-full object-cover shadow-lg ring-4 ring-white dark:ring-slate-700" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center text-3xl md:text-4xl font-bold text-indigo-600 shadow-inner">
                                    {teacher.personal.first_name[0]}{teacher.personal.last_name[0]}
                                </div>
                            )}
                            <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 md:w-6 md:h-6 rounded-full border-4 border-white dark:border-slate-800" title="Active"></div>
                        </div>

                        <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-1">{teacher.personal.full_name}</h2>
                        <p className="text-sm md:text-base text-indigo-600 dark:text-indigo-400 font-medium mb-4">{teacher.professional.position}</p>

                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                {teacher.professional.status}
                            </span>
                            {teacher.professional.is_class_teacher && (
                                <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 rounded-full text-xs font-semibold text-blue-600 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
                                    CT: {teacher.professional.grade_assigned}
                                </span>
                            )}
                        </div>

                        <div className="w-full grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-700 pt-6">
                            <div className="text-center">
                                <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{teacher.professional.subjects?.length || 0}</div>
                                <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide">Subjects</div>
                            </div>
                            <div className="text-center border-l border-slate-100 dark:border-slate-700">
                                <div className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{teacher.schedule?.length || 0}</div>
                                <div className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wide">Classes/Wk</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Details Grid */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Info */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="px-4 md:px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm md:text-base">
                                <User size={18} className="text-indigo-500" /> Personal Information
                            </h3>
                        </div>
                        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow label="Full Name" value={teacher.personal.full_name} />
                            <InfoRow label="Email Address" value={teacher.personal.email} icon={Mail} />
                            <InfoRow label="Phone Number" value={teacher.personal.phone} icon={Phone} />
                            <InfoRow label="National ID / Passport" value={teacher.personal.national_id} icon={Shield} />
                            <InfoRow label="Gender" value={teacher.personal.gender_display} />
                            <InfoRow label="Date of Birth" value={teacher.personal.dob} />
                            <InfoRow label="Marital Status" value={teacher.personal.marital_status} />
                            <InfoRow label="Nationality" value={teacher.personal.nationality} />
                            <InfoRow label="Address" value={teacher.personal.address} icon={MapPin} />
                            <InfoRow label="Religion" value={teacher.personal.religion} />
                        </div>
                    </div>

                    {/* Professional Info */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="px-4 md:px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm md:text-base">
                                <Briefcase size={18} className="text-indigo-500" /> Professional Details
                            </h3>
                        </div>
                        <div className="p-4 md:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InfoRow label="TSC Number" value={teacher.personal.tsc_number} icon={Shield} />
                            <InfoRow label="Position" value={teacher.professional.position_display} />
                            <InfoRow label="Department" value={teacher.professional.department_name} />
                            <InfoRow label="Campus / Branch" value={teacher.professional.branch_name} />
                            <InfoRow label="Date Joined" value={teacher.professional.date_joined} icon={Calendar} />
                            <InfoRow label="Experience" value={`${teacher.professional.years_of_experience || 0} Years`} />
                            <InfoRow label="Qualifications" value={teacher.professional.qualifications_display} />
                            <InfoRow label="Employment Status" value={teacher.professional.status} />
                        </div>
                    </div>

                    {/* Subjects */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="px-4 md:px-6 py-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                            <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm md:text-base">
                                <BookOpen size={18} className="text-indigo-500" /> Assigned Subjects
                            </h3>
                        </div>
                        <div className="p-4 md:p-6">
                            {teacher.professional.subjects && teacher.professional.subjects.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {teacher.professional.subjects.map((sub, idx) => (
                                        <span key={idx} className="px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs md:text-sm font-medium border border-indigo-100 dark:border-indigo-800">
                                            {sub.name} ({sub.code})
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 italic text-sm">No subjects assigned.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TeacherProfile;
