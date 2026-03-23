import React, { useState } from 'react';
import { ScreenProps } from './types';
import { ChevronLeft, Lock, CheckCircle, Star, ArrowRight, Hammer } from 'lucide-react';
import { chapters } from '../../data/chapters';
import { GameEngine } from '../games/GameEngine';
import { useGame } from '../../context/GameContext';
import { rpgService } from '../../services/rpgService';
import { useAuth, API_URL } from '../../context/AuthContext';

export function ChaptersScreen({ navigateTo, userData }: ScreenProps) {
  const { updateUserData } = useGame();
  const { currentUser } = useAuth();
  const [activeChapterId, setActiveChapterId] = useState<number | null>(null);

  const handleStartChapter = (chapterId: number) => {
    setActiveChapterId(chapterId);
  };

  const handleGameExit = () => {
    setActiveChapterId(null);
  };

  const handleGameComplete = async (score: number, stars: number) => {
    // 1. Update local state (offline-first)
    const rpgQuestUpdates = rpgService.trackQuestProgress(userData, 1, 20);
    const rpgRewards = rpgService.rewardTaskCompletion(userData, 'lesson');

    updateUserData({
      totalStars: userData.totalStars + stars,
      completedChapters: Math.max(userData.completedChapters, (activeChapterId || 0)),
      lastGameResult: {
        score,
        stars,
        gameId: `chapter-${activeChapterId}`
      },
      ...rpgQuestUpdates,
      ...rpgRewards
    });

    // 2. Sync to backend so terminal logs show real chapter completions
    if (currentUser?.uid && activeChapterId) {
      const uid = currentUser.uid;
      try {
        await fetch(`${API_URL}/game/${uid}/chapter-complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chapter_id: activeChapterId, stars, score })
        }).catch(() => {});

        await fetch(`${API_URL}/game/${uid}/xp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: 75, reason: `completed_chapter_${activeChapterId}` })
        }).catch(() => {});

        await fetch(`${API_URL}/quests/${uid}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quest_id: 'complete_chapter', increment: 1 })
        }).catch(() => {});
      } catch (e) {
        // Backend offline — local save already done above
      }
    }

    setActiveChapterId(null);
    navigateTo('reward-unlocked');
  };

  if (activeChapterId) {
    return (
      <div className="absolute inset-0 z-[100] bg-black overflow-hidden"> {/* Overlay within PhoneFrame */}
        <GameEngine
          chapterId={activeChapterId}
          onExit={handleGameExit}
          onComplete={handleGameComplete}
        />
      </div>
    );
  }

  return (
    <div className="h-full bg-transparent flex flex-col relative overflow-hidden transition-colors duration-500">
      {/* Content */}
      <div className="flex-1 overflow-y-auto relative z-10 native-scroll-fix">
        {/* Hero Banner Header (Moved Inside Scroll Area) */}
        <div className="relative h-[300px] md:h-[400px] overflow-hidden shadow-xl z-10">
          <img src="/thumbnails/banner_chapters.png" alt="Chapters Banner" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-purple-700/90 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 flex items-center gap-4">
            <button onClick={() => navigateTo('dashboard')} className="p-3 rounded-2xl bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-all shadow-lg animate-float hover:-translate-x-1 relative z-[60] pointer-events-auto cursor-pointer">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-black text-white drop-shadow-lg tracking-tight uppercase">Kingdom Map</h1>
          </div>
        </div>

        <div className="px-5 py-6 space-y-6">
          {/* Progress summary card */}
          <div
            className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-5 text-white shadow-xl mb-6 border border-white/20 dark:border-transparent"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold opacity-90">Your Journey</span>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold">
                {userData.completedChapters}/{chapters.length} Complete
              </span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <div
                className="h-full bg-white rounded-full transition-all duration-1000"
                style={{ width: `${(userData.completedChapters / chapters.length) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Chapters List */}
          <div className="space-y-4">
            {chapters.map((chapter) => {
              const isLocked = chapter.id > userData.completedChapters + 1;
              const isCompleted = chapter.id <= userData.completedChapters;

              return (
                <button
                  key={chapter.id}
                  onClick={() => !isLocked && handleStartChapter(chapter.id)}
                  disabled={isLocked}
                  className={`w-full glass-card dark:bg-black/20 rounded-3xl p-5 text-left border border-purple-100 dark:border-transparent transition-all animate-float ${isLocked ? 'opacity-60 grayscale-[0.5]' : 'hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]'
                    }`}
                >
                  {/* Chapter Information */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                        {chapter.id}
                      </span>
                      <span className="text-sm font-black text-purple-700 tracking-tight">CHAPTER {chapter.id}</span>
                    </div>
                    <div className="flex gap-2">
                      {!isLocked && (
                        <div className="flex items-center gap-1 bg-amber-100/80 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-amber-200">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span className="text-xs font-black text-amber-700">{chapter.stars}</span>
                        </div>
                      )}
                      {isCompleted && (
                        <div className="bg-green-100/80 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border border-green-200 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-green-600 fill-green-600" />
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-gray-900 mb-2 leading-tight">
                    {chapter.title}
                  </h3>

                  <p className="text-gray-600 text-xs font-medium leading-relaxed mb-4 line-clamp-2">
                    {chapter.description}
                  </p>

                  {/* Adventure Image/Lock status */}
                  <div className={`relative h-44 rounded-2xl overflow-hidden mb-4 shadow-inner ring-1 ring-black/5`}>
                    <img
                      src={chapter.illustration}
                      alt={chapter.title}
                      className="w-full h-full object-cover"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t from-black/20 to-transparent`} />

                    {isLocked && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center text-center p-4">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-2">
                          <Lock className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-white text-xs font-black uppercase tracking-widest">Locked</p>
                      </div>
                    )}

                    {!isLocked && !isCompleted && (
                      <div className="absolute bottom-3 right-3">
                        <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg scale-90 origin-bottom-right">
                          <span className="text-xs font-black text-purple-600">START</span>
                          <ArrowRight className="w-4 h-4 text-purple-600" />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <span className="px-2 py-0.5 bg-gray-100 rounded-md">{chapter.lessons} LESSONS</span>
                    <span>•</span>
                    <span>{isCompleted ? 'Perfected' : 'Waiting for Hero'}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Game Creation slots */}
          <div className="pt-10 pb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-purple-200"></div>
              <span className="text-[10px] font-black text-purple-300 uppercase tracking-[0.2em]">Workshop Mode</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-purple-200"></div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[1].map((i) => (
                <div
                  key={`custom-slot-${i}`}
                  className="w-full aspect-video rounded-[2.5rem] border-4 border-dashed border-purple-100 flex flex-col items-center justify-center glass-card group hover:border-purple-300 transition-all cursor-pointer shadow-inner animate-float [animation-delay:0.3s] hover:-translate-y-1"
                >
                  <div className="w-16 h-16 glass-card rounded-2xl shadow-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ring-4 ring-purple-50">
                    <Hammer className="w-8 h-8 text-purple-400 group-hover:text-purple-600 transition-colors" />
                  </div>
                  <h4 className="text-purple-400 font-black tracking-tight group-hover:text-purple-600">Your Custom Adventure</h4>
                  <p className="text-[10px] text-purple-300 mt-1 font-black uppercase tracking-widest">Expansion Slot Empty</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}