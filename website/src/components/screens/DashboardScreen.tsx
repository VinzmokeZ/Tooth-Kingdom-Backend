import React, { useState } from 'react';
import { ScreenProps } from './types';
import { Menu, Bell, Star, BookOpen, ChevronRight, Play, ShoppingBag, Flame, Bot, Home, TrendingUp, Shield, Heart, Target, Sparkles, Check, Coins, Wand2, ArrowLeft, Video, X } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth, API_URL } from '../../context/AuthContext';
import { ACADEMY_COURSES } from '../../data/learningContent';
import { Browser } from '@capacitor/browser';
import { useSound } from '../../hooks/useSound';
// Removed NotificationOverlay as we are switching to dedicated Screen

export function DashboardScreen({ navigateTo, userData, updateUserData, isWebPreview }: ScreenProps & { isWebPreview?: boolean }) {
  const AI_TIPS = [
    "Great job checking in! Did you know brushing for 2 minutes is the perfect amount of time to defeat all sugar bugs?",
    "Fun Fact: Flossing once a day keeps the gum monsters away!",
    "Pro Tip: Don't rinse with water immediately after brushing—let the fluoride protect your teeth!",
    "Your streak is on fire! 🔥 Keep it up to unlock the Golden Shield soon.",
    "Did you know? Cheese is good for your teeth because it balances pH levels!"
  ];

  /* Add framer-motion import dynamically if needed, or rely on it from other components. We will assume it is imported above */

  const [currentTip, setCurrentTip] = useState(AI_TIPS[0]);
  const [isAnimatingTip, setIsAnimatingTip] = useState(false);
  const [showRewardAnimation, setShowRewardAnimation] = useState<{ type: 'xp' | 'health', amount: number } | null>(null);
  const [selectedVideoUrl, setSelectedVideoUrl] = useState<string | null>(null);

  const { playSound } = useSound();

  // Carousel State for Learning Academy
  const recommendedCourses = ACADEMY_COURSES.filter(c => c.aiRecommended);
  const [currentCourseIndex, setCurrentCourseIndex] = useState(0);
  const [nextCourseIndex, setNextCourseIndex] = useState(0);
  const [isCarouselTransitioning, setIsCarouselTransitioning] = useState(false);

  // Track rewards for animation
  const lastXp = React.useRef(userData.xp);
  const lastHealth = React.useRef(userData.enamelHealth);

  React.useEffect(() => {
    if (userData.xp > lastXp.current) {
      setShowRewardAnimation({ type: 'xp', amount: userData.xp - lastXp.current });
      lastXp.current = userData.xp;
      setTimeout(() => setShowRewardAnimation(null), 3000);
    }
    if (userData.enamelHealth > lastHealth.current) {
      setShowRewardAnimation({ type: 'health', amount: userData.enamelHealth - lastHealth.current });
      lastHealth.current = userData.enamelHealth;
      setTimeout(() => setShowRewardAnimation(null), 3000);
    }
  }, [userData.xp, userData.enamelHealth]);

  // Carousel Timer Logic
  React.useEffect(() => {
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

  // --- v4.0.8: Notification Polling with Logcat Debugging ---
  React.useEffect(() => {
    if (!userData.uid || userData.uid === 'undefined') {
      console.log("[POLLER] No valid UID, skipping poll.");
      return;
    }

    const pollNotifications = async () => {
      try {
        console.log(`[POLLER] Fetching notifications for UID: ${userData.uid}`);
        const res = await fetch(`${API_URL}/users/${userData.uid}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        
        const data = await res.json();
        if (data.success && data.userData?.notifications) {
          const currentCount = (userData.notifications || []).length;
          const newCount = data.userData.notifications.length;
          
          if (newCount !== currentCount) {
             console.log(`[POLLER] New notifications found! (${currentCount} -> ${newCount})`);
             updateUserData({ notifications: data.userData.notifications });
          } else {
             console.log("[POLLER] No change in notifications.");
          }
        }
      } catch (err) {
        console.error("[POLLER] background fetch failed:", err);
      }
    };

    const interval = setInterval(pollNotifications, 10000); // 10 seconds
    pollNotifications(); // Initial check

    return () => clearInterval(interval);
  }, [userData.uid, API_URL]);

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
    <div className="h-full bg-transparent flex flex-col lg:flex-row overflow-hidden relative">
      {/* Header (Fixed Top on Mobile, potentially sidebar on Desktop) */}
      <div className={`flex-none bg-gradient-to-br from-purple-500 to-purple-600 text-white px-5 pt-safe pb-4 z-50 shadow-xl border-b border-purple-400/30 ${isWebPreview ? 'lg:w-[350px] lg:h-full lg:border-r lg:border-b-0 lg:flex-col lg:px-8 lg:pt-12' : ''}`}>
        <div className={`flex justify-between items-center mb-5 relative z-[60] ${isWebPreview ? 'lg:mb-12 lg:flex-col lg:items-start lg:gap-8' : ''}`}>
          <button onClick={() => navigateTo('settings')} className="p-2 -ml-2 rounded-xl hover:bg-white/20 transition-all hover-float active-pop relative z-[60] cursor-pointer pointer-events-auto"><Menu className="w-6 h-6" /></button>
          
          {isWebPreview && (
            <div className="hidden lg:block">
               <h2 className="text-3xl font-black tracking-tight leading-none mb-2">Hello,<br/>{userData.name}!</h2>
               <p className="text-purple-100/70 text-sm font-bold uppercase tracking-widest">Kingdom Guardian</p>
            </div>
          )}

          {!isWebPreview && <h1 className="font-extrabold text-xl">Dashboard</h1>}
          
          <button
            onClick={() => navigateTo('notifications')}
            className={`relative p-2 -mr-2 hover:bg-white/20 rounded-xl transition-all hover-float active-pop z-[60] cursor-pointer pointer-events-auto ${isWebPreview ? 'lg:absolute lg:right-0 lg:top-0' : ''}`}
          >
            <Bell className="w-6 h-6 text-white" />
            {unreadNotifications > 0 && (
              <div className="absolute top-1 right-1 w-5 h-5 bg-pink-500 rounded-full text-[10px] flex items-center justify-center font-bold border-2 border-purple-600 animate-pulse">
                {unreadNotifications}
              </div>
            )}
          </button>
        </div>
        
        {/* Adaptive Profile Card (Simplified for Sidebar) */}
        <div className={`bg-white rounded-[2rem] p-5 shadow-lg mb-2 relative overflow-hidden ${isWebPreview ? 'lg:shadow-2xl lg:mb-8' : ''}`}>
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
            {[...Array(3)].map((_, i) => (
              <motion.div key={`bubble-${i}`} className="absolute rounded-full blur-3xl mix-blend-multiply"
                style={{ background: ['#8BE9FD', '#FFB86C', '#FF6AC1'][i % 3], opacity: 0.4, width: 160 + i * 30, height: 160 + i * 30, left: i === 0 ? '-10%' : i === 1 ? '40%' : '80%', top: i === 0 ? '-20%' : i === 1 ? '50%' : '-10%' }}
                animate={{ x: [0, 60, 0, -60, 0], y: [0, -60, 0, 60, 0], scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
                transition={{ duration: 15 + i * 5, repeat: Infinity, ease: 'linear' }} />
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
                    HI, <span className="animate-chromaText">{userData.name?.toUpperCase() || 'HERO'}</span>!
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 antialiased" style={{ color: '#7C3AED', textShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>Current XP</p>
                  <p className="text-lg font-black leading-none mb-1 antialiased animate-chromaText">{userData.xp.toLocaleString()}</p>
                  <div className="flex items-center gap-1.5 justify-end">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-gray-500/80 antialiased">Next Level</p>
                    <p className="text-sm font-black antialiased animate-chromaText">{((userData.level + 1) * 100).toLocaleString()}</p>
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
            </div>
          </div>
        </div>
      </div>
      
      {/* Scrollable Content Area - Multi-column grid on desktop */}
      <div className={`flex-1 overflow-y-auto no-scrollbar px-5 py-6 space-y-6 touch-pan-y overscroll-contain relative z-10 native-scroll-fix bg-transparent ${isWebPreview ? 'lg:grid lg:grid-cols-12 lg:gap-8 lg:px-10 lg:py-12 lg:space-y-0' : ''}`} 
           id="dashboard-scroll-area"
           style={{ WebkitOverflowScrolling: 'touch', flex: '1 1 auto' }}>
        
        {/* Left Column (Stats/Tips) or Top Main if not landscape */}
        <div className={isWebPreview ? 'lg:col-span-4 lg:space-y-8' : 'hidden'}>
           {/* AI DAILY TIP (Moved here for landscape balance) */}
           {isWebPreview && (
              <div className="hidden lg:block relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-cyan-500 to-blue-600 p-[2px] shadow-2xl transition-all">
                <div className="rounded-[calc(2.5rem-2px)] bg-white/10 backdrop-blur-xl overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg"><Bot className="w-6 h-6 text-cyan-500" /></div>
                      <h4 className="text-white font-black text-sm uppercase tracking-wider">Tanu AI Guide</h4>
                    </div>
                    <p className="text-white text-sm font-medium leading-relaxed">{currentTip}</p>
                  </div>
                </div>
              </div>
           )}
        </div>

        {/* Right Column (Game/Learning/Video) - Main Content */}
        <div className={isWebPreview ? 'lg:col-span-8 lg:space-y-8' : 'w-full space-y-6'}>
          {/* INLINE VIDEO PLAYER (Top-of-Feed) - Matching User Request */}
        <AnimatePresence>
          {selectedVideoUrl && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: 'auto', opacity: 1, marginBottom: 24 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              className="overflow-visible"
            >
              <div className="w-full bg-white rounded-[2rem] shadow-[0_15px_45px_rgba(0,0,0,0.2)] border-4 border-white relative flex flex-col group">
                {/* Compact Branded Header (Stacked) */}
                <div className="bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-4 flex items-center justify-between overflow-hidden rounded-t-[1.7rem]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center border border-white/20">
                      <Video className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black text-purple-100 uppercase tracking-widest leading-none mb-1">Featured Lesson</p>
                      <p className="text-white font-black text-sm md:text-lg truncate max-w-[150px] md:max-w-sm">
                        {ACADEMY_COURSES.find(c => c.url === selectedVideoUrl)?.title || "Premium Lesson"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Circular Back Button (On the Right) - THE ONLY CLOSE BUTTON */}
                  <button
                    onClick={() => setSelectedVideoUrl(null)}
                    className="w-11 h-11 rounded-full bg-white/30 hover:bg-white/40 flex items-center justify-center transition-all active:scale-95 border border-white/20 shadow-inner"
                  >
                     <ArrowLeft className="w-6 h-6 text-white" />
                  </button>
                </div>

                {/* Video Area (High Stability) */}
                <div className="w-full bg-black relative flex items-center justify-center overflow-hidden rounded-b-[1.7rem]" style={{ aspectRatio: '16/9', minHeight: '210px' }}>
                  <iframe
                    src={`${selectedVideoUrl}${selectedVideoUrl.includes('?') ? '&' : '?'}autoplay=1&modestbranding=1&rel=0`}
                    className="absolute inset-0 w-full h-full border-none"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PRIMARY FOCUS: Learning Academy (Dynamic AI Carousel - Refined) */}
        <div className="pt-4">
          <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px] mb-4 px-1">Learning Academy</h3>
          {(() => {
            const featuredCourse = recommendedCourses[currentCourseIndex];
            return (
              <div
                className="w-full bg-white dark:bg-black/20 rounded-[2.5rem] overflow-hidden shadow-2xl border border-purple-100 dark:border-transparent group transition-all backdrop-blur-sm"
              >
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (featuredCourse.url.includes('nocookie')) {
                      setSelectedVideoUrl(featuredCourse.url);
                      playSound('click');
                    } else if (featuredCourse.url.includes('.pdf') || featuredCourse.url.includes('mouthhealthy.org')) {
                      Browser.open({ 
                        url: featuredCourse.url,
                        toolbarColor: '#8b5cf6',
                      });
                    } else {
                      window.open(featuredCourse.url, '_blank');
                    }
                  }}
                  className={`relative overflow-hidden bg-gray-900 cursor-pointer active:scale-[0.98] transition-all ${isWebPreview ? 'lg:h-80' : 'h-48'}`}
                >
                  {/* Background (Previous) Image */}
                  <img
                    src={recommendedCourses[currentCourseIndex]?.thumbnail || '/thumbnails/tooth_kingdom_bg.png'}
                    alt="Current"
                    className={`absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ${isWebPreview ? 'lg:object-top' : ''}`}
                  />

                  {/* Foreground (Next) Image Layer */}
                  <img
                    src={recommendedCourses[nextCourseIndex]?.thumbnail || '/thumbnails/tooth_kingdom_bg.png'}
                    alt="Next"
                    className={`absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-all duration-1000 ${isCarouselTransitioning ? 'opacity-100 scale-100' : 'opacity-0 scale-110'} ${isWebPreview ? 'lg:object-top' : ''}`}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-end p-4 md:p-6 z-10 pointer-events-none">
                    <div className={`transition-all duration-700 ${isCarouselTransitioning ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-cyan-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">New Lesson</span>
                      </div>
                      <h3 className="text-white font-black text-xl leading-tight mb-1 drop-shadow-md">
                        {featuredCourse?.title || "Welcome to Tooth Kingdom"}
                      </h3>
                      <p className="text-white/90 text-xs font-bold line-clamp-1">
                        {featuredCourse?.description || "Start your dental adventure today!"}
                      </p>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl transform group-hover:rotate-12 transition-transform z-20">
                    <Play className="w-6 h-6 text-purple-600 fill-purple-600" />
                  </div>
                </div>
                <div
                  onClick={() => navigateTo('learning-academy')}
                  className="p-5 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white dark:from-white/5 dark:to-transparent cursor-pointer hover:from-purple-100 dark:hover:from-white/10 transition-colors hover-float active-pop"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-300" />
                    </div>
                    <div className={`transition-all duration-500 ${isCarouselTransitioning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                      <p className="text-[10px] font-black text-purple-600/50 dark:text-purple-300/50 uppercase tracking-widest">Master Class</p>
                      <p className="text-xs font-black text-gray-900 dark:text-white">{featuredCourse?.lessons || 0} Interactive Lessons</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-purple-600 dark:text-purple-400 transform group-hover:translate-x-1 transition-transform" />
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
            <h3 className="font-black text-gray-400 tracking-widest uppercase text-[10px]">RPG Kingdom Hub</h3>
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
                className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-110 ${isWebPreview ? 'lg:object-top' : ''}`}
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
                  <h4 className="text-lg font-black text-white drop-shadow-md uppercase tracking-tight">Eat Good Food</h4>
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
                <img
                  src="/thumbnails/bazaar_shop_icon.png"
                  alt="Bazaar"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent" />
                <div className="absolute bottom-4 left-6">
                  <h4 className="text-lg font-black text-white drop-shadow-md uppercase tracking-tight">Kingdom Bazaar</h4>
                  <p className="text-amber-400 text-[10px] font-black uppercase tracking-widest">Spend Gold on Gear!</p>
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
        </div>


        {/* STREAK (Moved down) */}
        <div className="bg-gradient-to-br from-orange-400 to-pink-500 rounded-3xl p-5 text-white shadow-xl">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-6 h-6 fill-white" />
                <h3 className="font-bold text-lg">Current Streak</h3>
              </div>
              <p className="text-white/80 text-sm">Keep it going!</p>
            </div>
            <button onClick={() => navigateTo('streak')} className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm hover:bg-white/30 transition-all hover-float active-pop">Details</button>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/40 backdrop-blur-sm">
              <span className="text-3xl font-bold">{userData.currentStreak}</span>
            </div>
            <div className="flex-1">
              <div className="text-sm mb-2"><span className="font-bold text-2xl">{userData.currentStreak}</span> days in a row!</div>
              <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min((userData.currentStreak / 14) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        </div> {/* Close Right Column (Line 258) */}
      </div> {/* Close Scroll Area (Line 235) */}

      {/* Notification overlay removed in favor of dedicated Notifications screen */}

      {/* Bottom Nav Spacer (Hidden in WebPreview Sidebar mode) */}
      {!isWebPreview && <div className="pb-24" />}

      {/* Persistent Bottom Nav (Mock) - Hidden in WebPreview Sidebar mode */}
      {!isWebPreview && (
        <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe z-50 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <div className="glass-card border-t border-white/20 dark:border-transparent px-5 py-3 flex justify-around items-center rounded-[2.5rem] shadow-[0_-8px_32px_rgba(0,0,0,0.15)] bg-white/90 backdrop-blur-xl">
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
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      ` }} />
    </div>
  );
}
