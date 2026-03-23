import React, { useState } from 'react';
import { ScreenProps } from './types';
import { ChevronLeft, Star, Heart, TrendingUp, AlertCircle, Medal, Calendar } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { motion } from 'framer-motion';

export function TeacherStudentDetailScreen({ navigateTo, userData, selectedStudent }: any) {
    // Determine which student we are viewing. 
    // Fallback to userData if arrived directly (e.g. reload)
    const fallbackStudent = {
        name: userData.name || 'Hero',
        level: userData.level || 12,
        stars: userData.totalStars || 1450,
        character: userData.selectedCharacter || 1,
        health: userData.enamelHealth || 88,
        streak: userData.currentStreak || 5,
        lastActive: 'Today, 8:30 AM'
    };

    const student = selectedStudent || fallbackStudent;

    // In actual implementation lastActive and streak would be passed in 
    // via selectedStudent object. We fallback here for the mockup UI.
    const lastActive = student.lastActive || 'Today, 8:30 AM';
    const streak = student.streak || 3;

    const recentLogs = [
        { date: 'Today', morning: true, evening: false, status: 'partial' },
        { date: 'Yesterday', morning: true, evening: true, status: 'perfect' },
        { date: 'Mon', morning: false, evening: true, status: 'partial' },
    ];

    return (
        <div className="h-full bg-gradient-to-b from-blue-50 to-white flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-blue-100 px-5 py-4 z-10 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigateTo('teacher-dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-blue-50 transition-all hover-float active-pop">
                        <ChevronLeft className="w-6 h-6 text-blue-700" />
                    </button>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Student Profile</h1>
                </div>
                <div className="bg-blue-100 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-700">Online</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-6 space-y-6">

                {/* Hero Card */}
                <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-gray-100 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-blue-400 to-indigo-500"></div>

                    <div className="relative pt-6 flex flex-col items-center">
                        <div className="relative mt-2">
                            <motion.div
                                className="w-20 h-20 rounded-[1.75rem] bg-white p-1 shadow-lg relative z-10 mx-auto"
                                whileHover={{ scale: 1.05, rotate: 5 }}
                            >
                                <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-blue-50 flex items-center justify-center border-[1.5px] border-transparent">
                                    <UserAvatar characterId={Number(student.character)} showBackground={false} className="w-16 h-16 object-cover scale-125 translate-y-2" />
                                </div>
                            </motion.div>
                            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center gap-1 shadow-md border-[1.5px] border-white z-30 group cursor-help transition-all hover:scale-110 whitespace-nowrap">
                                <span className="text-[8px] font-black text-amber-100 uppercase tracking-widest leading-none mr-0.5">Lvl</span>
                                <span className="text-xs font-black text-white leading-none">{student.level}</span>
                            </div>
                        </div>

                        <div className="pt-5 text-center w-full px-4">
                            <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-sm border border-gray-100 py-2.5 px-4 mx-auto max-w-[200px]">
                                <h2 className="text-lg font-black text-gray-900 leading-tight truncate">{student.name}</h2>
                                <p className="text-[9px] font-bold text-gray-400 mt-0.5 uppercase tracking-widest">{lastActive}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 w-full mt-4">
                            <div className="flex-1 bg-amber-50 rounded-2xl p-3 flex flex-col items-center border border-amber-100">
                                <Star className="w-6 h-6 text-amber-500 fill-amber-400 mb-1" />
                                <span className="text-lg font-black text-amber-700">{student.stars}</span>
                                <span className="text-[9px] font-black uppercase text-amber-600/70 tracking-widest">Stars</span>
                            </div>
                            <div className="flex-1 bg-orange-50 rounded-2xl p-3 flex flex-col items-center border border-orange-100">
                                <TrendingUp className="w-6 h-6 text-orange-500 mb-1" />
                                <span className="text-lg font-black text-orange-700">{streak} Days</span>
                                <span className="text-[9px] font-black uppercase text-orange-600/70 tracking-widest">Streak</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Health Status */}
                <div>
                    <div className="flex justify-between items-end mb-3 px-1">
                        <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px]">Enamel Health</h3>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg ${student.health >= 80 ? 'bg-emerald-100 text-emerald-600' : student.health >= 50 ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>{student.health}%</span>
                    </div>
                    <div className="bg-white rounded-[2rem] p-5 shadow-xl border border-gray-100">
                        <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden p-1 shadow-inner w-full mb-3">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 shadow-sm animate-liquid ${student.health === 100
                                    ? 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-500'
                                    : student.health >= 70
                                        ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400'
                                        : student.health >= 30
                                            ? 'bg-gradient-to-r from-orange-400 via-red-500 to-orange-400'
                                            : 'bg-gradient-to-r from-red-600 via-pink-600 to-red-600'
                                    }`}
                                style={{ width: `${student.health}%` }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 font-medium text-center">
                            {student.health >= 80 ? 'Excellent condition! Keep up the great work.' : 'Needs a bit more attention to brushing routines.'}
                        </p>
                    </div>
                </div>

                {/* Recent Activity Log */}
                <div>
                    <div className="flex justify-between items-end mb-3 px-1">
                        <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px]">Recent Brushing</h3>
                        <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest">View All</button>
                    </div>
                    <div className="bg-white rounded-[2rem] shadow-xl border border-gray-100 overflow-hidden">
                        {recentLogs.map((log, idx) => (
                            <div key={idx} className={`p-4 flex items-center justify-between ${idx !== recentLogs.length - 1 ? 'border-b border-gray-50' : ''}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${log.status === 'perfect' ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                                        <Calendar className={`w-5 h-5 ${log.status === 'perfect' ? 'text-emerald-600' : 'text-amber-600'}`} />
                                    </div>
                                    <span className="font-bold text-sm text-gray-900">{log.date}</span>
                                </div>
                                <div className="flex gap-2">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${log.morning ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-400'}`}>AM</div>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black ${log.evening ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-400'}`}>PM</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-colors hover-float active-pop flex items-center justify-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Send Reminder
                    </button>
                    <button className="flex-1 bg-amber-100 hover:bg-amber-200 text-amber-700 py-4 rounded-xl font-black text-xs uppercase tracking-widest transition-colors hover-float active-pop flex items-center justify-center gap-2">
                        <Medal className="w-4 h-4" /> Award Badge
                    </button>
                </div>
            </div>
        </div>
    );
}
