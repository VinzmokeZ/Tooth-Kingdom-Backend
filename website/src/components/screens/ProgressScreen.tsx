import React from 'react';
import { ScreenProps } from './types';
import { ChevronLeft, TrendingUp, Trophy, Target, Clock, Bot, Sparkles, Brain, ArrowUpRight } from 'lucide-react';
import { generateAIProgressReport } from '../../utils/aiMockService';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '../AnimatedBackground';
import { useAuth } from '../../context/AuthContext';

export function ProgressScreen({ navigateTo, userData }: ScreenProps) {
  const { currentUser } = useAuth();
  const [aiReport, setAiReport] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleBack = () => {
    if (currentUser?.role === 'parent') navigateTo('parent-dashboard');
    else if (currentUser?.role === 'teacher') navigateTo('teacher-dashboard');
    else navigateTo('dashboard');
  };

  const generateReport = () => {
    setIsGenerating(true);
    // Simulate AI processing delay
    setTimeout(() => {
      const report = generateAIProgressReport(userData);
      setAiReport(report);
      setIsGenerating(false);
    }, 1500);
  };

  const now = new Date();
  const hasRealData = Object.keys(userData.brushingLogs || {}).length > 0;

  const rawWeeklyData = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const log = (userData.brushingLogs || {} as any)[dateStr];
    const morning = log ? !!log.morning : false;
    const evening = log ? !!log.evening : false;
    const value = morning && evening ? 100 : (morning || evening ? 50 : 0);
    return {
      day: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      value: value,
      morning,
      evening,
      completed: value > 0
    };
  });

  // Inject beautiful illustrative data if the user has no real history yet, 
  // so the chart isn't just a blank white box.
  const displayData = hasRealData ? rawWeeklyData : [
    { day: 'M', value: 50, morning: true, evening: false, completed: true },
    { day: 'T', value: 100, morning: true, evening: true, completed: true },
    { day: 'W', value: 100, morning: true, evening: true, completed: true },
    { day: 'T', value: 50, morning: true, evening: false, completed: true },
    { day: 'F', value: 0, morning: false, evening: false, completed: false },
    { day: 'S', value: 100, morning: true, evening: true, completed: true },
    { day: 'S', value: 50, morning: false, evening: true, completed: true },
  ];

  const totalPossibleSessions = userData.totalDays * 2 || 1;
  const actualSessions = Object.values(userData.brushingLogs).reduce((acc: number, log: any) =>
    acc + (log.morning ? 1 : 0) + (log.evening ? 1 : 0), 0);
  const overallProgress = Math.min(100, Math.round((actualSessions / totalPossibleSessions) * 100));

  const skills = [
    { name: 'Brushing Technique', progress: 85, color: 'from-purple-500 to-purple-600' },
    { name: 'Consistency', progress: 95, color: 'from-blue-500 to-cyan-600' },
    { name: 'Duration Control', progress: 78, color: 'from-pink-500 to-rose-600' },
    { name: 'Coverage', progress: 90, color: 'from-green-500 to-emerald-600' },
  ];

  return (
    <div className="h-full bg-gradient-to-b from-purple-50 to-white flex flex-col relative overflow-hidden">
      <AnimatedBackground />
      {/* Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-gray-100 px-5 py-5 z-20 shadow-sm relative">
        <div className="flex items-center gap-3">
          <button onClick={handleBack} className="p-2 -ml-2 text-gray-700 hover:bg-gray-100 rounded-full transition-all hover-float active-pop">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900 border-none outline-none">Progress Analytics</h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5 relative z-10">
        {/* Enhanced Overall Performance Section (Reference UI Vibe) */}
        <div className="rounded-[2.5rem] p-6 mb-4 relative overflow-hidden shadow-2xl" style={{ backgroundColor: '#0D2626' }}>
          {/* Animated Background Gradient */}
          <motion.div
            animate={{
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              background: 'linear-gradient(45deg, #C5B3E6 0%, #8BE9FD 50%, #FFB86C 100%)',
              backgroundSize: '200% 200%',
            }}
          />

          <div className="flex items-center justify-between mb-4 relative z-10">
            <div className="min-w-0 flex-1">
              <p className="text-sm mb-1 font-semibold leading-tight tracking-wide" style={{ color: '#8B9E9E' }}>Overall Performance</p>
              <p className="text-[10px] font-medium leading-tight tracking-widest uppercase" style={{ color: '#8B9E9E' }}>Last 30 days</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateTo('stats')}
              className="px-4 py-2 rounded-xl text-[10px] font-black tracking-widest flex items-center gap-1.5 flex-shrink-0 shadow-lg"
              style={{ background: 'linear-gradient(to right, #C5B3E6, #8BE9FD)', color: '#0A1F1F' }}
            >
              <TrendingUp className="w-4 h-4" />
              <span>DETAILS</span>
            </motion.button>
          </div>

          <div className="flex items-end gap-3 mb-5 relative z-10">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="text-5xl font-black leading-none tracking-tight"
              style={{ color: '#F5F1ED' }}
            >
              {overallProgress}%
            </motion.span>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-1.5 flex items-center gap-1 px-3 py-1 rounded-lg shadow-inner"
              style={{ backgroundColor: 'rgba(80, 250, 123, 0.2)' }}
            >
              <ArrowUpRight className="w-3.5 h-3.5" style={{ color: '#50FA7B' }} />
              <span className="text-[10px] font-black tracking-wider" style={{ color: '#50FA7B' }}>+12%</span>
            </motion.div>
          </div>

          {/* Segmented Neon Progress Bar */}
          <div className="flex items-center gap-1 relative z-10 mb-6 h-3">
            {Array.from({ length: 25 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: i < Math.floor((overallProgress / 100) * 25) ? 1 : 0.3 }}
                transition={{ delay: i * 0.005, duration: 0.15 }}
                className="flex-1 rounded-full h-full"
                style={{
                  backgroundColor: i < Math.floor((overallProgress / 100) * 25)
                    ? ['#C5B3E6', '#8BE9FD', '#FFB86C', '#FF6AC1', '#50FA7B'][Math.floor(i / 5)]
                    : 'rgba(255, 255, 255, 0.2)'
                }}
              />
            ))}
          </div>

          {/* Detailed Dark Stat Pods */}
          <div className="grid grid-cols-3 gap-3 relative z-10">
            <motion.div whileHover={{ scale: 1.05 }} className="rounded-2xl p-3 text-center shadow-inner" style={{ backgroundColor: '#0A1F1F' }}>
              <p className="text-[10px] font-semibold tracking-wider mb-2" style={{ color: '#8B9E9E' }}>Total Days</p>
              <p className="text-xl font-black" style={{ color: '#8BE9FD' }}>{userData.totalDays}</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="rounded-2xl p-3 text-center shadow-inner" style={{ backgroundColor: '#0A1F1F' }}>
              <p className="text-[10px] font-semibold tracking-wider mb-2" style={{ color: '#8B9E9E' }}>Day Streak</p>
              <p className="text-xl font-black" style={{ color: '#50FA7B' }}>{userData.currentStreak}</p>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} className="rounded-2xl p-3 text-center shadow-inner" style={{ backgroundColor: '#0A1F1F' }}>
              <p className="text-[10px] font-semibold tracking-wider mb-2" style={{ color: '#8B9E9E' }}>Stars Earned</p>
              <p className="text-xl font-black" style={{ color: '#FFB86C' }}>{userData.totalStars}</p>
            </motion.div>
          </div>
        </div>

        {/* Weekly activity */}
        <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100/50">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-medium text-gray-800 tracking-wide">Weekly Activity</h3>
            <button className="text-purple-600 text-sm font-medium transition-all hover-float active-pop">This Week</button>
          </div>

          {/* Bar chart with Morning/Evening split rendering */}
          <div className="flex items-end justify-between gap-3 h-44 mb-6">
            {displayData.map((day, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 h-full">
                <div className="flex-1 flex flex-col-reverse items-center justify-start w-full bg-slate-50 rounded-xl overflow-hidden relative shadow-inner">
                  {/* Evening Block (Top part of the 100% stack) */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: day.evening ? '50%' : '0%' }}
                    transition={{ duration: 1, delay: i * 0.1, type: "spring", bounce: 0.3 }}
                    className="w-full bg-purple-500 absolute bottom-[50%]"
                    style={{ borderRadius: day.morning ? '12px 12px 0 0' : '12px', zIndex: 10 }}
                  />
                  {/* Morning Block (Bottom part of the 100% stack) */}
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: day.morning ? '50%' : '0%' }}
                    transition={{ duration: 1, delay: i * 0.1, type: "spring", bounce: 0.3 }}
                    className="w-full bg-blue-400 absolute bottom-0"
                    style={{ borderRadius: day.evening ? '0 0 12px 12px' : '12px', zIndex: 10 }}
                  />
                </div>
                <span className={`text-xs font-semibold ${day.completed ? 'text-gray-800' : 'text-gray-400'}`}>
                  {day.day}
                </span>
              </div>
            ))}
          </div>

          {/* Legend Matching Reference Image */}
          <div className="flex items-center justify-center gap-6 mt-2 pt-4 border-t border-gray-50">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-blue-400"></div>
              <span className="text-xs text-slate-500 font-medium">Morning</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded bg-purple-500"></div>
              <span className="text-xs text-slate-500 font-medium">Evening</span>
            </div>
          </div>
        </div>

        {/* AI Progress Analysis */}
        <div className="bg-gradient-to-r from-cyan-500/80 to-blue-500/80 rounded-3xl shadow-2xl p-1 backdrop-blur-md">
          <div className="glass-card rounded-[22px] p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-extrabold text-gray-900">AI Progress Analysis</h3>
                  <Sparkles className="w-4 h-4 text-cyan-500" />
                </div>
                <p className="text-sm text-gray-600">
                  Smart insights powered by AI 🤖
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Insight Cards */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📈</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Excellent Progress!</h4>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Your consistency score improved by 12% this week. Keep brushing twice daily to maintain momentum!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm mb-1">AI Suggestion</h4>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Your duration control is at 78%. Try focusing on back molars for 5 extra seconds to reach 85%!
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🎯</div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm mb-1">Next Goal</h4>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      You're 2 days away from your 10-day streak milestone. Our AI predicts 95% success rate!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {aiReport && !isGenerating && (
              <div className="mt-6 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-cyan-500 to-blue-600 p-[2px] shadow-2xl">
                  <div className="rounded-[calc(2.5rem-2px)] bg-white/10 backdrop-blur-xl overflow-hidden">
                    {/* Premium Header */}
                    <div className="px-6 py-5 border-b border-white/20 flex items-center justify-between bg-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                          <Bot className="w-6 h-6 text-cyan-500" />
                        </div>
                        <div>
                          <h4 className="text-white font-black text-sm uppercase tracking-wider">AI Progress Report</h4>
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-white/60 text-[10px] font-bold uppercase tracking-tight">Active Analysis</span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => setAiReport(null)}
                        className="w-8 h-8 rounded-full bg-black/20 text-white flex items-center justify-center hover:bg-black/40 transition-colors hover-float active-pop"
                      >
                        <ChevronLeft className="w-4 h-4 rotate-90" />
                      </button>
                    </div>

                    {/* Report Content area with Scroll Fix */}
                    <div className="p-6 max-h-[450px] overflow-y-auto no-scrollbar">
                      <div className="bg-white/10 rounded-3xl border border-white/20 p-5 shadow-inner">
                        <div className="prose prose-invert prose-sm max-w-none">
                          <div className="space-y-4 text-white font-medium leading-relaxed">
                            {aiReport.split('\n\n').map((paragraph, pIdx) => (
                              <div key={pIdx} className="relative">
                                {paragraph.split('\n').map((line, lIdx) => {
                                  const isHeader = line.startsWith('**') && line.endsWith('**');
                                  const isStat = line.startsWith('- ');
                                  const content = line.replace(/\*\*/g, '');

                                  if (isHeader) {
                                    return <h5 key={lIdx} className="text-cyan-200 font-black uppercase tracking-widest text-[10px] mt-4 mb-2 first:mt-0">{content}</h5>;
                                  }
                                  if (isStat) {
                                    return (
                                      <div key={lIdx} className="flex items-center gap-2 py-1 border-b border-white/5 last:border-0">
                                        <div className="w-1 h-1 rounded-full bg-cyan-400" />
                                        <span className="text-xs text-white/90">{content.replace('- ', '')}</span>
                                      </div>
                                    );
                                  }
                                  return <p key={lIdx} className="text-sm opacity-90">{content}</p>;
                                })}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setAiReport(null)}
                        className="w-full mt-6 py-3 bg-white/20 hover:bg-white/30 text-white font-black rounded-2xl text-xs uppercase tracking-widest transition-all hover-float active-pop"
                      >
                        Close Data Log
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={generateReport}
              disabled={isGenerating}
              className="w-full mt-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-70 hover-float active-pop"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Analyzing Bio-Data...
                </>
              ) : (
                <>
                  <Bot className="w-4 h-4" />
                  Get Detailed AI Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Skills breakdown */}
        <div className="glass-card rounded-3xl p-5 shadow-md border border-purple-100">
          <h3 className="font-bold text-gray-900 mb-4">Skills Assessment</h3>
          <div className="space-y-4">
            {skills.map((skill, i) => (
              <div key={i} className="transition-all hover-float">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{skill.name}</span>
                  <span className="text-sm font-bold text-purple-600">{skill.progress}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${skill.color} rounded-full transition-all duration-500`}
                    style={{ width: `${skill.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestones */}
        <div className="glass-card rounded-3xl p-5 shadow-md border border-purple-100">
          <h3 className="font-bold text-gray-900 mb-4">Recent Milestones</h3>
          <div className="space-y-3">
            {[
              { icon: Trophy, title: '7-Day Streak', subtitle: 'Achieved today', color: 'from-amber-400 to-orange-500' },
              { icon: Target, title: 'Chapter Master', subtitle: '2 days ago', color: 'from-purple-400 to-purple-600' },
              { icon: TrendingUp, title: 'Level 5 Reached', subtitle: '5 days ago', color: 'from-blue-400 to-cyan-600' },
            ].map((milestone, i) => {
              const Icon = milestone.icon;
              return (
                <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl transition-all hover-float active-pop">
                  <div className={`w-12 h-12 bg-gradient-to-br ${milestone.color} rounded-xl flex items-center justify-center shadow-md`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-gray-900 text-sm">{milestone.title}</h4>
                    <p className="text-xs text-gray-500">{milestone.subtitle}</p>
                  </div>
                  <Clock className="w-4 h-4 text-gray-400" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}