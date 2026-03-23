import React, { useState, useEffect } from 'react';
import { ScreenProps } from './types';
import { Shield, Bell, Settings, LogOut, Flame, Star, TrendingUp, Sparkles, Bot, Wand2, Home, BarChart2, Users, Heart, ChevronRight, Target, Check, Zap, History, Calendar, Award } from 'lucide-react';
import { useAuth, API_URL } from '../../context/AuthContext';
import { UserAvatar } from '../common/UserAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from '../AnimatedBackground';

// ─── HOME TAB ──────────────────────────────────────────────────────
function ParentHomeTab({ userData, navigateTo, displayChild, currentUser }: any) {
    const [currentTip, setCurrentTip] = useState("Great job! Your child brushed consistently this week. Try scheduling a 'Duo Brushing' tonight to keep the streak alive!");
    const [isAnimatingTip, setIsAnimatingTip] = useState(false);

    const PARENT_TIPS = [
        "Great job! Your child brushed consistently this week. Try scheduling a 'Duo Brushing' tonight to keep the streak alive!",
        "Tip: Replacing your child's toothbrush every 3 months keeps the Sugar Bugs away for good!",
        "Did you know? Children who brush together with parents are 60% more likely to maintain good habits.",
        "Your child's Enamel Health is great! Keep reinforcing positive habits with small rewards.",
        "Reminder: Limit sugary drinks before bedtime to protect those precious teeth overnight!",
    ];

    const getNewTip = () => {
        setIsAnimatingTip(true);
        setTimeout(() => {
            const available = PARENT_TIPS.filter(t => t !== currentTip);
            setCurrentTip(available[Math.floor(Math.random() * available.length)]);
            setIsAnimatingTip(false);
        }, 500);
    };

    const MOCK_BRUSHING_LOGS = [
        { date: '2026-03-17', morning: true, evening: true },
        { date: '2026-03-16', morning: true, evening: false },
        { date: '2026-03-15', morning: true, evening: true },
        { date: '2026-03-14', morning: false, evening: true },
        { date: '2026-03-13', morning: true, evening: true },
    ];

    const realActivity = Object.entries(userData.brushingLogs || {})
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 5)
        .map(([date, logs]: any) => ({ date, morning: logs.morning, evening: logs.evening }));

    // Always show mock data if there's no real brushing data yet
    const recentActivity = realActivity.length > 0 ? realActivity : MOCK_BRUSHING_LOGS;

    return (
        <div className="space-y-6">
            {/* Brushing History */}
            <div className="relative">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-100/50 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center gap-2 mb-4 px-1">
                    <div className="w-6 h-6 rounded-lg bg-purple-100 flex items-center justify-center">
                        <Shield className="w-3.5 h-3.5 text-purple-600" />
                    </div>
                    <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px]">Brushing History</h3>
                </div>
                <div
                    onClick={() => navigateTo('parent-history')}
                    className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden divide-y divide-gray-50 cursor-pointer hover-float active-pop hover:border-purple-200 transition-all relative z-10"
                >
                    {recentActivity.map((log: any) => (
                        <div key={log.date} className="p-5 flex items-center justify-between hover:bg-purple-50/50 transition-colors">
                            <div>
                                <p className="font-black text-gray-900 text-sm">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                                <p className="text-[9px] text-purple-500 font-black uppercase tracking-widest mt-0.5">{log.morning && log.evening ? '✅ Perfect Day' : log.morning || log.evening ? '⚠️ Partial' : '❌ Missed'}</p>
                            </div>
                            <div className="flex gap-3">
                                <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-[9px] font-black shadow-sm border ${log.morning ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                                    <span className="text-base">🌅</span>AM
                                </div>
                                <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center text-[9px] font-black shadow-sm border ${log.evening ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>
                                    <span className="text-base">🌙</span>PM
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Hero Stats */}
            <div>
                <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px] mb-4 px-1">Hero Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div
                        onClick={() => navigateTo('progress')}
                        className="bg-white rounded-[2rem] p-5 shadow-xl border border-gray-100 relative overflow-hidden cursor-pointer hover-float active-pop hover:border-purple-200 transition-all group"
                    >
                        <div className="absolute -right-3 -top-3 w-14 h-14 bg-purple-100 rounded-full opacity-60 group-hover:scale-110 transition-transform" />
                        <p className="text-[9px] font-black text-purple-600 uppercase tracking-widest mb-1">Current Level</p>
                        <p className="text-4xl font-black text-gray-900 group-hover:text-purple-700 transition-colors">{displayChild.level}</p>
                        <p className="text-[9px] text-gray-400 font-bold mt-1">{displayChild.xp || 0} XP earned</p>
                        <TrendingUp className="absolute right-4 bottom-4 w-6 h-6 text-purple-200 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <div
                        onClick={() => navigateTo('rewards')}
                        className="bg-white rounded-[2rem] p-5 shadow-xl border border-gray-100 relative overflow-hidden cursor-pointer hover-float active-pop hover:border-amber-200 transition-all group"
                    >
                        <div className="absolute -right-3 -top-3 w-14 h-14 bg-amber-100 rounded-full opacity-60 group-hover:scale-110 transition-transform" />
                        <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">Total Stars</p>
                        <p className="text-4xl font-black text-gray-900 group-hover:text-amber-700 transition-colors">{displayChild.stars ?? displayChild.gold ?? 0}</p>
                        <p className="text-[9px] text-gray-400 font-bold mt-1">All-time earned</p>
                        <Star className="absolute right-4 bottom-4 w-6 h-6 text-amber-200 group-hover:text-amber-400 transition-colors" />
                    </div>
                </div>
            </div>

            {/* AI Parent Tip - Solid Pink Theme */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-pink-500 shadow-xl border border-pink-400/20">
                <div className="overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/20 flex items-center justify-between bg-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                                <Bot className="w-6 h-6 text-pink-600" />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-sm uppercase tracking-wider">AI Parent Guidance</h4>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-rose-300 rounded-full" />
                                    <span className="text-white/80 text-[10px] font-bold uppercase tracking-tight">Active Analysis</span>
                                </div>
                            </div>
                        </div>
                        <Sparkles className="w-5 h-5 text-pink-200 animate-pulse" />
                    </div>
                    <div className="p-5">
                        <div className="bg-white/10 rounded-2xl border border-white/10 p-4 shadow-inner mb-4">
                            <p className={`text-sm text-white font-medium leading-relaxed transition-opacity duration-300 ${isAnimatingTip ? 'opacity-0' : 'opacity-100'}`}>{currentTip}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={getNewTip} disabled={isAnimatingTip} className="flex-1 py-2.5 bg-white/20 hover:bg-white/30 text-white font-black rounded-xl text-[10px] uppercase tracking-tight transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 whitespace-nowrap">
                                <Wand2 className="w-3.5 h-3.5 flex-shrink-0" /> Next Tip
                            </button>
                            <button 
                                onClick={async () => {
                                    const sender = currentUser?.uid || userData.uid;
                                    const receiver = displayChild?.uid;
                                    
                                    if (!sender || !receiver) {
                                        alert('Could not identify accounts. Please try linking your child first.');
                                        return;
                                    }

                                    await fetch(`${API_URL}/reminders/send`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ 
                                            sender_uid: sender, 
                                            receiver_uid: receiver,
                                            message: 'Time for a Kingdom Brush! 🦷✨',
                                            type: 'reminder'
                                        })
                                    });
                                    alert('Reminder sent! 🦷✨');
                                }}
                                className="flex-1 py-2.5 bg-white/20 hover:bg-white/30 text-white font-black rounded-xl text-[10px] uppercase tracking-tight transition-all hover-float active-pop flex items-center justify-center gap-1.5 group/remind whitespace-nowrap"
                            >
                                <Bell className="w-3.5 h-3.5 group-hover/remind:animate-bounce flex-shrink-0" /> Nudge
                            </button>
                        </div>
                    </div>
                </div>
            </div>


            {/* Streak card */}
            <div
                onClick={() => navigateTo('parent-streak')}
                className="rounded-[2.5rem] p-5 shadow-xl relative overflow-hidden cursor-pointer hover-float active-pop transition-all group"
                style={{ background: 'linear-gradient(135deg, #FFB86C 0%, #FF6AC1 100%)' }}
            >
                <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-700" />
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                                    <Flame className="w-5 h-5 fill-white text-white drop-shadow-md" />
                                </motion.div>
                                <h3 className="font-bold text-lg tracking-wide text-white">Brushing Streak</h3>
                            </div>
                            <p className="text-white/95 text-xs font-medium">Keep encouraging {displayChild.name || 'them'}!</p>
                        </div>
                        <button
                            className="px-4 py-1.5 rounded-full text-[10px] font-bold transition-all bg-white/30 text-white hover:bg-white/40"
                        >
                            Details
                        </button>
                    </div>
                    <div className="flex items-center gap-5 mt-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center border-[3px] shadow-sm group-hover:scale-105 transition-transform" style={{ borderColor: 'rgba(255,255,255,0.6)' }}>
                            <span className="text-3xl font-light text-white">{userData.currentStreak}</span>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm mb-2 text-white/95 font-medium"><span className="font-light text-xl text-white mr-1">{userData.currentStreak}</span> days in a row!</div>
                            <div className="h-2.5 rounded-full overflow-hidden shadow-inner" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${Math.min((userData.currentStreak / 14) * 100, 100)}%` }}
                                    transition={{ duration: 1.5, type: 'spring', bounce: 0.2 }}
                                    className="h-full bg-white rounded-full shadow-md"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── PROGRESS TAB ──────────────────────────────────────────────────
function ParentProgressTab({ userData, navigateTo }: any) {
    const weeksData = [65, 72, 88, 75, 91, 78, userData.enamelHealth];
    const maxH = Math.max(...weeksData);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px] mb-4 px-1">Enamel Health Trend</h3>
                <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-gray-100">
                    <div className="flex items-end justify-around h-40 gap-2 mb-3">
                        {weeksData.map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(h / maxH) * 100}%` }}
                                    transition={{ delay: i * 0.1, duration: 0.6 }}
                                    className={`w-full rounded-xl ${i === weeksData.length - 1 ? 'bg-gradient-to-t from-purple-600 to-purple-400' : 'bg-gradient-to-t from-purple-200 to-purple-100'}`}
                                />
                                <span className="text-[8px] font-bold text-gray-400">W{i + 1}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-[10px] font-black text-purple-600 uppercase tracking-widest">7-Week Health History</p>
                </div>
            </div>

            <div>
                <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px] mb-4 px-1">Milestones Unlocked</h3>
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                    {[
                        { icon: '🦷', title: 'First Brush', desc: 'Completed their first lesson', done: true, route: 'achievements' },
                        { icon: '🔥', title: '7-Day Streak', desc: 'Brushed 7 days in a row', done: userData.currentStreak >= 7, route: 'parent-streak' },
                        { icon: '⭐', title: '100 Stars', desc: 'Earned 100 stars total', done: userData.totalStars >= 100, route: 'rewards' },
                        { icon: '🏆', title: 'Level 10 Hero', desc: 'Reached Kingdom Level 10', done: userData.level >= 10, route: 'progress' },
                    ].map((m) => (
                        <div
                            key={m.title}
                            onClick={() => navigateTo(m.route)}
                            className="p-4 flex items-center gap-4 cursor-pointer hover:bg-purple-50 transition-colors"
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${m.done ? 'bg-purple-100' : 'bg-gray-100 grayscale opacity-50'}`}>{m.icon}</div>
                            <div className="flex-1">
                                <p className="font-black text-gray-900 text-sm group-hover:text-purple-700">{m.title}</p>
                                <p className="text-[10px] text-gray-400 font-bold">{m.desc}</p>
                            </div>
                            {m.done ? <Check className="w-5 h-5 text-emerald-500" strokeWidth={3} /> : <ChevronRight className="w-5 h-5 text-gray-300" />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── ALERTS TAB ────────────────────────────────────────────────────
function ParentAlertsTab({ navigateTo, userData }: any) {
    const alerts = [
        { icon: '🌙', color: 'bg-indigo-100 text-indigo-600', title: 'Missed PM Brush', time: 'Yesterday', desc: `${userData.name || 'Hero'} did not log their evening brushing session.`, route: 'parent-history' },
        { icon: '🔥', color: 'bg-orange-100 text-orange-600', title: 'Streak Milestone!', time: `${userData.currentStreak} Days`, desc: `${userData.name || 'Hero'} is on a ${userData.currentStreak}-day streak! Celebrate this!`, route: 'parent-streak' },
        { icon: '⬆️', color: 'bg-purple-100 text-purple-600', title: 'Level Up!', time: 'Today', desc: `${userData.name || 'Hero'} reached Level ${userData.level} in the Tooth Kingdom!`, route: 'progress' },
        { icon: '🦷', color: 'bg-emerald-100 text-emerald-600', title: 'Health Check', time: 'Weekly', desc: `Enamel health is at ${userData.enamelHealth}%. ${userData.enamelHealth > 70 ? 'Excellent condition!' : 'Consider a dental checkup.'}`, route: 'progress' },
    ];

    return (
        <div className="space-y-6">
            <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px] px-1">Recent Alerts</h3>
            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {alerts.map((a) => (
                    <div
                        key={a.title}
                        onClick={() => navigateTo(a.route)}
                        className="p-5 flex items-start gap-4 cursor-pointer hover:bg-gray-50 active-pop transition-all group"
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${a.color} group-hover:scale-110 transition-transform`}>{a.icon}</div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                                <p className="font-black text-gray-900 text-sm">{a.title}</p>
                                <span className="text-[9px] font-black text-gray-400 uppercase">{a.time}</span>
                            </div>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">{a.desc}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 self-center group-hover:text-purple-500 transition-colors" />
                    </div>
                ))}
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-[2.5rem] p-6 text-white shadow-xl">
                <h4 className="font-black text-lg mb-2">💡 Tip of the Day</h4>
                <p className="text-sm text-purple-50 font-medium leading-relaxed">Set a consistent bedtime brushing reminder for {userData.name || 'your child'} using the Kingdom Notification system for best results!</p>
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────
export function ParentDashboardScreen({ navigateTo, userData }: ScreenProps) {
    const { signOut, currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'home' | 'progress' | 'alerts' | 'settings'>('home');
    const [children, setChildren] = useState<any[]>([]);

    const fetchChildren = () => {
        if (currentUser?.uid) {
            fetch(`${API_URL}/parent/${currentUser.uid}/children`)
                .then(res => res.json())
                .then(data => {
                    // Normalize field names — backend uses 'gold' for stars
                    const enriched = Array.isArray(data) ? data.map((c: any) => ({
                        ...c,
                        stars: c.stars ?? c.gold ?? 0,
                        level: c.level ?? 1,
                        health: c.health ?? c.enamel_health ?? 100,
                        current_streak: c.current_streak ?? 0,
                        selected_character: c.selected_character ?? c.character ?? 1,
                    })) : [];
                    setChildren(enriched);
                })
                .catch(err => console.error("Failed to fetch children:", err));
        }
    };

    useEffect(() => {
        fetchChildren();
    }, [currentUser?.uid]);

    // Rich mock fallback so parent dashboard always looks populated
    const MOCK_CHILD = {
        uid: 'mock_child',
        name: 'Little Hero',
        level: 4,
        gold: 1250,
        stars: 1250,
        health: 88,
        enamel_health: 88,
        current_streak: 5,
        selected_character: 1,
        xp: 820,
    };

    const displayChild = children[0] || MOCK_CHILD;

    const handleSignOut = async () => { await signOut(); navigateTo('signin'); };
    const handleSettings = () => navigateTo('settings');

    return (
        <div className="h-full bg-transparent flex flex-col overflow-hidden relative">


            <div className="relative flex-none bg-gradient-to-br from-purple-500/90 to-purple-600/90 backdrop-blur-md text-white px-5 pt-5 pb-6 z-50 shadow-xl border-b border-purple-400/30">
                <div className="flex justify-between items-center mb-5 max-w-7xl mx-auto w-full relative z-[60]">
                    <button onClick={handleSignOut} className="p-3 -ml-3 rounded-xl hover:bg-white/20 transition-all cursor-pointer relative z-[60] pointer-events-auto">
                        <LogOut className="w-7 h-7" />
                    </button>
                    <h1 className="font-extrabold text-xl text-white drop-shadow-md">Parent Portal</h1>
                    <button onClick={handleSettings} className="relative p-3 -mr-3 hover:bg-white/20 rounded-xl transition-all cursor-pointer z-[60] pointer-events-auto">
                        <Settings className="w-7 h-7 text-white" />
                    </button>
                </div>

                {/* Hero stat card */}
                <div className="bg-pink-50 rounded-[2rem] p-5 shadow-lg mb-2 relative overflow-hidden border border-pink-100">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                        {[...Array(3)].map((_, i) => (
                            <motion.div key={`bubble-${i}`} className="absolute rounded-full blur-3xl mix-blend-multiply"
                                style={{ background: ['#FFB86C', '#FF6AC1', '#F472B6'][i % 3], opacity: 0.2, width: 160 + i * 30, height: 160 + i * 30, left: i === 0 ? '-10%' : i === 1 ? '40%' : '80%', top: i === 0 ? '-20%' : i === 1 ? '50%' : '-10%' }}
                                animate={{ x: [0, 60, 0, -60, 0], y: [0, -60, 0, 60, 0], scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                                transition={{ duration: 15 + i * 5, repeat: Infinity, ease: 'linear' }} />
                        ))}
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <motion.div whileHover={{ rotate: 5, scale: 1.1 }}
                            animate={{ rotate: [-3, -1, -3], boxShadow: ['0 8px 16px rgba(255,106,193,0.3)', '0 8px 24px rgba(255,106,193,0.6)', '0 8px 16px rgba(255,106,193,0.3)'] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-white overflow-hidden shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #FFB86C 0%, #FF6AC1 100%)' }}>
                            <UserAvatar characterId={userData.selectedCharacter} showBackground={false} className="w-16 h-16 object-cover scale-125 translate-y-2 drop-shadow-2xl" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between mb-2">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: '#F472B6' }}>Guardian of</p>
                                    <p className="text-4xl font-black leading-none tracking-tighter animate-chromaText uppercase">
                                        {userData.name?.split(' ')[0] || 'Hero'}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: '#F472B6' }}>Streak</p>
                                    <p className="text-lg font-black animate-chromaText">{userData.currentStreak} <span className="text-sm">Days</span></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 h-3.5 mb-1">
                                {Array.from({ length: 25 }).map((_, i) => {
                                    const isActive = i < Math.floor((userData.enamelHealth / 100) * 25);
                                    const colors = ['#A78BFA', '#22D3EE', '#FBBF24', '#F472B6', '#4ADE80'];
                                    const color = colors[Math.floor(i / 5)];
                                    return <motion.div key={i} initial={{ scaleY: 0 }} animate={{ scaleY: isActive ? 1 : 0.4, boxShadow: isActive ? `0 0 12px ${color}` : 'none', opacity: isActive ? 1 : 0.2 }} transition={{ delay: i * 0.005 }} className="flex-1 rounded-full h-full" style={{ backgroundColor: isActive ? color : 'rgba(10,31,31,0.4)' }} />;
                                })}
                            </div>
                            <p className="text-[10px] font-black mt-2 text-right uppercase tracking-widest" style={{ color: '#64748B' }}>Enamel Health: {userData.enamelHealth}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── SCROLLABLE CONTENT ── */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-6 relative z-10 w-full">
                <div className="max-w-7xl mx-auto w-full">
                    {activeTab === 'home' && <ParentHomeTab userData={userData} navigateTo={navigateTo} displayChild={displayChild} currentUser={currentUser} />}
                    {activeTab === 'progress' && <ParentProgressTab userData={userData} navigateTo={navigateTo} />}
                    {activeTab === 'alerts' && <ParentAlertsTab userData={userData} navigateTo={navigateTo} />}
                </div>
                <div className="pb-24" />
            </div>

            {/* ── BOTTOM NAV ── */}
            <div className="fixed bottom-0 left-0 right-0 p-4 z-20 pointer-events-none">
                <div className="max-w-4xl mx-auto pointer-events-auto">
                    <div className="glass-card bg-white/80 backdrop-blur-md border-t border-white/20 px-5 py-4 flex justify-around items-center rounded-[2.5rem] shadow-[0_-8px_32px_rgba(0,0,0,0.1)]">
                        {[
                            { id: 'home', icon: Home, label: 'Home' },
                            { id: 'progress', icon: BarChart2, label: 'Progress' },
                            { id: 'alerts', icon: Bell, label: 'Alerts' },
                        ].map(({ id, icon: Icon, label }) => (
                            <button key={id} onClick={() => setActiveTab(id as any)} className="flex flex-col items-center gap-1 group active-pop">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeTab === id ? 'bg-purple-600 shadow-lg scale-110' : 'hover:bg-purple-50 group-hover:scale-110'}`}>
                                    <Icon className={`w-6 h-6 transition-colors ${activeTab === id ? 'text-white' : 'text-gray-400 group-hover:text-purple-500'}`} />
                                </div>
                                <span className={`text-xs font-bold tracking-tight ${activeTab === id ? 'text-purple-600' : 'text-gray-400'}`}>{label}</span>
                            </button>
                        ))}
                        <button onClick={handleSettings} className="flex flex-col items-center gap-1 group active-pop">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-purple-50 group-hover:scale-110 transition-all">
                                <Settings className="w-6 h-6 text-gray-400 group-hover:text-purple-500" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 tracking-tight">Settings</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
