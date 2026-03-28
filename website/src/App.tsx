import React, { useState, useEffect, useRef } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { AppScreens } from './components/AppScreens';
import { ChibiGuide } from './components/common/ChibiGuide';
import { GameProvider, useGame } from './context/GameContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from 'next-themes';
import { Star, Heart, Award, Coins } from 'lucide-react';
import { LOCAL_BACKEND_URL } from './lib/firebase';
import { useSound } from './hooks/useSound';

// Inner component to handle screen state, now that data is in Context
const AppContent = () => {
  const [currentScreen, setCurrentScreen] = useState<string>('splash');
  const { userData, updateUserData } = useGame();
  const { theme, setTheme } = useTheme();
  const { currentUser, loading: authLoading } = useAuth();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const [lastSyncId, setLastSyncId] = useState<string | null>(null);
  const [showChibiGuide, setShowChibiGuide] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const { playSound } = useSound();

  // Global Reward Animation State
  const [rewardFeedback, setRewardFeedback] = useState<{ type: 'xp' | 'gold' | 'health' | 'reward', amount?: number, name?: string } | null>(null);
  const lastXp = useRef(userData.xp);
  const lastGold = useRef(userData.gold);
  const lastHealth = useRef(userData.enamelHealth);
  const lastUnlockedCount = useRef(userData.unlockedRewards.length);
  const lastLevel = useRef(userData.level);

  // Global Reward Listener
  useEffect(() => {
    if (userData.xp > lastXp.current) {
      setRewardFeedback({ type: 'xp', amount: userData.xp - lastXp.current });
      playSound('success');
      lastXp.current = userData.xp;
    }
    if ((userData.gold || 0) > (lastGold.current || 0)) {
      setRewardFeedback({ type: 'gold', amount: (userData.gold || 0) - (lastGold.current || 0) });
      playSound('success');
      lastGold.current = userData.gold;
    }
    if (userData.enamelHealth > lastHealth.current) {
      setRewardFeedback({ type: 'health', amount: userData.enamelHealth - lastHealth.current });
      lastHealth.current = userData.enamelHealth;
    }
    if (userData.unlockedRewards.length > lastUnlockedCount.current) {
      setRewardFeedback({ type: 'reward', name: 'New Reward Unlocked!' });
      playSound('achievement');
      lastUnlockedCount.current = userData.unlockedRewards.length;
    }
    if (userData.level > lastLevel.current) {
      playSound('levelUp');
      lastLevel.current = userData.level;
    }

    if (rewardFeedback) {
      const timer = setTimeout(() => setRewardFeedback(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [userData.xp, userData.gold, userData.enamelHealth, userData.unlockedRewards.length, rewardFeedback]);

  // Sync with Backend on login
  useEffect(() => {
    const syncWithBackend = async () => {
      if (currentUser && lastSyncId !== currentUser.uid && !authLoading) {
        try {
          console.log('[SYNC] Fetching user data from backend for:', currentUser.uid);
          const response = await fetch(`${LOCAL_BACKEND_URL}/users/${currentUser.uid}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.userData) {
              updateUserData(data.userData);
              setLastSyncId(currentUser.uid);
            }
          }
        } catch (error) {
          console.error('[SYNC] Error fetching user data:', error);
        }
      }
    };

    syncWithBackend();
  }, [currentUser, authLoading, lastSyncId, updateUserData]);

  // Push updates to backend
  useEffect(() => {
    const pushToBackend = async () => {
      // Only sync if we have a valid lastSyncId matching current user
      if (currentUser && lastSyncId === currentUser.uid) {
        if (userData.selectedCharacter !== null) {
          try {
            await fetch(`${LOCAL_BACKEND_URL}/users/${currentUser.uid}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userData })
            });
          } catch (error) {
            console.error('[SYNC] Error pushing user data:', error);
          }
        }
      }
    };

    const timer = setTimeout(pushToBackend, 2000);
    return () => clearTimeout(timer);
  }, [userData, currentUser, lastSyncId]);

  // Handling Initial Navigation based on Auth State
  useEffect(() => {
    if (!authLoading && !hasCheckedAuth) {
      if (currentUser) {
        if (currentScreen === 'splash') {
          // Role-based routing
          if (currentUser.role === 'parent') {
            setCurrentScreen('parent-dashboard');
          } else if (currentUser.role === 'teacher') {
            setCurrentScreen('teacher-dashboard');
          } else {
            setCurrentScreen('dashboard');
          }
        }
        setHasCheckedAuth(true);
      } else {
        if (currentScreen === 'splash') {
          const timer = setTimeout(() => {
            setCurrentScreen('signin');
            setHasCheckedAuth(true);
          }, 2000);
          return () => clearTimeout(timer);
        } else {
          // If on a protected screen (not in public list), force redirect to signin
          const publicScreens = ['splash', 'signin', 'otp-verification', 'onboarding', 'character-select'];
          if (!publicScreens.includes(currentScreen)) {
            setCurrentScreen('signin');
          }
          setHasCheckedAuth(true);
        }
      }
    }
  }, [currentUser, authLoading, hasCheckedAuth, currentScreen]);

  // Sync theme with userData settings on load/change
  // DEPRECATED: Dark mode removed by user request
  useEffect(() => {
    setTheme('light');
  }, [setTheme]);

  const navigateTo = (screen: string) => {
    playSound('click');
    setCurrentScreen(screen);
  };

  return (
    <>
      <AppScreens
        currentScreen={currentScreen}
        navigateTo={navigateTo}
        userData={userData}
        updateUserData={updateUserData}
        selectedStudent={selectedStudent}
        setSelectedStudent={setSelectedStudent}
      />

      {/* Global Reward Popup Overlay */}
      {rewardFeedback && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 pointer-events-none z-[1000] w-full max-w-[280px]">
          <div className="animate-bounce-up bg-white/95 backdrop-blur-md px-6 py-4 rounded-[2rem] shadow-2xl border-2 border-white/50 flex items-center gap-4 mx-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${rewardFeedback.type === 'xp' ? 'bg-cyan-100 text-cyan-600' :
              rewardFeedback.type === 'gold' ? 'bg-amber-100 text-amber-600' :
                rewardFeedback.type === 'health' ? 'bg-green-100 text-green-600' :
                  'bg-purple-100 text-purple-600'
              }`}>
              {rewardFeedback.type === 'xp' && <Star className="w-7 h-7 fill-cyan-500" />}
              {rewardFeedback.type === 'gold' && <Coins className="w-7 h-7 fill-amber-500" />}
              {rewardFeedback.type === 'health' && <Heart className="w-7 h-7 fill-green-500" />}
              {rewardFeedback.type === 'reward' && <Award className="w-7 h-7 fill-purple-500" />}
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                {rewardFeedback.type === 'reward' ? 'Achievement' : 'Gained'}
              </p>
              <p className={`text-xl font-black ${rewardFeedback.type === 'xp' ? 'text-cyan-600' :
                rewardFeedback.type === 'gold' ? 'text-amber-600' :
                  rewardFeedback.type === 'health' ? 'text-green-600' :
                    'text-purple-600'
                }`}>
                {rewardFeedback.type === 'reward' ? rewardFeedback.name : `+${rewardFeedback.amount} ${rewardFeedback.type.toUpperCase()}`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Global Chibi Guide Overlay - VERY TOP */}
      {showChibiGuide && currentScreen === 'dashboard' && (
        <ChibiGuide
          userName={userData.name || 'Hero'}
          onComplete={() => setShowChibiGuide(false)}
        />
      )}

      {/* DEV ONLY: Quick Role Switcher */}
      <div className="fixed bottom-4 left-4 z-[9999] flex flex-col gap-2">
        <button
          onClick={() => {
            const user = { ...currentUser, role: 'child' } as any;
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.reload();
          }}
          className="bg-purple-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg opacity-50 hover:opacity-100 transition-opacity"
        >
          Child Mode
        </button>
        <button
          onClick={() => {
            const user = { ...currentUser, role: 'parent' } as any;
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.reload();
          }}
          className="bg-indigo-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg opacity-50 hover:opacity-100 transition-opacity"
        >
          Parent Mode
        </button>
        <button
          onClick={() => {
            const user = { ...currentUser, role: 'teacher' } as any;
            localStorage.setItem('currentUser', JSON.stringify(user));
            window.location.reload();
          }}
          className="bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg opacity-50 hover:opacity-100 transition-opacity"
        >
          Teacher Mode
        </button>
      </div>
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>
      <div className="w-full h-full min-h-[100dvh] bg-white">
        <AuthProvider>
          <GameProvider>
            <AppContent />
          </GameProvider>
        </AuthProvider>
      </div>
    </ThemeProvider>
  );
}