import React from 'react';
import { ScreenProps } from './types';
import { ChevronLeft, Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export function ParentHistoryScreen({ navigateTo, userData }: ScreenProps) {

    // Format history from userData
    const historyLogs = Object.entries(userData.brushingLogs || {})
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 14) // Last 14 days
        .map(([date, logs]: any) => {
            const dateObj = new Date(date);
            return {
                date,
                dayName: dateObj.toLocaleDateString('en-US', { weekday: 'long' }),
                shortDate: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                morning: logs.morning,
                evening: logs.evening,
                perfect: logs.morning && logs.evening
            };
        });

    return (
        <div className="h-full bg-gradient-to-b from-purple-50 to-white flex flex-col relative overflow-hidden">
            {/* Background Bubbles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                {[...Array(4)].map((_, i) => (
                    <motion.div key={`bg-bubble-${i}`} className="absolute rounded-full blur-[80px] mix-blend-multiply"
                        style={{ background: ['#E9D5FF', '#C4B5FD', '#FBCFE8', '#BAE6FD'][i % 4], opacity: 0.6, width: 300 + i * 50, height: 300 + i * 50, left: ['-10%', '60%', '10%', '70%'][i], top: ['10%', '20%', '70%', '80%'][i] }}
                        animate={{ x: [0, 80, 0, -80, 0], y: [0, -80, 0, 80, 0], scale: [1, 1.1, 1] }}
                        transition={{ duration: 20 + i * 5, repeat: Infinity, ease: 'linear' }} />
                ))}
            </div>

            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-purple-100 px-5 py-4 z-10 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigateTo('parent-dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-purple-50 hover-float active-pop transition-all">
                        <ChevronLeft className="w-6 h-6 text-purple-700" />
                    </button>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Brushing History</h1>
                </div>
                <div className="bg-purple-100 w-10 h-10 rounded-xl flex items-center justify-center">
                    <CalendarIcon className="w-5 h-5 text-purple-600" />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-6 space-y-6 relative z-10">

                {/* Summary Card */}
                <div className="bg-white/90 backdrop-blur-md rounded-[2rem] p-6 shadow-xl border border-purple-100 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest mb-1">Last 14 Days</p>
                        <h2 className="text-3xl font-black text-gray-900">{historyLogs.filter(l => l.perfect).length} <span className="text-lg text-gray-400">Perfect</span></h2>
                    </div>
                    <div className="flex gap-2">
                        <div className="w-12 h-12 bg-amber-50 rounded-2xl flex flex-col items-center justify-center border border-amber-100">
                            <span className="text-xs font-black text-amber-600">{historyLogs.filter(l => l.morning).length}</span>
                            <span className="text-[8px] font-black uppercase text-amber-500 tracking-widest">AM</span>
                        </div>
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex flex-col items-center justify-center border border-indigo-100">
                            <span className="text-xs font-black text-indigo-600">{historyLogs.filter(l => l.evening).length}</span>
                            <span className="text-[8px] font-black uppercase text-indigo-500 tracking-widest">PM</span>
                        </div>
                    </div>
                </div>

                {/* Timeline Log */}
                <div className="space-y-4 relative">
                    {/* Vertical line */}
                    <div className="absolute top-0 bottom-0 left-[26px] w-1 bg-gradient-to-b from-purple-100 via-purple-200 to-transparent rounded-full z-0"></div>

                    {historyLogs.map((log: any, i: number) => (
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            key={log.date}
                            className="relative flex items-center gap-3 z-10"
                        >
                            {/* Timeline dot */}
                            <div className="w-14 shrink-0 flex items-center justify-center pl-1">
                                <div className={`w-5 h-5 rounded-full border-[3px] border-white shadow-md transition-all duration-300 transform hover:scale-125 ${log.perfect ? 'bg-emerald-400' : (log.morning || log.evening ? 'bg-amber-400' : 'bg-gray-300')}`}>
                                </div>
                            </div>

                            {/* Card */}
                            <div className="flex-1 p-4 rounded-[1.5rem] bg-white/90 backdrop-blur-md shadow-lg border border-purple-100/50 hover-float cursor-pointer transition-all hover:shadow-xl hover:border-purple-300 active-pop">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <h4 className="font-black text-gray-900 text-sm tracking-tight">{log.dayName}</h4>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-purple-400/80">{log.shortDate}</p>
                                    </div>
                                    {log.perfect ?
                                        <div className="bg-emerald-50 px-2 py-1.5 rounded-xl border border-emerald-100 flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                            <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Perfect</span>
                                        </div>
                                        : (!log.morning && !log.evening) ?
                                            <div className="bg-gray-50 px-2 py-1.5 rounded-xl border border-gray-200 flex items-center gap-1">
                                                <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
                                                <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Missed</span>
                                            </div>
                                            : null
                                    }
                                </div>

                                <div className="flex gap-2">
                                    <div className={`flex-1 rounded-xl p-2.5 flex items-center justify-center gap-2 border ${log.morning ? 'bg-amber-50 border-amber-200/50 shadow-sm' : 'bg-gray-50 border-transparent opacity-50'}`}>
                                        <span className="text-sm">🌅</span>
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${log.morning ? 'text-amber-700' : 'text-gray-400'}`}>AM</span>
                                    </div>
                                    <div className={`flex-1 rounded-xl p-2.5 flex items-center justify-center gap-2 border ${log.evening ? 'bg-indigo-50 border-indigo-200/50 shadow-sm' : 'bg-gray-50 border-transparent opacity-50'}`}>
                                        <span className="text-sm">🌙</span>
                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${log.evening ? 'text-indigo-700' : 'text-gray-400'}`}>PM</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    {historyLogs.length === 0 && (
                        <div className="text-center p-10 bg-white/90 backdrop-blur-md rounded-[2.5rem] shadow-sm border border-purple-100/50">
                            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-400 font-bold">No brushing history yet.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
