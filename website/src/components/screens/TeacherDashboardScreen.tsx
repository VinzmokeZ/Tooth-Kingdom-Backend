import React, { useState, useEffect } from 'react';
import { ScreenProps } from './types';
import { GraduationCap, Bell, Settings, LogOut, Flame, Star, TrendingUp, Sparkles, Bot, Wand2, Home, BarChart2, Users, ClipboardList, Trophy, ChevronRight, Check, Plus, Search, X } from 'lucide-react';
import { useAuth, API_URL } from '../../context/AuthContext';
import { UserAvatar } from '../common/UserAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedBackground } from '../AnimatedBackground';

// ─── HOME TAB ──────────────────────────────────────────────────────
function TeacherHomeTab({ userData, navigateTo, setSelectedStudent, displayStudents }: any) {
    const [currentTip, setCurrentTip] = useState("Your class averaged a 92% Enamel Health score this week — phenomenal! Consider adding a 'Class Shield' reward next Monday.");
    const [isAnimatingTip, setIsAnimatingTip] = useState(false);

    const TEACHER_TIPS = [
        "Your class averaged a 92% Enamel Health score this week — phenomenal! Consider adding a 'Class Shield' reward next Monday.",
        "Tip: Group brushing challenges are proven to increase motivation. Try assigning a 'Class Streak' goal!",
        "Students with higher in-game levels tend to brush more consistently. Use the leaderboard to encourage peers.",
        "Reminder: Send a brushing reminder notification to students who have not logged their AM session today.",
        "Data insight: Your class brushing consistency improved 18% after last week's 'Sugar Bug' campaign!",
    ];

    const totalStars = displayStudents.reduce((acc: any, s: any) => acc + (s.stars || 0), 0);
    const avgHealth = displayStudents.length > 0 
        ? Math.round(displayStudents.reduce((acc: any, s: any) => acc + (s.health || 0), 0) / displayStudents.length)
        : 86;

    const getNewTip = () => {
        setIsAnimatingTip(true);
        setTimeout(() => {
            const available = TEACHER_TIPS.filter(t => t !== currentTip);
            setCurrentTip(available[Math.floor(Math.random() * available.length)]);
            setIsAnimatingTip(false);
        }, 500);
    };

    return (
        <div className="space-y-6">
            {/* Class Overview Stats */}
            <div>
                <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px] mb-4 px-1">Class Overview</h3>
                <div className="grid grid-cols-3 gap-3">
                    {[
                        { icon: Users, color: 'bg-blue-100', textColor: 'text-blue-600', label: 'Students', value: displayStudents.length.toString(), action: () => document.getElementById('students-tab-btn')?.click() },
                        { icon: Trophy, color: 'bg-amber-100', textColor: 'text-amber-600', label: 'Class Stars', value: (totalStars > 1000 ? (totalStars/1000).toFixed(1) + 'k' : totalStars).toString(), action: () => navigateTo('teacher-leaderboard') },
                        { icon: Flame, color: 'bg-emerald-100', textColor: 'text-emerald-600', label: 'Avg Health', value: `${avgHealth}%`, action: () => document.getElementById('analytics-tab-btn')?.click() },
                    ].map(({ icon: Icon, color, textColor, label, value, action }) => (
                        <div
                            key={label}
                            onClick={action}
                            className="bg-white rounded-[2rem] p-4 shadow-xl border border-gray-100 text-center relative overflow-hidden cursor-pointer hover-float active-pop group"
                        >
                            <div className={`absolute -right-2 -top-2 w-10 h-10 ${color} rounded-full opacity-60 group-hover:scale-150 transition-transform duration-500`} />
                            <div className={`w-10 h-10 ${color} rounded-2xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform`}>
                                <Icon className={`w-5 h-5 ${textColor}`} />
                            </div>
                            <p className={`text-xl font-black text-gray-900 relative z-10`}>{value}</p>
                            <p className={`text-[8px] font-black ${textColor} uppercase tracking-widest relative z-10`}>{label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Student Roster */}
            <div>
                <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px] mb-4 px-1">Kingdom Heroes</h3>
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden divide-y divide-gray-50 h-[400px] overflow-y-auto no-scrollbar relative">
                    {/* Show only top 5 in home widget, rest in Students tab */}
                    {displayStudents.slice(0, 5).map((student: any) => (
                        <div
                            key={student.uid || student.id}
                            onClick={() => { setSelectedStudent(student); navigateTo('teacher-student-detail'); }}
                            className="p-4 flex items-center gap-4 hover:bg-blue-50/50 transition-colors cursor-pointer active-pop group"
                        >
                            <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform pb-2">
                                <UserAvatar characterId={Number(student.character)} showBackground={false} className="w-12 h-12 bg-blue-50 rounded-xl border border-blue-100 object-cover" />
                                <div className={`absolute -right-1 -top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${student.status === 'Online' ? 'bg-green-500' : student.status === 'Brushing' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                            </div>
                            <div className="flex-1 min-w-0 flex flex-col justify-center pt-1">
                                <h4 className="font-black text-gray-900 text-sm truncate leading-tight mb-1">{student.name}</h4>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                                        <span className="text-[10px] font-black text-gray-500">{student.stars}</span>
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${student.health >= 80 ? 'text-emerald-500' : student.health >= 50 ? 'text-orange-500' : 'text-red-500'}`}>{student.health}% HP</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        const sender = userData.uid || 'teacher_1';
                                        const receiver = student.uid || student.id;
                                        await fetch(`${API_URL}/reminders/send`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ sender_uid: sender, receiver_uid: receiver, message: 'Your teacher says: Time for a Kingdom Brush! 🦷⚔️' })
                                        });
                                        alert(`Reminder sent to ${student.name}!`);
                                    }}
                                    className="w-10 h-10 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm active-pop group/remind"
                                >
                                    <Bell className="w-4 h-4 group-hover/remind:animate-bounce" />
                                </button>
                                <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 group-hover:text-blue-500 transition-colors" />
                            </div>
                        </div>
                    ))}
                    {displayStudents.length > 5 && (
                        <div
                            onClick={() => document.getElementById('students-tab-btn')?.click()}
                            className="bg-gray-50 p-4 text-center cursor-pointer hover:bg-gray-100 transition-colors border-t border-gray-100 flex items-center justify-center group"
                        >
                            <span className="text-xs font-black text-blue-600 uppercase tracking-widest group-hover:mr-1 transition-all">View All {displayStudents.length} Students</span>
                            <ChevronRight className="w-4 h-4 text-blue-600 opacity-0 group-hover:opacity-100 transition-all -ml-2 group-hover:ml-0" />
                        </div>
                    )}
                </div>
            </div>

            {/* AI Teacher Tip */}
            <div className="relative overflow-hidden rounded-[2.5rem] bg-blue-600 shadow-xl border border-blue-400/20">
                <div className="overflow-hidden">
                    <div className="px-5 py-4 border-b border-white/20 flex items-center justify-between bg-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                                <Bot className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="text-white font-black text-sm uppercase tracking-wider">AI Class Guidance</h4>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                                    <span className="text-white/80 text-[10px] font-bold uppercase tracking-tight">Active Analysis</span>
                                </div>
                            </div>
                        </div>
                        <Sparkles className="w-5 h-5 text-blue-200 animate-pulse" />
                    </div>
                    <div className="p-5">
                        <div className="bg-white/10 rounded-2xl border border-white/10 p-4 shadow-inner mb-4">
                            <p className={`text-sm text-white font-medium leading-relaxed transition-opacity duration-300 ${isAnimatingTip ? 'opacity-0' : 'opacity-100'}`}>{currentTip}</p>
                        </div>
                        <button onClick={getNewTip} disabled={isAnimatingTip} className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                            <Wand2 className="w-3.5 h-3.5" /> Next Insight
                        </button>
                    </div>
                </div>
            </div>

            {/* Academy Tools */}
            <div>
                <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px] mb-4 px-1">Academy Tools</h3>
                <div className="grid grid-cols-2 gap-4">
                    <div
                        onClick={() => navigateTo('teacher-brush-check')}
                        className="bg-white rounded-[2rem] p-5 shadow-xl border border-gray-100 flex flex-col items-center gap-2 cursor-pointer hover-float active-pop hover:border-blue-200 transition-all group"
                    >
                        <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <ClipboardList className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-[10px] font-black text-gray-900 group-hover:text-blue-700 uppercase tracking-widest text-center transition-colors">Brush Check</p>
                    </div>
                    <div
                        onClick={() => navigateTo('teacher-leaderboard')}
                        className="bg-white rounded-[2rem] p-5 shadow-xl border border-gray-100 flex flex-col items-center gap-2 cursor-pointer hover-float active-pop hover:border-amber-200 transition-all group"
                    >
                        <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Trophy className="w-6 h-6 text-amber-600" />
                        </div>
                        <p className="text-[10px] font-black text-gray-900 group-hover:text-amber-700 uppercase tracking-widest text-center transition-colors">Leaderboard</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── ANALYTICS TAB ─────────────────────────────────────────────────
function TeacherAnalyticsTab({ displayStudents }: any) {
    const avgHealth = displayStudents.length > 0 
        ? Math.round(displayStudents.reduce((acc: any, s: any) => acc + (s.health || 0), 0) / displayStudents.length)
        : 86;
    const weekData = [72, 80, 75, 88, 91, 84, avgHealth];
    const totalStars = displayStudents.reduce((acc: any, s: any) => acc + (s.stars || 0), 0);

    return (
        <div className="space-y-6">
            <div>
                <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px] mb-4 px-1">Class Health Trend</h3>
                <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-gray-100">
                    <div className="flex items-end justify-around h-40 gap-2 mb-3">
                        {weekData.map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(h / 100) * 100}%` }}
                                    transition={{ delay: i * 0.1, duration: 0.6 }}
                                    className={`w-full rounded-xl ${i === weekData.length - 1 ? 'bg-gradient-to-t from-blue-600 to-blue-400' : 'bg-gradient-to-t from-blue-200 to-blue-100'}`}
                                />
                                <span className="text-[8px] font-bold text-gray-400">W{i + 1}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-center text-[10px] font-black text-blue-600 uppercase tracking-widest">7-Week Class Average</p>
                </div>
            </div>

            <div>
                <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px] mb-4 px-1">Class Achievements</h3>
                <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                    {[
                        { icon: '🦷', title: '154 Sugar Bugs defeated this week', done: true },
                        { icon: '🔥', title: 'Class streak: 5 days running', done: true },
                        { icon: '⭐', title: `${totalStars.toLocaleString()} collective stars earned`, done: true },
                        { icon: '🏆', title: `${avgHealth}% class brushing compliance`, done: avgHealth >= 90 },
                    ].map((a) => (
                        <div key={a.title} className="p-4 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${a.done ? 'bg-blue-100' : 'bg-gray-100 grayscale opacity-50'}`}>{a.icon}</div>
                            <p className="flex-1 font-bold text-gray-900 text-sm">{a.title}</p>
                            {a.done && <Check className="w-5 h-5 text-emerald-500" strokeWidth={3} />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── STUDENTS TAB ──────────────────────────────────────────────────
function TeacherStudentsTab({ navigateTo, setSelectedStudent, displayStudents, userData, refreshStudents }: any) {
    const { currentUser } = useAuth();
    const [showAddModal, setShowAddModal] = useState(false);
    const [identifier, setIdentifier] = useState('');
    const [isLinking, setIsLinking] = useState(false);

    const handleLink = async () => {
        if (!identifier.trim()) return;
        // Use currentUser.uid (from AuthContext) — userData is from GameContext and has no uid!
        const teacherUid = currentUser?.uid || userData?.uid;
        if (!teacherUid) {
            alert('Could not identify your account. Please re-login.');
            return;
        }
        setIsLinking(true);
        try {
            const response = await fetch(`${API_URL}/relations/link`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    parent_uid: teacherUid,
                    child_identifier: identifier.trim(),
                    relation_type: 'teacher_student'
                })
            });
            const data = await response.json();
            if (data.success) {
                alert('Student linked successfully! 🎓');
                setShowAddModal(false);
                setIdentifier('');
                if (refreshStudents) refreshStudents();
            } else {
                // Safely extract readable message from any FastAPI error format
                const errMsg = typeof data.detail === 'string'
                    ? data.detail
                    : Array.isArray(data.detail)
                    ? data.detail.map((e: any) => e.msg || JSON.stringify(e)).join(', ')
                    : data.message || 'Student not found. Please check the email or phone number.';
                alert(errMsg);
            }
        } catch (err) {
            alert('Could not reach the server. Is the backend running?');
        } finally {
            setIsLinking(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
                <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px]">All Heroes — Class Alpha</h3>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 transition-all hover-float active-pop group"
                >
                    <Plus className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Add Student</span>
                </button>
            </div>

            {/* Link Student Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
                        <motion.div 
                            initial={{ scale: 0.9, opacity: 0, y: 20 }} 
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl border border-blue-100 relative overflow-hidden"
                        >
                            <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-50 rounded-full blur-2xl" />
                            
                            <h2 className="text-2xl font-black text-gray-900 mb-2 relative z-10">Add Student</h2>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-6 relative z-10">Link a Hero to your class</p>
                            
                            <div className="space-y-4 relative z-10">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Email or Phone Number</label>
                                    <div className="relative">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                                        <input 
                                            type="text"
                                            value={identifier}
                                            onChange={(e) => setIdentifier(e.target.value)}
                                            placeholder="hero@kingdom.com"
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-11 pr-5 py-4 text-sm font-bold focus:border-blue-500 focus:bg-white transition-all outline-none"
                                            onKeyDown={(e) => e.key === 'Enter' && handleLink()}
                                        />
                                    </div>
                                </div>
                                
                                <div className="flex gap-3 pt-4">
                                    <button 
                                        onClick={() => setShowAddModal(false)}
                                        className="flex-1 py-4 bg-gray-100 text-gray-500 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleLink}
                                        disabled={isLinking || !identifier.trim()}
                                        className="flex-1 py-4 bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isLinking ? (
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>Link Hero <ChevronRight className="w-3.5 h-3.5" /></>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {displayStudents.map((student: any) => (
                    <div
                        key={student.id}
                        onClick={() => { setSelectedStudent(student); navigateTo('teacher-student-detail'); }}
                        className="p-4 flex items-center gap-4 hover:bg-blue-50/50 transition-colors cursor-pointer active-pop group"
                    >
                        <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform pb-2">
                            <UserAvatar characterId={Number(student.character)} showBackground={false} className="w-14 h-14 bg-blue-50 rounded-xl border border-blue-100 object-cover" />
                            <div className={`absolute -right-1 -top-1 w-3.5 h-3.5 rounded-full border-2 border-white ${student.status === 'Online' ? 'bg-green-500' : student.status === 'Brushing' ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`} />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center pt-1">
                            <h4 className="font-black text-gray-900 text-sm leading-tight mb-1">{student.name}</h4>
                            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                <div className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                                    <span className="text-[10px] font-black text-gray-500">{student.stars}</span>
                                </div>
                                <span className={`text-[8px] font-black uppercase tracking-widest ${student.health >= 80 ? 'text-emerald-500' : student.health >= 50 ? 'text-orange-500' : 'text-red-500'}`}>{student.health}% HP</span>
                            </div>
                            {/* Mini health bar */}
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
                                <div className={`h-full rounded-full transition-all ${student.health >= 80 ? 'bg-emerald-500' : student.health >= 50 ? 'bg-orange-400' : 'bg-red-500'}`} style={{ width: `${student.health}%` }} />
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <button 
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    const sender = userData.uid || 'teacher_1';
                                    const receiver = student.uid || student.id;
                                    await fetch(`${API_URL}/reminders/send`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ sender_uid: sender, receiver_uid: receiver, message: 'Your teacher says: Time for a Kingdom Brush! 🦷⚔️' })
                                    });
                                    alert(`Reminder sent to ${student.name}!`);
                                }}
                                className="w-10 h-10 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-xl transition-all duration-300 flex items-center justify-center shadow-sm active-pop group/remind"
                            >
                                <Bell className="w-4 h-4 group-hover/remind:animate-bounce" />
                            </button>
                            <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 group-hover:text-blue-500 transition-colors" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────
export function TeacherDashboardScreen({ navigateTo, userData, setSelectedStudent }: any) {
    const { signOut, currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<'home' | 'students' | 'analytics' | 'settings'>('home');
    const [students, setStudents] = useState<any[]>([]);

    const handleSignOut = async () => { await signOut(); navigateTo('signin'); };
    const handleSettings = () => navigateTo('settings');

    const MOCK_STUDENTS = [
        { uid: 'mock_1', name: 'Alex Archer', level: 5, stars: 2500, health: 95, character: 1, status: 'Online' },
        { uid: 'mock_2', name: 'Luna Light', level: 3, stars: 1200, health: 72, character: 2, status: 'Offline' },
        { uid: 'mock_3', name: 'Leo Lion', level: 8, stars: 4000, health: 88, character: 3, status: 'Brushing' },
        { uid: 'mock_4', name: 'Mia Storm', level: 2, stars: 500, health: 65, character: 1, status: 'Offline' },
        { uid: 'mock_5', name: 'Kai Blaze', level: 6, stars: 3100, health: 91, character: 2, status: 'Online' },
    ];

    const fetchStudents = () => {
        const uid = currentUser?.uid;
        if (uid) {
            fetch(`${API_URL}/teacher/${uid}/students`)
                .then(res => res.json())
                .then(data => {
                    // Add mock status field since backend doesn't provide it
                    const statuses = ['Online', 'Offline', 'Brushing'];
                    const enriched = Array.isArray(data) ? data.map((s: any, i: number) => ({
                        ...s,
                        status: s.status || statuses[i % 3]
                    })) : [];
                    setStudents(enriched);
                })
                .catch(err => console.error("Failed to fetch students:", err));
        }
    };

    useEffect(() => {
        fetchStudents();
    }, [currentUser?.uid]);

    // Show mock data if no real students yet — so teacher can see what it looks like
    const displayStudents = students.length > 0 ? students : MOCK_STUDENTS;
    const avgHealth = displayStudents.length > 0 
        ? Math.round(displayStudents.reduce((acc: any, s: any) => acc + (s.health || 0), 0) / displayStudents.length)
        : 86;

    return (
        <div className="h-full bg-transparent flex flex-col overflow-hidden relative">
            <AnimatedBackground />


            <div className="relative flex-none bg-gradient-to-br from-blue-500/90 to-blue-700/90 backdrop-blur-md text-white px-5 pt-5 pb-6 z-50 shadow-xl border-b border-blue-400/30">
                <div className="flex justify-between items-center mb-5 max-w-7xl mx-auto w-full relative z-[60]">
                    <button onClick={handleSignOut} className="p-3 -ml-3 rounded-xl hover:bg-white/20 transition-all cursor-pointer relative z-[60] pointer-events-auto">
                        <LogOut className="w-7 h-7" />
                    </button>
                    <h1 className="font-extrabold text-xl text-white drop-shadow-md">Teacher Academy</h1>
                    <button onClick={handleSettings} className="relative p-3 -mr-3 hover:bg-white/20 rounded-xl transition-all cursor-pointer z-[60] pointer-events-auto">
                        <Settings className="w-7 h-7 text-white" />
                    </button>
                </div>

                {/* Hero stat card */}
                <div className="bg-blue-50 rounded-[2rem] p-5 shadow-lg mb-2 relative overflow-hidden border border-blue-100">
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                        {[...Array(3)].map((_, i) => (
                            <motion.div key={`bubble-t-${i}`} className="absolute rounded-full blur-3xl mix-blend-multiply"
                                style={{ background: ['#8BE9FD', '#60A5FA', '#3B82F6'][i % 3], opacity: 0.2, width: 160 + i * 30, height: 160 + i * 30, left: i === 0 ? '-10%' : i === 1 ? '40%' : '80%', top: i === 0 ? '-20%' : i === 1 ? '50%' : '-10%' }}
                                animate={{ x: [0, 60, 0, -60, 0], y: [0, -60, 0, 60, 0], scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                                transition={{ duration: 15 + i * 5, repeat: Infinity, ease: 'linear' }} />
                        ))}
                    </div>
                    <div className="flex items-center gap-4 relative z-10">
                        <motion.div
                            animate={{ rotate: [-3, -1, -3], boxShadow: ['0 8px 16px rgba(96,165,250,0.3)', '0 8px 24px rgba(96,165,250,0.6)', '0 8px 16px rgba(96,165,250,0.3)'] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-white"
                            style={{ background: 'linear-gradient(135deg, #60A5FA 0%, #A78BFA 100%)' }}>
                            <GraduationCap className="w-10 h-10 text-white drop-shadow-2xl" />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-baseline justify-between mb-2">
                                <div>
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: '#3B82F6' }}>Class King</p>
                                    <p className="text-4xl font-black leading-none tracking-tighter" style={{ color: '#1E3A8A' }}>Alpha</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5" style={{ color: '#3B82F6' }}>Students</p>
                                    <p className="text-lg font-black" style={{ color: '#2563EB' }}>24</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 h-3.5 mb-1">
                                {Array.from({ length: 25 }).map((_, i) => {
                                    const isActive = i < Math.floor((avgHealth / 100) * 25);
                                    const colors = ['#60A5FA', '#22D3EE', '#A78BFA', '#F472B6', '#4ADE80'];
                                    const color = colors[Math.floor(i / 5)];
                                    return <motion.div key={i} initial={{ scaleY: 0 }} animate={{ scaleY: isActive ? 1 : 0.4, boxShadow: isActive ? `0 0 12px ${color}` : 'none', opacity: isActive ? 1 : 0.2 }} transition={{ delay: i * 0.005 }} className="flex-1 rounded-full h-full" style={{ backgroundColor: isActive ? color : 'rgba(10,31,31,0.4)' }} />;
                                })}
                            </div>
                            <p className="text-[10px] font-black mt-2 text-right uppercase tracking-widest" style={{ color: '#64748B' }}>Class Avg Health: {avgHealth}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── SCROLLABLE CONTENT ── */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-6 relative z-10 w-full">
                <div className="max-w-7xl mx-auto w-full">
                    {activeTab === 'home' && <TeacherHomeTab userData={userData} navigateTo={navigateTo} setSelectedStudent={setSelectedStudent} displayStudents={displayStudents} />}
                    {activeTab === 'students' && <TeacherStudentsTab userData={userData} navigateTo={navigateTo} setSelectedStudent={setSelectedStudent} displayStudents={displayStudents} refreshStudents={fetchStudents} />}
                    {activeTab === 'analytics' && <TeacherAnalyticsTab userData={userData} navigateTo={navigateTo} displayStudents={displayStudents} />}
                </div>
                <div className="pb-24" />
            </div>

            {/* ── BOTTOM NAV ── */}
            <div className="fixed bottom-0 left-0 right-0 p-4 z-20 pointer-events-none">
                <div className="max-w-4xl mx-auto pointer-events-auto">
                    <div className="glass-card bg-white/80 backdrop-blur-md border-t border-white/20 px-5 py-4 flex justify-around items-center rounded-[2.5rem] shadow-[0_-8px_32px_rgba(0,0,0,0.1)]">
                        {[
                            { id: 'home', icon: Home, label: 'Home' },
                            { id: 'students', icon: Users, label: 'Students' },
                            { id: 'analytics', icon: BarChart2, label: 'Analytics' },
                        ].map(({ id, icon: Icon, label }) => (
                            <button id={`${id}-tab-btn`} key={id} onClick={() => setActiveTab(id as any)} className="flex flex-col items-center gap-1 group active-pop">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeTab === id ? 'bg-blue-600 shadow-lg scale-110' : 'hover:bg-blue-50 group-hover:scale-110'}`}>
                                    <Icon className={`w-6 h-6 transition-colors ${activeTab === id ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'}`} />
                                </div>
                                <span className={`text-xs font-bold tracking-tight ${activeTab === id ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
                            </button>
                        ))}
                        <button onClick={handleSettings} className="flex flex-col items-center gap-1 group active-pop">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-blue-50 group-hover:scale-110 transition-all">
                                <Settings className="w-6 h-6 text-gray-400 group-hover:text-blue-500" />
                            </div>
                            <span className="text-xs font-bold text-gray-400 tracking-tight">Settings</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
