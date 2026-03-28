import React, { useState } from 'react';
import { ScreenProps } from './types';
import { ChevronLeft, Trophy, Star, TrendingUp, Flame, Crown } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { motion } from 'framer-motion';

export function TeacherLeaderboardScreen({ navigateTo, userData }: ScreenProps) {
    const [filter, setFilter] = useState<'stars' | 'streak'>('stars');

    const mockLeaderboard = [
        { id: 4, name: 'Leo Lion', stars: 2100, streak: 45, character: '1' },
        { id: 2, name: 'Alex Archer', stars: 1450, streak: 30, character: '2' },
        { id: 6, name: 'Kai Blaze', stars: 1320, streak: 28, character: '3' },
        { id: 1, name: userData.name || 'Hero', stars: userData.totalStars, streak: userData.currentStreak, character: userData.selectedCharacter },
        { id: 3, name: 'Luna Light', stars: 890, streak: 12, character: '3' },
        { id: 5, name: 'Mia Storm', stars: 540, streak: 5, character: '2' },
    ];

    const sortedLeaderboard = [...mockLeaderboard].sort((a, b) => b[filter] - a[filter]);

    return (
        <div className="h-full bg-gradient-to-b from-blue-50 to-white flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-blue-100 px-5 py-4 z-10 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigateTo('teacher-dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-blue-50 transition-all hover-float active-pop">
                        <ChevronLeft className="w-6 h-6 text-blue-700" />
                    </button>
                    <h1 className="text-xl font-black text-gray-900 tracking-tight">Class Leaderboard</h1>
                </div>
                <div className="bg-amber-100 w-10 h-10 rounded-xl flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-amber-600" />
                </div>
            </div>

            {/* Filter Toggle */}
            <div className="px-5 pt-5 pb-2">
                <div className="bg-gray-100 p-1 rounded-2xl flex relative shadow-inner">
                    <button
                        onClick={() => setFilter('stars')}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest relative z-10 transition-colors ${filter === 'stars' ? 'text-amber-700' : 'text-gray-400'}`}
                    >
                        Total Stars
                    </button>
                    <button
                        onClick={() => setFilter('streak')}
                        className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest relative z-10 transition-colors ${filter === 'streak' ? 'text-orange-700' : 'text-gray-400'}`}
                    >
                        Highest Streak
                    </button>
                    <div
                        className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-xl shadow-md transition-transform duration-300 ${filter === 'streak' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'}`}
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4 space-y-4">

                {/* Top 3 Podium area */}
                <div className="flex items-end justify-center gap-3 pt-6 pb-8 h-48">
                    {/* 2nd Place */}
                    {sortedLeaderboard[1] && (
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
                            <div className="relative mb-2">
                                <UserAvatar characterId={Number(sortedLeaderboard[1].character)} showBackground={false} className="w-14 h-14 bg-gray-100 rounded-[1.2rem] border-4 border-gray-300 shadow-md" />
                                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-sm">2</div>
                            </div>
                            <div className="w-20 bg-gradient-to-t from-blue-200 to-blue-50 rounded-t-xl h-20 shadow-inner border-t-4 border-gray-300 flex flex-col items-center justify-start pt-2">
                                <span className="text-[10px] font-black text-gray-500 truncate w-16 text-center">{sortedLeaderboard[1].name.split(' ')[0]}</span>
                                <div className="flex items-center gap-1 mt-1">
                                    {filter === 'stars' ? <Star className="w-3 h-3 text-amber-500 fill-amber-400" /> : <Flame className="w-3 h-3 text-orange-500 fill-orange-400" />}
                                    <span className="text-xs font-black text-gray-700">{sortedLeaderboard[1][filter]}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* 1st Place */}
                    {sortedLeaderboard[0] && (
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-col items-center z-10">
                            <div className="relative mb-2">
                                <Crown className="w-8 h-8 text-amber-500 absolute -top-6 -left-1 transform -rotate-12 drop-shadow-md z-20" />
                                <UserAvatar characterId={Number(sortedLeaderboard[0].character)} showBackground={false} className="w-16 h-16 bg-amber-50 rounded-[1.4rem] border-4 border-amber-400 shadow-xl" />
                                <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-amber-400 rounded-full flex items-center justify-center text-amber-900 text-xs font-black shadow-sm">1</div>
                            </div>
                            <div className="w-24 bg-gradient-to-t from-blue-300 to-blue-100 rounded-t-2xl h-28 shadow-lg border-t-4 border-amber-400 flex flex-col items-center justify-start pt-3">
                                <span className="text-xs font-black text-blue-900 truncate w-20 text-center">{sortedLeaderboard[0].name.split(' ')[0]}</span>
                                <div className="flex items-center gap-1 mt-1 bg-white/50 px-2 py-0.5 rounded-full">
                                    {filter === 'stars' ? <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> : <Flame className="w-4 h-4 text-orange-500 fill-orange-400" />}
                                    <span className="text-sm font-black text-amber-700">{sortedLeaderboard[0][filter]}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* 3rd Place */}
                    {sortedLeaderboard[2] && (
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="flex flex-col items-center">
                            <div className="relative mb-2">
                                <UserAvatar characterId={Number(sortedLeaderboard[2].character)} showBackground={false} className="w-12 h-12 bg-orange-50 rounded-[1rem] border-4 border-orange-300 shadow-sm" />
                                <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-orange-300 rounded-full flex items-center justify-center text-orange-900 text-[10px] font-black shadow-sm">3</div>
                            </div>
                            <div className="w-20 bg-gradient-to-t from-blue-100 to-white rounded-t-xl h-16 shadow-inner border-t-4 border-orange-300 flex flex-col items-center justify-start pt-2">
                                <span className="text-[10px] font-black text-gray-500 truncate w-16 text-center">{sortedLeaderboard[2].name.split(' ')[0]}</span>
                                <div className="flex items-center gap-1 mt-1">
                                    {filter === 'stars' ? <Star className="w-3 h-3 text-amber-500 fill-amber-400" /> : <Flame className="w-3 h-3 text-orange-500 fill-orange-400" />}
                                    <span className="text-xs font-black text-gray-700">{sortedLeaderboard[2][filter]}</span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* List of remaining students */}
                <div className="bg-white rounded-[2rem] shadow-xl border border-blue-50 overflow-hidden mt-4">
                    {sortedLeaderboard.slice(3).map((student, index) => (
                        <div key={student.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0 hover-float active-pop cursor-pointer">
                            <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 font-black text-xs">
                                {index + 4}
                            </div>
                            <UserAvatar characterId={Number(student.character)} showBackground={false} className="w-10 h-10 bg-blue-50 rounded-xl" />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-black text-gray-900 text-sm truncate">{student.name}</h4>
                            </div>
                            <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-100">
                                {filter === 'stars' ? <Star className="w-4 h-4 text-amber-500 fill-amber-400" /> : <Flame className="w-4 h-4 text-orange-500 fill-orange-400" />}
                                <span className="text-sm font-black text-amber-700">{student[filter]}</span>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}
