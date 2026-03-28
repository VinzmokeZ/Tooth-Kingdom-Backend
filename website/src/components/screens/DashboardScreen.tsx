import React, { useState } from 'react';
import { ScreenProps } from './types';
import { Menu, Bell, Star, BookOpen, ChevronRight, Play, ShoppingBag, Flame, Bot, Home, TrendingUp, Shield, Heart, Target, Sparkles, Check, Coins, Wand2, Trophy, Award, Zap } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { TransparentImage } from '../common/TransparentImage';
import { ACADEMY_COURSES } from '../../data/learningContent';
import { ACHIEVEMENTS } from '../../data/achievements';
import { motion } from 'framer-motion';
import { AnimatedBackground } from '../AnimatedBackground';

export function DashboardScreen({ navigateTo, userData, updateUserData }: ScreenProps) {
  const AI_TIPS = [
    "Great job checking in! Did you know brushing for 2 minutes is the perfect amount of time to defeat all sugar bugs?",
    "Fun Fact: Flossing once a day keeps the gum monsters away!",
    "Pro Tip: Don't rinse with water immediately after brushing—let the fluoride protect your teeth!",
    "Your streak is on fire! Keep it up to unlock the Golden Shield soon.",
    "Did you know? Cheese is good for your teeth because it balances pH levels!"
  ];

  const [currentTip, setCurrentTip] = useState(AI_TIPS[0]);
  const [isAnimatingTip, setIsAnimatingTip] = useState(false);

  // Carousel State for Learning Academy
  const recommendedCourses = ACADEMY_COURSES.filter(c => c.aiRecommended);
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0);
  const [nextCourseIndex, setNextCourseIndex] = useState(0);
  const [isCarouselTransitioning, setIsCarouselTransitioning] = useState(false);


  // Carousel Timer Logic
  React.useEffect(() => {
    if (recommendedCourses.length === 0) return;

    const timer = setInterval(() => {
      const nextIdx = (currentCourseIndex + 1) % recommendedCourses.length;
      setNextCourseIndex(nextIdx);
      setIsCarouselTransitioning(true);

      // Complete transition after animation ends
      setTimeout(() => {
        setCurrentCourseIndex(nextIdx);
        setIsCarouselTransitioning(false);
      }, 1000); // Sync with transition duration
    }, 4000); // 4 seconds total

    return () => clearInterval(timer);
  }, [currentCourseIndex, recommendedCourses.length]);

  const getNewTip = () => {
    setIsAnimatingTip(true);
    setTimeout(() => {
      const availableTips = AI_TIPS.filter(t => t !== currentTip);
      const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)];
      setCurrentTip(randomTip);
      setIsAnimatingTip(false);
    }, 500);
  };

  const unreadNotifications = (userData.notifications || []).filter(n => !n.read).length;

  return (
    <div className="h-full bg-transparent flex flex-col overflow-hidden relative">
      <AnimatedBackground />
      {/* Header (Solid Purple Box) */}
      <div className="fixed top-0 left-0 right-0 bg-[#9333ea] text-white px-5 pt-5 pb-6 z-50 shadow-2xl">
        <div className="flex justify-between items-center mb-5 max-w-7xl mx-auto w-full">
          <button onClick={() => navigateTo('settings')} className="p-3 -ml-3 rounded-xl hover:bg-white/20 transition-all hover-float active-pop cursor-pointer pointer-events-auto relative z-[60]"><Menu className="w-7 h-7" /></button>
          <h1 className="font-extrabold text-xl">Dashboard</h1>
          <button
            onClick={() => navigateTo('notifications')}
            className="relative p-2 -mr-2 hover:bg-white/20 rounded-xl transition-all hover-float active-pop"
          >
            <Bell className="w-6 h-6 text-white" />
            {unreadNotifications > 0 && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-pink-500 rounded-full text-[10px] flex items-center justify-center font-bold border-2 border-purple-600 animate-pulse">
                {unreadNotifications}
              </div>
            )}
          </button>
        </div>
        <div className="backdrop-blur-md rounded-[2rem] p-5 shadow-lg mb-2 relative overflow-hidden max-w-7xl mx-auto w-full" style={{ backgroundColor: '#FFFFFF', border: '1px solid rgba(255,255,255,0.4)' }}>
          {/* ... (bubbles kept same) ... */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`color-bubble-${i}`}
                className="absolute rounded-full blur-3xl mix-blend-multiply"
                style={{
                  background: ['#8BE9FD', '#FFB86C', '#FF6AC1'][i % 3],
                  opacity: 0.4,
                  width: 160 + (i * 30),
                  height: 160 + (i * 30),
                  left: i === 0 ? '-10%' : i === 1 ? '40%' : '80%',
                  top: i === 0 ? '-20%' : i === 1 ? '50%' : '-10%',
                }}
                animate={{
                  x: [0, 60, 0, -60, 0],
                  y: [0, -60, 0, 60, 0],
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  duration: 15 + (i * 5),
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-4 relative z-10">
            {/* The Reference "Angled Badge" - Recreated accurately with Glow */}
            <motion.div
              whileHover={{ rotate: 5, scale: 1.1 }}
              animate={{
                rotate: [-3, -1, -3],
                boxShadow: [
                  '0 8px 16px rgba(255, 106, 193, 0.3)',
                  '0 8px 24px rgba(255, 106, 193, 0.6)',
                  '0 8px 16px rgba(255, 106, 193, 0.3)'
                ]
              }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-white transform overflow-hidden relative z-10"
              style={{
                background: 'linear-gradient(135deg, #FFB86C 0%, #FF6AC1 100%)',
              }}
            >
              <UserAvatar characterId={userData.selectedCharacter} showBackground={false} className="w-16 h-16 object-cover scale-125 translate-y-2 drop-shadow-2xl" />
            </motion.div>

            {/* Level & Progress Layout (Enhanced Glow & Contrast) */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline justify-between mb-2">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 antialiased" style={{ color: '#4F46E5', textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>Kingdom Level</p>
                  <p
                    className="text-5xl font-black leading-none antialiased tracking-tighter"
                    style={{ color: '#1E293B' }}
                  >
                    {userData.level}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-1 antialiased" style={{ color: '#4F46E5', textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    HI, <span className="animate-chromaName">{userData.name?.toUpperCase() || 'HERO'}</span>!
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 antialiased" style={{ color: '#7C3AED', textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>Current XP</p>
                  <p className="text-lg font-black leading-none mb-1 antialiased" style={{ color: '#7C3AED' }}>{userData.xp.toLocaleString()}</p>
                  <div className="flex items-center gap-1.5 justify-end">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500/80 antialiased">Next Level</p>
                    <p className="text-sm font-black antialiased" style={{ color: '#0891B2' }}>{((userData.level + 1) * 100).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Segmented Neon Progress Bar (Ultimate Glow) */}
              <div className="flex items-center gap-1 relative z-10 h-3.5 mb-1">
                {Array.from({ length: 25 }).map((_, i) => {
                  const isActive = i < Math.floor(((userData.xp % 100) / 100) * 25);
                  const colors = ['#A78BFA', '#22D3EE', '#FBBF24', '#F472B6', '#4ADE80'];
                  const color = colors[Math.floor(i / 5)];

                  return (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0 }}
                      animate={{
                        scaleY: isActive ? 1 : 0.4,
                        boxShadow: isActive ? `0 0 12px ${color}` : 'none',
                        opacity: isActive ? 1 : 0.2
                      }}
                      transition={{ delay: i * 0.005, duration: 0.15 }}
                      className="flex-1 rounded-full h-full"
                      style={{
                        backgroundColor: isActive ? color : 'rgba(10, 31, 31, 0.4)',
                        filter: isActive ? 'brightness(1.2) saturate(1.3)' : 'none'
                      }}
                    />
                  );
                })}
              </div>
              <p className="text-[10px] font-black mt-2 text-right uppercase tracking-widest drop-shadow-sm" style={{ color: '#64748B' }}>
                {((userData.level + 1) * 100) - userData.xp} XP to level {userData.level + 1}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-6 space-y-6 relative z-10 w-full pt-[160px]">
        <div className="max-w-7xl mx-auto w-full">
          {/* PRIMARY FOCUS: Learning Academy (Dynamic AI Carousel - Hero Style Sync) */}
          <div>
            <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px] mb-4 px-1">Learning Academy</h3>
            {(() => {
              if (recommendedCourses.length === 0) return null;
              const featuredCourse = recommendedCourses[currentCourseIndex];
              return (
                <div
                  className="w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-purple-500/30 group transition-all"
                  style={{ backgroundColor: '#9333ea' }}
                >
                  <div
                    onClick={() => window.open(featuredCourse.url, '_blank')}
                    className="relative w-full overflow-hidden cursor-pointer active:scale-[0.98] transition-all"
                    style={{ height: '700px', minHeight: '700px', backgroundColor: '#9333ea' }}
                  >
                    {/* Background Layer: FORCED SOLID Vibrant Purple */}
                    <div className="absolute inset-0 z-0" style={{ backgroundColor: '#9333ea' }} />

                    {/* Background Bubbles Animation (On top of solid purple) */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden z-1">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={`carousel-bubble-v4-${i}`}
                          className="absolute rounded-full blur-[90px]"
                          style={{
                            background: ['#38bdf8', '#f472b6', '#c084fc', '#818cf8', '#22d3ee'][i % 5], // Cyan, Pink, Purple, Violet
                            opacity: 0.3,
                            width: 300 + (i * 70),
                            height: 300 + (i * 70),
                            left: `${(i * 20) + (Math.random() * 5)}%`,
                            top: `${(i * 15) + (Math.random() * 15)}%`,
                          }}
                          animate={{
                            x: [0, 80, 0, -80, 0],
                            y: [0, -80, 0, 80, 0],
                            scale: [1, 1.15, 1],
                          }}
                          transition={{
                            duration: 15 + (i * 3),
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      ))}
                    </div>

                    {/* Main Image Layer (Full View) - Scaled up for desktop */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center scale-110">
                      <img
                        src={recommendedCourses[currentCourseIndex].thumbnail}
                        alt="Current"
                        className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-1000"
                        style={{ width: '100%', height: '100%' }}
                      />

                      <img
                        src={recommendedCourses[nextCourseIndex].thumbnail}
                        alt="Next"
                        className={`absolute inset-0 w-full h-full object-contain group-hover:scale-105 transition-all duration-1000 ${isCarouselTransitioning ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-5 pointer-events-none" />

                    {/* Bottom-Centered Text Area - Plain White Restored */}
                    <div className="absolute inset-0 bg-black/5 flex flex-col items-center justify-end pb-24 p-16 md:p-24 z-10 pointer-events-none text-center">
                      <div className={`transition-all duration-700 flex flex-col items-center ${isCarouselTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                        <h3 className="text-white font-black text-6xl md:text-8xl leading-tight mb-6 drop-shadow-2xl max-w-6xl drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                          {featuredCourse.title}
                        </h3>
                        <p className="text-white/90 text-xl md:text-3xl font-bold max-w-4xl line-clamp-2 drop-shadow-lg leading-relaxed">
                          {featuredCourse.description}
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-10 right-10 bg-[#FF0000] w-24 h-16 rounded-[1.2rem] flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:bg-[#FF0000]/90 transition-all z-20 cursor-pointer border-2 border-white/10">
                      <Play className="w-10 h-10 text-white fill-white" />
                    </div>

                    {/* Top-Left Badges Area - MOVED TO END & Z-100 FOR GUARANTEED VISIBILITY */}
                    <div className="absolute top-12 left-12 z-[100] flex items-center gap-4 pointer-events-none">
                      <div className="flex items-center gap-4">
                        <motion.span
                          animate={{
                            color: ['#FFFFFF', '#FFB86C', '#FF79C6', '#BD93F9', '#FFFFFF'],
                            textShadow: [
                              '0 0 20px rgba(255,184,108,0.4)',
                              '0 0 25px rgba(255,121,198,0.6)',
                              '0 0 20px rgba(189,147,249,0.4)',
                              '0 0 15px rgba(255,255,255,0.3)'
                            ]
                          }}
                          transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                          className="bg-[#0891b2] text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-[0_0_20px_rgba(8,145,178,0.3)] border border-white/20"
                        >
                          New Lesson
                        </motion.span>
                        <motion.span
                          animate={{
                            textShadow: [
                              '0 0 10px rgba(74,222,128,0.4)',
                              '0 0 15px rgba(74,222,128,0.6)',
                              '0 0 10px rgba(74,222,128,0.4)'
                            ]
                          }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="bg-black/40 backdrop-blur-xl text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-2xl border border-white/10 flex items-center gap-2"
                        >
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                          View Course
                        </motion.span>
                      </div>
                    </div>
                  </div>
                  <div
                    onClick={() => navigateTo('learning-academy')}
                    className="p-8 flex items-center justify-between bg-purple-50 cursor-pointer hover:bg-purple-100 transition-colors hover-float active-pop border-t border-purple-100"
                  >
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center shadow-inner">
                        <BookOpen className="w-7 h-7 text-purple-600" />
                      </div>
                      <div className={`transition-all duration-500 ${isCarouselTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                        <p className="text-sm font-black text-purple-600/50 uppercase tracking-widest">Master Class</p>
                        <p className="text-lg font-black text-gray-900">{featuredCourse.lessons} Interactive Lessons</p>
                      </div>
                    </div>
                    <ChevronRight className="w-8 h-8 text-purple-600 transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* AI DAILY TIP (Unified Premium Style) */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-cyan-500 to-blue-600 p-[2px] shadow-2xl transition-all">
            <div className="rounded-[calc(2.5rem-2px)] bg-white/10 backdrop-blur-xl overflow-hidden">
              {/* AI Header */}
              <div className="px-5 py-4 border-b border-white/20 flex items-center justify-between bg-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg">
                    <Bot className="w-6 h-6 text-cyan-500" />
                  </div>
                  <div>
                    <h4 className="text-white font-black text-sm uppercase tracking-wider">AI Daily Guidance</h4>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white/60 text-[10px] font-bold uppercase tracking-tight">Active Analysis</span>
                    </div>
                  </div>
                </div>
                <Sparkles className="w-5 h-5 text-cyan-200 animate-pulse" />
              </div>

              {/* Tip Content area */}
              <div className="p-5">
                <div className="bg-white/10 rounded-2xl border border-white/10 p-4 shadow-inner mb-4">
                  <p className={`text-sm text-white font-medium leading-relaxed transition-opacity duration-300 ${isAnimatingTip ? 'opacity-0' : 'opacity-100'}`}>
                    {currentTip}
                  </p>
                </div>

                <button
                  onClick={getNewTip}
                  disabled={isAnimatingTip}
                  className="w-full py-2.5 bg-white/20 hover:bg-white/30 text-white font-black rounded-xl text-[10px] uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover-float active-pop"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  Regenerate Tip
                </button>
              </div>
            </div>
          </div>

          {/* --- NEW RPG FEATURES --- */}
          <div className="pt-4 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center justify-between mb-4 px-1">
              <h3 className="font-black text-purple-600/80 tracking-widest uppercase text-[10px] drop-shadow-[0_0_8px_rgba(167,139,250,0.4)]">RPG Kingdom Hub</h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-1.5 bg-amber-100/50 px-2.5 py-1 rounded-full border border-amber-200/50">
                  <Coins className="w-3.5 h-3.5 text-amber-600" />
                  <span className="text-xs font-black text-amber-600 leading-none">{userData.gold}</span>
                </div>
              </div>
            </div>

            <div
              onClick={() => navigateTo('rpg-hub')}
              className="group cursor-pointer relative overflow-hidden rounded-[2.5rem] bg-white dark:bg-gray-900/40 shadow-xl transition-all hover:shadow-2xl border border-gray-100 dark:border-transparent mb-6 hover-float active-pop"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src="/thumbnails/rpg_hub_hero.png"
                  alt="Tooth Kingdom"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent" />

                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
                      <Shield className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-2xl font-black text-white drop-shadow-md uppercase tracking-tight">Kingdom Hero</h4>
                      <p className="text-purple-300 text-sm font-bold">Guardian of the Enamel</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                <div className="space-y-1.5 px-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    <span>Enamel Health</span>
                    <span className={userData.enamelHealth > 70 ? 'text-emerald-600' : userData.enamelHealth > 30 ? 'text-orange-600' : 'text-red-600'}>
                      {userData.enamelHealth}%
                    </span>
                  </div>
                  <div className="relative h-5 bg-slate-900/5 rounded-full overflow-hidden border border-slate-200/50 p-1 backdrop-blur-sm">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 shadow-lg animate-liquid ${userData.enamelHealth === 100
                        ? 'bg-gradient-to-r from-rose-500 via-red-500 to-rose-500'
                        : userData.enamelHealth > 70
                          ? 'bg-gradient-to-r from-emerald-400 via-teal-500 to-emerald-400'
                          : userData.enamelHealth > 30
                            ? 'bg-gradient-to-r from-orange-400 via-red-500 to-orange-400'
                            : 'bg-gradient-to-r from-red-600 via-pink-600 to-red-600'
                        }`}
                      style={{ width: `${userData.enamelHealth}%` }}
                    >
                      {/* Glossy reflection for liquid feel */}
                      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                    </div>
                    {userData.enamelHealth < 30 && <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none" />}
                  </div>
                </div>

                <div className="space-y-1.5 px-2 pb-2">
                  <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                    <span>Experience Points</span>
                    <span className="text-cyan-600">{userData.xp % 100}/100</span>
                  </div>
                  <div className="relative h-5 bg-slate-900/5 rounded-full overflow-hidden border border-slate-200/50 p-1 backdrop-blur-sm">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 rounded-full transition-all duration-1000 shadow-lg animate-liquid"
                      style={{ width: `${(userData.xp % 100)}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 mb-4 px-1 border-t border-gray-100 dark:border-white/5 pt-6">
              <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px]">Daily Quests</h3>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Heroic Daily Quest Card */}
              <div
                onClick={() => navigateTo('brushing-lesson')}
                className="w-full h-56 relative rounded-[2.5rem] overflow-hidden group shadow-xl hover:shadow-2xl transition-all cursor-pointer hover-float active-pop"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src="/thumbnails/habit_healthy_food.png"
                    alt="Healthy Food"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
                  <div className="absolute bottom-4 left-6">
                    <h4 className="text-xl font-black text-white drop-shadow-md uppercase tracking-tight">Eat Good Food</h4>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] font-black text-green-400 bg-black/40 px-2 py-0.5 rounded-full">+15 XP</span>
                      <span className="text-[10px] font-black text-red-400 bg-black/40 px-2 py-0.5 rounded-full">-5 HP</span>
                    </div>
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                      <Heart className="w-5 h-5 text-orange-600 fill-orange-500/20" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Daily Quest</span>
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-300">Master healthy eating</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigateTo('brushing-lesson');
                      }}
                      className="w-14 h-14 bg-transparent active:scale-90 transition-all flex items-center justify-center group/btn relative"
                    >
                      {/* Subtle glass glow ripple */}
                      <div className="absolute inset-0 bg-emerald-500/5 backdrop-blur-sm rounded-full blur-md group-hover/btn:bg-emerald-500/20 transition-all" />

                      {/* The Heroic Floating Tick */}
                      <Check
                        className="w-10 h-10 !text-[#00FF66] drop-shadow-[0_0_20px_rgba(0,255,102,0.9)] relative z-10 transition-transform group-hover/btn:scale-110"
                        style={{ color: '#00FF66' }}
                        strokeWidth={3}
                      />
                    </button>
                  </div>
                </div>
              </div>
              {/* Heroic Kingdom Bazaar Card */}
              <div
                onClick={() => navigateTo('kingdom-bazaar')}
                className="w-full h-56 relative rounded-[2.5rem] overflow-hidden group shadow-xl hover:shadow-2xl transition-all cursor-pointer hover-float active-pop"
              >
                <div className="relative h-44 overflow-hidden">
                  <TransparentImage
                    src="/thumbnails/bazaar_shop_icon.png"
                    alt="Bazaar"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 animate-float-ultra"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
                  <div className="absolute bottom-4 left-6">
                    <h4 className="text-2xl font-black text-white drop-shadow-md uppercase tracking-tight">Kingdom Bazaar</h4>
                    <p className="text-amber-400 text-xs font-black uppercase tracking-widest">Spend Gold on Gear!</p>
                  </div>
                </div>
                <div className="p-5 flex items-center justify-between bg-white dark:bg-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Shop & Trade</span>
                      <p className="text-xs font-bold text-gray-600 dark:text-gray-300">Upgrade your hero gear</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 transition-colors group-hover:text-amber-600 group-hover:bg-amber-50">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 mb-4 px-1 border-t border-gray-100 dark:border-white/5 pt-6">
              <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px]">Recent Achievements</h3>
              <button
                onClick={() => navigateTo('achievements')}
                className="text-[10px] font-black text-purple-600 uppercase tracking-widest hover:text-purple-700 transition-colors"
              >
                See All
              </button>
            </div>

            <div className="bg-white dark:bg-gray-900/40 rounded-[2.5rem] p-6 shadow-xl border border-gray-100 dark:border-transparent">
              <div className="grid grid-cols-4 gap-4">
                {ACHIEVEMENTS.slice(0, 4).map((ach) => {
                  const isUnlocked = userData.achievements.some(ua => ua.id === ach.id);
                  return (
                    <div
                      key={ach.id}
                      className="flex flex-col items-center group cursor-pointer transition-all"
                      onClick={() => navigateTo('achievements')}
                    >
                      <div className={`w-14 h-14 bg-gradient-to-br ${ach.color} rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform mb-2 p-1 relative overflow-hidden ${!isUnlocked ? 'opacity-50 grayscale' : ''}`}>
                        <TransparentImage
                          src={ach.thumbnail}
                          alt={ach.title}
                          className="w-full h-full object-contain drop-shadow-md animate-float-ultra"
                          locked={!isUnlocked}
                        />
                      </div>
                      <span className="text-[9px] font-black text-gray-500 dark:text-gray-400 text-center truncate w-full uppercase tracking-tighter">
                        {ach.title}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>


          {/* STREAK */}
          <div className="rounded-[2.5rem] p-5 shadow-xl relative overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg, #FFB86C 0%, #FF6AC1 100%)' }}>
            {/* Subtle background glow for streak */}
            <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-white/20 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                      <Flame className="w-5 h-5 fill-white text-white drop-shadow-md" />
                    </motion.div>
                    <h3 className="font-light text-lg tracking-wide" style={{ color: '#0A1F1F' }}>Current Streak</h3>
                  </div>
                  <p className="text-white/95 text-xs font-medium tracking-wide">Keep it going!</p>
                </div>
                <button
                  onClick={() => navigateTo('streak')}
                  className="px-4 py-1.5 rounded-full text-[10px] font-bold transition-all hover-float active-pop"
                  style={{ backgroundColor: 'rgba(255,255,255,0.3)', color: '#FFFFFF' }}
                >
                  Details
                </button>
              </div>

              <div className="flex items-center gap-5 mt-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center border-[3px] shadow-sm transform hover:scale-105 transition-transform" style={{ borderColor: 'rgba(255,255,255,0.6)', backgroundColor: 'transparent' }}>
                  <span className="text-3xl font-light text-white drop-shadow-sm">{userData.currentStreak}</span>
                </div>
                <div className="flex-1">
                  <div className="text-sm mb-2 text-white/95 font-medium"><span className="font-light text-xl text-white mr-1">{userData.currentStreak}</span> days in a row!</div>
                  <div className="h-2.5 rounded-full overflow-hidden shadow-inner" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((userData.currentStreak / 14) * 100, 100)}%` }}
                      transition={{ duration: 1.5, type: 'spring', bounce: 0.2 }}
                      className="h-full bg-white rounded-full shadow-md relative"
                    >
                      <div className="absolute right-0 top-0 bottom-0 w-4 bg-gradient-to-l from-white to-transparent opacity-50" />
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Persistent Bottom Nav (Mock) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-20 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <div className="glass-card bg-white/80 backdrop-blur-md border-t border-white/20 dark:border-transparent px-5 py-4 flex justify-around items-center rounded-[2.5rem] shadow-[0_-8px_32px_rgba(0,0,0,0.1)]">
            <button className="flex flex-col items-center gap-1 group hover-float active-pop">
              <div className="w-12 h-12 bg-purple-600 rounded-2xl flex items-center justify-center shadow-lg transition-all">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="text-xs font-bold text-purple-600 tracking-tight">Home</span>
            </button>
            <button onClick={() => navigateTo('chapters')} className="flex flex-col items-center gap-1 group hover-float active-pop">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-purple-50 transition-all">
                <BookOpen className="w-6 h-6 text-gray-400 group-hover:text-purple-500" />
              </div>
              <span className="text-xs font-bold text-gray-400 group-hover:text-purple-500 tracking-tight">Chapters</span>
            </button>
            <button onClick={() => navigateTo('progress')} className="flex flex-col items-center gap-1 group hover-float active-pop">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center hover:bg-purple-50 transition-all">
                <TrendingUp className="w-6 h-6 text-gray-400 group-hover:text-purple-500" />
              </div>
              <span className="text-xs font-bold text-gray-400 group-hover:text-purple-500 tracking-tight">Progress</span>
            </button>
            <button onClick={() => navigateTo('profile')} className="flex flex-col items-center gap-1 group hover-float active-pop">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-transparent group-hover:border-purple-300 transition-all">
                <UserAvatar characterId={userData.selectedCharacter} showBackground={false} className="w-full h-full object-cover scale-110" />
              </div>
              <span className="text-xs font-bold text-gray-400 group-hover:text-purple-500 tracking-tight">Profile</span>
            </button>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes chromaText {
          0% { color: #A78BFA; text-shadow: 0 0 12px rgba(167, 139, 250, 0.5); }
          25% { color: #22D3EE; text-shadow: 0 0 12px rgba(34, 211, 238, 0.5); }
          50% { color: #FBBF24; text-shadow: 0 0 12px rgba(251, 191, 36, 0.5); }
          75% { color: #F472B6; text-shadow: 0 0 12px rgba(244, 114, 182, 0.5); }
          100% { color: #A78BFA; text-shadow: 0 0 12px rgba(167, 139, 250, 0.5); }
        }
        .animate-chromaName {
          animation: chromaText 8s linear infinite;
          display: inline-block;
          font-weight: 900;
          filter: brightness(1.2);
        }
        .shadow-neon {
          box-shadow: 0 0 15px rgba(255, 255, 255, 0.5), 0 0 5px rgba(255, 255, 255, 0.2);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      ` }} />
    </div>
  );
}
