import React, { useState } from 'react';
import { ScreenProps } from './types';
import { ChevronLeft, ClipboardList, CheckSquare, Square, Search } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';

export function TeacherBrushCheckScreen({ navigateTo, userData }: ScreenProps) {
    const [searchQuery, setSearchQuery] = useState('');

    // Mock checklist state
    const [checklist, setChecklist] = useState({
        1: true,  // Hero (done)
        2: false, // Alex
        3: true,  // Luna
        4: false, // Leo
        5: false, // Mia
        6: true,  // Kai
    });

    const mockStudents = [
        { id: 1, name: userData.name || 'Hero', character: userData.selectedCharacter },
        { id: 2, name: 'Alex Archer', character: '2' },
        { id: 3, name: 'Luna Light', character: '3' },
        { id: 4, name: 'Leo Lion', character: '1' },
        { id: 5, name: 'Mia Storm', character: '2' },
        { id: 6, name: 'Kai Blaze', character: '3' },
    ];

    const toggleStudent = (id: number) => {
        setChecklist(prev => ({
            ...prev,
            [id]: !prev[id as keyof typeof prev]
        }));
    };

    const markAll = (status: boolean) => {
        const newObj: any = {};
        mockStudents.forEach(s => newObj[s.id] = status);
        setChecklist(newObj);
    };

    const filteredStudents = mockStudents.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const completedCount = Object.values(checklist).filter(v => v).length;
    const progressPercent = (completedCount / mockStudents.length) * 100;

    return (
        <div className="h-full bg-gradient-to-b from-blue-50 to-white flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="bg-white/90 backdrop-blur-xl border-b border-blue-100 z-10 shadow-sm">
                <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigateTo('teacher-dashboard')} className="p-2 -ml-2 rounded-xl hover:bg-blue-50 transition-all hover-float active-pop">
                            <ChevronLeft className="w-6 h-6 text-blue-700" />
                        </button>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">Manual Brush Check</h1>
                    </div>
                </div>

                {/* Progress Bar Header */}
                <div className="px-5 pb-5">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Class Progress</span>
                        <span className="text-xs font-black text-gray-900">{completedCount}/{mockStudents.length} Verified</span>
                    </div>
                    <div className="h-3 bg-blue-100 rounded-full overflow-hidden w-full">
                        <div
                            className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all duration-500 shadow-inner"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Sub-header controls */}
                <div className="px-5 pb-4 flex gap-3">
                    <div className="flex-1 relative group">
                        <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search student..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 bg-gray-50 border border-gray-200 rounded-2xl pl-12 pr-4 text-sm font-bold text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all shadow-inner"
                        />
                    </div>
                    <button onClick={() => markAll(true)} className="h-11 px-4 bg-emerald-100 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-200 transition-colors border border-emerald-200 active-pop">
                        All Yes
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-4">
                <div className="bg-white rounded-[2rem] shadow-xl border border-blue-50 overflow-hidden">
                    {filteredStudents.map((student) => {
                        const isChecked = checklist[student.id as keyof typeof checklist];
                        return (
                            <div
                                key={student.id}
                                onClick={() => toggleStudent(student.id)}
                                className={`p-4 flex items-center gap-4 transition-colors border-b border-gray-50 last:border-0 cursor-pointer hover:bg-gray-50 ${isChecked ? 'bg-blue-50/30' : ''}`}
                            >
                                <div className="relative">
                                    <UserAvatar characterId={Number(student.character)} showBackground={false} className={`w-12 h-12 rounded-xl transition-all ${isChecked ? 'bg-blue-100 scale-105' : 'bg-gray-100 grayscale hover:grayscale-0'}`} />
                                    {isChecked && (
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                                            <CheckSquare className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className={`font-black text-sm truncate transition-colors ${isChecked ? 'text-blue-900' : 'text-gray-900'}`}>{student.name}</h4>
                                    <p className={`text-[10px] uppercase tracking-widest font-black transition-colors ${isChecked ? 'text-blue-500' : 'text-gray-400'}`}>
                                        {isChecked ? 'Verified Brushing' : 'Pending Verification'}
                                    </p>
                                </div>

                                <button className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isChecked ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-gray-50 text-gray-300 border border-gray-200'}`}>
                                    {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                </button>
                            </div>
                        );
                    })}
                    {filteredStudents.length === 0 && (
                        <div className="p-8 text-center">
                            <p className="text-gray-400 font-bold text-sm">No students found.</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="p-6 bg-white border-t border-blue-50">
                <button
                    onClick={() => navigateTo('teacher-dashboard')}
                    className="w-full py-4 bg-blue-600 text-white rounded-[1.8rem] font-black tracking-[0.15em] uppercase shadow-xl shadow-blue-500/40 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex justify-center items-center gap-3 border-b-4 border-blue-800"
                >
                    <ClipboardList className="w-6 h-6" />
                    Save Verification
                </button>
            </div>
        </div>
    );
}
