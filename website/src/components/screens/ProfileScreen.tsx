import React from 'react';
import { ScreenProps } from './types';
import { getAIChatResponse, generateAIProgressReport } from '../../utils/aiMockService';
import { ACHIEVEMENTS } from '../../data/achievements';
import { ArrowLeft, Edit2, Save, X, Trophy, Star, History, Calendar, CheckCircle, TrendingUp, Sparkles, Zap, Brain, Target, Menu, Gift, Home, Check, Play, Clock, Users, ShoppingBag, Shield, Coins, Award, ChevronLeft, Bot, Flame, Share2, Settings } from 'lucide-react';
import { TransparentImage } from '../common/TransparentImage';
import { UserAvatar, getCharacterName } from '../common/UserAvatar';
import { useAuth } from '../../context/AuthContext';
import { AnimatedBackground } from '../AnimatedBackground';

export function ProfileScreen({ navigateTo, userData, updateUserData }: ScreenProps) {
  const { signOut } = useAuth();
  const [aiReport, setAiReport] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [selectedAchievement, setSelectedAchievement] = React.useState<any>(null);
  const [equippedIds, setEquippedIds] = React.useState<number[]>([1]); // Default item 1 equipped

  const toggleEquip = (id: number) => {
    setEquippedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Map item IDs to thumbnails from Bazaar
  const ITEM_THUMBNAILS: { [key: number]: string } = {
    1: '/thumbnails/item_golden_toothbrush.png',
    2: '/thumbnails/item_crystal_shield.png',
    3: '/thumbnails/item_minty_elixir.png',
    4: '/thumbnails/item_sparkle_cape.png',
    5: '/thumbnails/item_berry_buff.png'
  };

  // Local edit state
  const [editName, setEditName] = React.useState(userData.name || 'Tooth Defender');
  const [editSettings, setEditSettings] = React.useState(userData.settings || { darkMode: false, notifications: true, sound: true });

  const isDarkMode = userData.settings?.darkMode || false;

  const handlePreSave = () => {
    // If name changed, ask for confirmation
    if (editName !== userData.name) {
      setShowConfirm(true);
    } else {
      // Just saving settings, no confirmation needed for name
      confirmSave();
    }
  };

  const [isSaving, setIsSaving] = React.useState(false);
  const [showSuccess, setShowSuccess] = React.useState(false);

  const confirmSave = () => {
    setIsSaving(true);

    // Simulate network delay for better UX
    setTimeout(() => {
      updateUserData({
        name: editName,
        settings: editSettings
      });

      setIsSaving(false);
      setShowSuccess(true);
      setShowConfirm(false);

      // Close modal after success message
      setTimeout(() => {
        setShowSuccess(false);
        setIsEditing(false);
      }, 1500);
    }, 800);
  };

  const toggleSetting = (key: keyof typeof editSettings) => {
    setEditSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigateTo('signin');
    } catch (error) {
      console.error("Logout failed:", error);
      alert("Sign out failed. Please try again.");
    }
  };

  const generateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      try {
        const report = generateAIProgressReport(userData);
        setAiReport(report);
      } catch (error) {
        console.error("AI Report Generation Failed:", error);
        setAiReport("AI Connection Error. \n\nWe couldn't generate your report right now. Keep brushing and try again later!");
      } finally {
        setIsGenerating(false);
      }
    }, 2000);
  };

  // Achievement data removed - now using centralized ACHIEVEMENTS from data/achievements.ts

  return (
    <div className={`h-full flex flex-col transition-colors duration-300 relative overflow-hidden ${isDarkMode ? 'text-white' : 'bg-transparent'}`}>
      <AnimatedBackground />
      {/* Header */}
      <div className={`sticky top-0 px-5 pt-5 pb-8 z-20 shadow-lg transition-colors duration-300 relative ${isDarkMode ? 'bg-slate-900 border-b border-slate-800' : 'bg-gradient-to-br from-purple-500 to-purple-600'}`}>
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigateTo('dashboard')} className="p-2 -ml-2 rounded-full hover:bg-white/20 transition hover-float active-pop">
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold drop-shadow-sm text-white">My Profile</h1>
          <button
            onClick={() => {
              setEditName(userData.name || 'Tooth Defender');
              setIsEditing(true);
            }}
            className="p-2 -mr-2 rounded-full hover:bg-white/20 transition hover-float active-pop"
          >
            <Edit2 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Profile card using the new glassmorphism utility */}
        <div className={`rounded-3xl p-6 shadow-inner transition-colors duration-300 ${isDarkMode ? 'glass-card-dark' : 'glass-card'}`}>
          <div className="flex flex-col items-center text-center mb-4">
            <div className="relative mb-4 animate-float-gentle z-0">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 blur-2xl opacity-40 animate-pulse -z-10"></div>
              <UserAvatar
                characterId={userData.selectedCharacter}
                size="xlarge"
                className="filter drop-shadow-xl relative z-10"
                showBackground={false}
              />
            </div>
            <h2 className={`text-2xl font-extrabold mb-1 drop-shadow-md ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              {userData.name}
            </h2>
            <p className={`text-sm font-medium tracking-wide flex items-center justify-center gap-1.5 ${isDarkMode ? 'text-slate-300' : 'text-gray-100'}`}>
              Level {userData.level} Champion <Trophy className="w-4 h-4 fill-white/20" />
            </p>
          </div>

          <div className="flex items-center justify-center gap-2 bg-black/20 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
              <span className="font-bold text-white drop-shadow-sm">{userData.totalStars} Stars</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto px-5 py-5 space-y-5 relative z-10`}>

        {/* AI Progress Report Card */}
        <div className={`p-6 rounded-[2rem] shadow-xl shadow-blue-500/10 border relative overflow-hidden group transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-br from-white via-blue-50/40 to-cyan-50/60 border-blue-100/50'}`}>
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100 rounded-full blur-[80px] -mr-20 -mt-20 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-100 rounded-full blur-[60px] -ml-16 -mb-16 opacity-40"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg relative group-hover:scale-105 transition-transform">
                <Bot className={`w-8 h-8 text-white ${isGenerating ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <h3 className={`font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AI Progress Report</h3>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>Personal Coach</p>
              </div>
            </div>

            {aiReport ? (
              <div className="animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-500 to-cyan-400 p-[1.5px] shadow-xl">
                  <div className="rounded-[calc(2rem-1.5px)] bg-slate-900 overflow-hidden">
                    {/* Header */}
                    <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-white/5">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-cyan-300" />
                        <h4 className="text-white font-black text-[10px] uppercase tracking-widest">Analysis Ready</h4>
                      </div>
                      <button onClick={() => setAiReport(null)} className="bg-white/10 p-1.5 rounded-full text-white/60 hover:text-white transition-colors">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-5 max-h-[350px] overflow-y-auto no-scrollbar bg-gradient-to-b from-transparent to-black/20">
                      <div className="space-y-4 text-white/90 font-medium leading-relaxed">
                        {aiReport.split('\n\n').map((paragraph, pIdx) => (
                          <div key={pIdx} className="relative bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-inner">
                            {paragraph.split('\n').map((line, lIdx) => {
                              const isHeader = line.startsWith('**') && line.endsWith('**');
                              const content = line.replace(/\*\*/g, '');

                              if (isHeader) return <h5 key={lIdx} className="text-cyan-300 font-bold uppercase tracking-wider text-[10px] mb-2">{content}</h5>;
                              return <p key={lIdx} className="text-sm leading-relaxed opacity-95">{content}</p>;
                            })}
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setAiReport(null)}
                        className="w-full mt-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl text-xs uppercase tracking-widest transition-all border border-white/10 active:scale-95 shadow-lg"
                      >
                        Dismiss Analysis
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  Our AI identifies patterns in your brushing habits to give you heroic tips!
                </p>
                <button
                  onClick={generateReport}
                  disabled={isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover-float active-pop transition-all text-xs uppercase tracking-widest disabled:opacity-50 animate-float"
                >
                  {isGenerating ? 'Synthesizing Data...' : '✨ Generate Hero Report'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Reward Collection Box */}
        <div className={`p-6 shadow-xl shadow-amber-500/10 border relative overflow-hidden transition-all rounded-[2rem] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-br from-white via-amber-50/40 to-orange-50/60 border-amber-100/50'}`}>
          <div className="absolute top-0 right-0 w-40 h-40 bg-amber-100 rounded-full blur-[80px] -mr-20 -mt-20 opacity-50"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-100 rounded-full blur-[60px] -ml-16 -mb-16 opacity-30"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center shadow-inner border border-amber-100 group-hover:rotate-6 transition-transform">
                  <ShoppingBag className="w-7 h-7 text-amber-600" />
                </div>
                <div>
                  <h3 className={`font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>My Reward Collection</h3>
                  <p className={`text-sm font-medium ${isDarkMode ? 'text-amber-500' : 'text-amber-600'}`}>Equipped & Stashed</p>
                </div>
              </div>
              <div className="bg-amber-100/50 px-4 py-2.5 rounded-2xl border border-amber-200 flex items-center gap-2 shadow-sm">
                <Coins className="w-4 h-4 text-amber-600" />
                <span className="font-black text-sm text-amber-700">{userData.gold}</span>
              </div>
            </div>

            {userData.inventory && userData.inventory.length > 0 ? (
              <div className="grid grid-cols-4 gap-4">
                {userData.inventory.map((item, idx) => {
                  const isEquipped = equippedIds.includes(item.id);
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleEquip(item.id)}
                      className={`aspect-square rounded-2xl flex items-center justify-center border-2 border-dashed p-2 group/item transition-all cursor-pointer relative hover:border-amber-400 hover:bg-amber-50/50 hover-float active-pop animate-float ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50/50'} ${isEquipped ? 'ring-2 ring-amber-400 ring-offset-2 border-solid bg-amber-50/80 shadow-md translate-y-[-4px]' : ''}`}
                      style={{ animationDelay: `${idx * 0.2}s` }}
                    >
                      <TransparentImage
                        src={ITEM_THUMBNAILS[item.id] || '/thumbnails/bazaar_shop_icon.png'}
                        alt="Reward"
                        className="w-full h-full object-contain drop-shadow-md transition-transform duration-500 group-hover/item:scale-110"
                      />
                      {isEquipped && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-amber-400 to-orange-500 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white z-20 animate-in zoom-in-50 duration-300">
                          <Check className="w-3 h-3 stroke-[4]" />
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* Visual padding for empty slots */}
                {Array.from({ length: Math.max(0, 4 - (userData.inventory?.length || 0)) }).map((_, i) => (
                  <div key={`empty-${i}`} className={`aspect-square rounded-2xl flex items-center justify-center border-2 border-dashed ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <Gift className="w-6 h-6 text-slate-200" />
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 rounded-[2.5rem] border-2 border-dashed ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <img src="/thumbnails/bazaar_shop_icon.png" className="w-16 h-16 mx-auto mb-4 opacity-10 grayscale" alt="Empty" />
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No gear collected yet</p>
                <button
                  onClick={() => navigateTo('kingdom-bazaar')}
                  className="mt-4 text-xs font-bold text-blue-600 underline tracking-wider hover:text-blue-700 transition-colors hover-float active-pop"
                >
                  VISIT THE BAZAAR
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Stats overview */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Trophy, value: userData.totalStars, label: 'Total Stars', color: 'from-amber-400 to-orange-500', bgGradient: 'bg-gradient-to-br from-white to-amber-50/50 border-amber-100', target: 'achievements' },
            { icon: Flame, value: userData.currentStreak, label: 'Day Streak', color: 'from-orange-400 to-pink-500', bgGradient: 'bg-gradient-to-br from-white to-orange-50/50 border-orange-100', target: 'calendar' },
            { icon: Calendar, value: userData.totalDays, label: 'Total Days', color: 'from-blue-400 to-cyan-500', bgGradient: 'bg-gradient-to-br from-white to-blue-50/50 border-blue-100', target: 'calendar' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div
                key={i}
                onClick={() => navigateTo(stat.target as any)}
                className={`rounded-2xl p-4 text-center border transition-all cursor-pointer hover-float active-pop ${isDarkMode ? 'glass-card-dark' : `shadow-sm ${stat.bgGradient}`}`}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl mb-2 flex items-center justify-center mx-auto shadow-md ring-2 ${isDarkMode ? 'ring-slate-700' : 'ring-white/50'}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{stat.value}</div>
                <div className={`text-xs font-extrabold mt-1 tracking-tight ${isDarkMode ? 'text-slate-400' : 'text-purple-700/70'}`}>{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Recent Achievements (Interactable) */}
        <div className={`rounded - 3xl p - 5 shadow - sm border relative overflow - hidden transition - all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-gradient-to-br from-white via-purple-50/40 to-pink-50/60 border-purple-100/50'} `}>
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-40"></div>
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className={`font - bold ${isDarkMode ? 'text-white' : 'text-slate-800'} `}>Recent Achievements</h3>
            <button onClick={() => navigateTo('achievements')} className="text-sm font-bold text-purple-600 hover-float active-pop">See All</button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {ACHIEVEMENTS.slice(0, 4).map((ach) => {
              const isUnlocked = userData.achievements.some(ua => ua.id === ach.id);
              return (
                <button
                  key={ach.id}
                  onClick={() => setSelectedAchievement(ach)}
                  className="flex flex-col items-center group hover:-translate-y-1 transition-all"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${ach.color} rounded-full flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform mb-1 p-1 overflow-hidden relative ${!isUnlocked ? 'opacity-70' : ''}`}>
                    <TransparentImage
                      src={ach.thumbnail}
                      alt={ach.title}
                      className="w-full h-full object-contain drop-shadow-sm animate-float-ultra"
                      locked={!isUnlocked}
                    />
                  </div>
                  <span className={`text-[10px] font-bold text-center truncate w-full ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{ach.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          {[
            { id: 'achievements', icon: Award, label: 'Achievements', sub: `${userData.achievements.length} unlocked badges`, color: 'from-amber-400 to-orange-500', bg: 'bg-amber-100', text: 'text-amber-600', val: userData.achievements.length, gradient: 'bg-gradient-to-br from-white via-amber-50/40 to-orange-50/40 border-amber-100/50' },
            { id: 'stats', icon: TrendingUp, label: 'Statistics', sub: 'View your progress & insights', color: 'from-blue-400 to-cyan-500', bg: 'bg-blue-100', text: 'text-blue-600', val: null, gradient: 'bg-gradient-to-br from-white via-blue-50/40 to-cyan-50/40 border-blue-100/50' },
            { id: 'calendar', icon: Calendar, label: 'Activity Calendar', sub: 'Track your daily progress', color: 'from-green-400 to-emerald-500', bg: 'bg-green-100', text: 'text-green-600', val: null, gradient: 'bg-gradient-to-br from-white via-green-50/40 to-emerald-50/40 border-green-100/50' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => navigateTo(item.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-3xl shadow-sm hover:shadow-md transition-all border group hover-float active-pop ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : `${item.gradient}`}`}
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                <item.icon className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className={`font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{item.label}</h3>
                <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-gray-500'}`}>{item.sub}</p>
              </div>
              {item.val !== null && (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isDarkMode ? 'bg-slate-800 text-white' : `${item.bg} ${item.text}`}`}>
                  {item.val}
                </div>
              )}
            </button>
          ))}
        </div>


        {/* Progress summary */}
        <div className={`rounded-3xl p-5 text-white shadow-lg relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-gradient-to-br from-purple-600 to-indigo-700'}`}>
          {!isDarkMode && (
            <>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl -ml-10 -mb-5"></div>
            </>
          )}
          <h3 className="font-bold mb-4 relative z-10 drop-shadow-md">Progress Summary</h3>
          <div className="space-y-4 relative z-10">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium opacity-90">Chapters Completed</span>
                <span className="font-bold">{userData.completedChapters}/5</span>
              </div>
              <div className="h-2.5 bg-black/20 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
                  style={{ width: `${(userData.completedChapters / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Sign Out Button (Simpler approach as requested) */}
        <div className="pb-10">
          <div className="pb-10">
            <button
              onClick={handleSignOut}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95 ${isDarkMode
                ? 'bg-red-950/30 text-red-400 border border-red-500/20 hover:bg-red-900/40 hover:-translate-y-1'
                : 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:-translate-y-1'
                }`}
            >
              <ArrowLeft className="w-5 h-5 rotate-180" />
              Sign Out
            </button>
          </div>
        </div>


        {/* Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl animate-scaleIn border ${isDarkMode ? 'bg-slate-900 text-white border-slate-700' : 'bg-white text-gray-900 border-white'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold flex items-center gap-2">
                  <span className="animate-chromaName">{userData.name || 'Hero'}</span>
                  <span className="opacity-30">:</span>
                  <span>Profile</span>
                </h2>
                <button
                  onClick={() => setIsEditing(false)}
                  className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {showSuccess ? (
                <div className="flex flex-col items-center justify-center py-10 animate-fadeIn">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-lg animate-bounce">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Saved!</h3>
                  <p className="text-gray-500 dark:text-gray-400">Your profile has been updated.</p>
                </div>
              ) : (
                <>
                  <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6 scrollbar-thin">
                    {!showSuccess && (
                      <div className="space-y-6">
                        <div>
                          <label className={`text-xs font-black uppercase tracking-widest mb-3 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Champion Name</label>
                          <div className="relative group">
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className={`w-full bg-transparent border-2 rounded-2xl p-4 font-bold outline-none transition-all ${isDarkMode ? 'border-slate-800 focus:border-purple-500 text-white' : 'border-gray-100 focus:border-purple-500 text-gray-900'}`}
                              placeholder="Enter hero name..."
                            />
                            <Edit2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400 opacity-50" />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className={`text-xs font-black uppercase tracking-widest mb-1 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Game Settings</label>
                          {[
                            { key: 'notifications', label: 'Push Notifications', icon: Bot },
                            { key: 'sound', label: 'Sound Effects', icon: Zap },
                            { key: 'darkMode', label: 'Dark Mode (Experimental)', icon: Bot }
                          ].map((setting) => (
                            <button
                              key={setting.key}
                              onClick={() => toggleSetting(setting.key as any)}
                              className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-gray-50 border-gray-100'}`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-slate-700' : 'bg-white shadow-sm'}`}>
                                  <setting.icon className="w-5 h-5 text-purple-600" />
                                </div>
                                <span className="font-bold text-sm">{setting.label}</span>
                              </div>
                              <div className={`w-12 h-6 rounded-full relative transition-colors ${editSettings[setting.key as keyof typeof editSettings] ? 'bg-green-500' : 'bg-gray-300'}`}>
                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${editSettings[setting.key as keyof typeof editSettings] ? 'right-1' : 'left-1'}`} />
                              </div>
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={handlePreSave}
                          disabled={isSaving}
                          className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-black rounded-2xl shadow-[0_8px_0_rgb(88,28,135)] hover:shadow-[0_4px_0_rgb(88,28,135)] hover:translate-y-[4px] active:translate-y-[6px] active:shadow-none transition-all text-xs uppercase tracking-[0.2em] disabled:opacity-50 border-t border-white/20"
                        >
                          {isSaving ? 'Synchronizing...' : 'Save Changes'}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}


        {/* Settings Modal */}
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fadeIn">
            <div className={`w-full max-w-md rounded-3xl p-6 shadow-2xl animate-scaleIn ${isDarkMode ? 'bg-slate-900 text-white border border-slate-800' : 'bg-white text-gray-900'}`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold">App Settings</h2>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className={`p - 2 rounded - full ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'} `}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable container for settings */}
              <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6 scrollbar-thin">
                {/* Dark Mode */}
                <div className="flex items-center justify-between p-1">
                  <div className="flex items-center gap-3">
                    <div className={`p - 3 rounded - 2xl ${isDarkMode ? 'bg-slate-800 text-purple-400' : 'bg-purple-100 text-purple-600'} `}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold block">Dark Mode</span>
                      <span className={`text - xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} `}>Switch to a dark theme</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSetting('darkMode')}
                    className={`w - 14 h - 8 rounded - full transition - colors relative ${editSettings.darkMode ? 'bg-purple-600' : 'bg-slate-700'} `}
                  >
                    <div className={`absolute top - 1 left - 1 w - 6 h - 6 bg - white rounded - full shadow - md transition - transform ${editSettings.darkMode ? 'translate-x-6' : 'translate-x-0'} `}></div>
                  </button>
                </div>

                {/* Notifications */}
                <div className="flex items-center justify-between p-1">
                  <div className="flex items-center gap-3">
                    <div className={`p - 3 rounded - 2xl ${isDarkMode ? 'bg-slate-800 text-blue-400' : 'bg-blue-100 text-blue-600'} `}>
                      <Share2 className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold block">Notifications</span>
                      <span className={`text - xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} `}>Get game reminders</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSetting('notifications')}
                    className={`w - 14 h - 8 rounded - full transition - colors relative ${editSettings.notifications ? 'bg-green-500' : 'bg-slate-700'} `}
                  >
                    <div className={`absolute top - 1 left - 1 w - 6 h - 6 bg - white rounded - full shadow - md transition - transform ${editSettings.notifications ? 'translate-x-6' : 'translate-x-0'} `}></div>
                  </button>
                </div>

                {/* Sound */}
                <div className="flex items-center justify-between p-1">
                  <div className="flex items-center gap-3">
                    <div className={`p - 3 rounded - 2xl ${isDarkMode ? 'bg-slate-800 text-orange-400' : 'bg-orange-100 text-orange-600'} `}>
                      <Bot className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold block">Sound Effects</span>
                      <span className={`text - xs ${isDarkMode ? 'text-slate-400' : 'text-gray-500'} `}>Enable game sounds</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSetting('sound')}
                    className={`w - 14 h - 8 rounded - full transition - colors relative ${editSettings.sound ? 'bg-green-500' : 'bg-slate-700'} `}
                  >
                    <div className={`absolute top - 1 left - 1 w - 6 h - 6 bg - white rounded - full shadow - md transition - transform ${editSettings.sound ? 'translate-x-6' : 'translate-x-0'} `}></div>
                  </button>
                </div>

                {/* Version Info */}
                <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                  <button
                    onClick={handleSignOut}
                    className="w-full py-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-2xl font-bold hover:bg-red-100 transition-all mb-4"
                  >
                    Sign Out
                  </button>
                  <p className={`text - xs text - center ${isDarkMode ? 'text-slate-500' : 'text-gray-400'} `}>
                    Tooth Kingdom Adventure v1.0.0
                  </p>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => {
                    updateUserData({ settings: editSettings });
                    setIsSettingsOpen(false);
                  }}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition-all"
                >
                  Apply Settings
                </button>
              </div>
            </div>
          </div>
        )}


        {/* Achievement Detail Modal */}
        {selectedAchievement && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
            <div className={`w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative text-center ${isDarkMode ? 'bg-slate-900 text-white' : 'bg-white text-gray-900'}`}>
              <button
                onClick={() => setSelectedAchievement(null)}
                className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className={`w-24 h-24 bg-gradient-to-br ${selectedAchievement.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl ring-8 ${isDarkMode ? 'ring-slate-800' : 'ring-purple-50'} p-2 overflow-hidden`}>
                <img
                  src={selectedAchievement.thumbnail}
                  alt={selectedAchievement.title}
                  className="w-full h-full object-contain drop-shadow-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    const icon = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
                    if (icon) icon.style.display = 'block';
                  }}
                />
                <selectedAchievement.icon className="w-12 h-12 text-white hidden" />
              </div>

              <h3 className="text-2xl font-black mb-2">{selectedAchievement.title}</h3>
              <p className={`text-lg font-medium mb-8 ${isDarkMode ? 'text-slate-400' : 'text-gray-600'}`}>
                {selectedAchievement.desc}
              </p>

              <button
                onClick={() => setSelectedAchievement(null)}
                className="w-full py-4 bg-purple-600 text-white font-bold rounded-2xl hover:bg-purple-700 transition-colors"
              >
                Awesome!
              </button>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
            <div className={`w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-scaleIn ${isDarkMode ? 'bg-slate-900 text-white border border-slate-700' : 'bg-white text-gray-900'}`}>
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Edit2 className="w-8 h-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-extrabold mb-2">Change Name?</h3>
                <p className={`text - sm ${isDarkMode ? 'text-slate-300' : 'text-gray-600'} `}>
                  Are you sure you want to change your name to <span className="font-bold text-purple-600">"{editName}"</span>?
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className={`flex - 1 py - 3 rounded - xl font - bold ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-gray-100 hover:bg-gray-200'} `}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSave}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all"
                >
                  Yes, Change It
                </button>
              </div>
            </div>
          </div>
        )}

        <style dangerouslySetInnerHTML={{
          __html: `
@keyframes slideUp {
  from { transform: translateY(100%); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
.animate-slideUp {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes scaleIn {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-scaleIn {
  animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fadeIn {
  animation: fadeIn 0.2s ease-out;
}
@keyframes float-gentle {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}
.animate-float-gentle {
  animation: float-gentle 3s ease-in-out infinite;
}
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
/* Custom scrollbar for dark mode */
${isDarkMode ? `
  div::-webkit-scrollbar-thumb {
    background-color: #475569;
  }
  div::-webkit-scrollbar-track {
    background-color: #020617;
  }
` : ''}
` }} />
      </div>
    </div >
  );
}