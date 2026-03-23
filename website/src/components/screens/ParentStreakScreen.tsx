import React from 'react';
import { ScreenProps } from './types';
import { ChevronLeft, Flame, Trophy, Calendar, Target, TrendingUp, Info, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export function ParentStreakScreen({ navigateTo, userData }: ScreenProps) {
    const now = new Date();
    const weekDays = [...Array(7)].map((_, i) => {
        const d = new Date();
        d.setDate(now.getDate() - (6 - i));
        const dateStr = d.toISOString().split('T')[0];
        const log = (userData.brushingLogs as any)?.[dateStr];
        return {
            day: d.toLocaleDateString('en-US', { weekday: 'short' }),
            date: d.getDate(),
            completed: log ? (log.morning || log.evening) : false
        };
    });

    return (
        <div className="h-full bg-gradient-to-b from-purple-50 to-white flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-purple-100 px-5 py-4 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigateTo('parent-dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-purple-50 hover-float active-pop transition-all">
                        <ChevronLeft className="w-6 h-6 text-purple-700" />
                    </button>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Hero's Streak</h1>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-6 space-y-6">

                {/* Hero Current Streak */}
                <div className="rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden text-center" style={{ background: 'linear-gradient(135deg, #FFB86C 0%, #FF6AC1 100%)' }}>
                    <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-[2rem] flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/30 transform hover:scale-105 transition-transform">
                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                            <Flame className="w-12 h-12 fill-white text-white drop-shadow-md" />
                        </motion.div>
                    </div>
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', bounce: 0.5 }}
                        className="text-7xl font-black text-white drop-shadow-lg mb-2 leading-none"
                    >
                        {userData.currentStreak}
                    </motion.div>
                    <h3 className="text-xl font-black text-white/95 uppercase tracking-widest mb-2">Days Strong</h3>
                    <p className="text-white/90 text-sm font-medium">
                        {userData.name || 'Your Hero'} is building amazing habits!
                    </p>
                </div>

                {/* Parent Tip */}
                <div className="bg-purple-100/50 border border-purple-200 rounded-[2rem] p-5 flex gap-4 items-start shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-purple-200 flex items-center justify-center flex-shrink-0">
                        <Info className="w-5 h-5 text-purple-700" />
                    </div>
                    <div>
                        <h4 className="font-black text-purple-900 text-sm mb-1 uppercase tracking-wider">Parent Tip</h4>
                        <p className="text-sm text-purple-800/80 font-medium leading-relaxed">
                            Praise the effort, not just the streak! If they miss a day, gently encourage them to start a new streak tomorrow.
                        </p>
                    </div>
                </div>

                {/* This week tracker */}
                <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100">
                    <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px] mb-4 text-center">This Week's Consistency</h3>
                    <div className="grid grid-cols-7 gap-2">
                        {weekDays.map((day, i) => (
                            <div key={i} className="text-center group">
                                <div className="text-[10px] font-black uppercase text-gray-400 mb-2 transition-colors group-hover:text-purple-500">{day.day}</div>
                                <div
                                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center transition-all duration-300 ${day.completed
                                        ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg transform group-hover:-translate-y-1'
                                        : 'bg-gray-100 text-gray-400'
                                        }`}
                                >
                                    {day.completed ? (
                                        <Flame className="w-5 h-5 fill-current drop-shadow-md" />
                                    ) : (
                                        <span className="text-xs font-black">{day.date}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { icon: Trophy, label: 'Record Streak', value: `${userData.bestStreak} Days`, color: 'from-amber-400 to-orange-500', bg: 'bg-amber-50' },
                        { icon: Shield, label: 'Total Brushing', value: `${userData.totalDays} Days`, color: 'from-purple-400 to-purple-600', bg: 'bg-purple-50' },
                    ].map((stat, i) => {
                        const Icon = stat.icon;
                        return (
                            <div key={i} className={`rounded-[2rem] p-5 shadow-sm border border-gray-100 text-center relative overflow-hidden ${stat.bg} group hover-float active-pop cursor-pointer`}>
                                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl mb-3 flex items-center justify-center mx-auto shadow-md group-hover:scale-110 transition-transform`}>
                                    <Icon className="w-7 h-7 text-white drop-shadow-sm" />
                                </div>
                                <div className="text-xl font-black text-gray-900 mb-0.5">{stat.value}</div>
                                <div className="text-[9px] font-black uppercase tracking-widest text-gray-500">{stat.label}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
