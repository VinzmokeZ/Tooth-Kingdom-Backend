import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { UserData } from '../components/screens/types';
import { useAuth, API_URL } from './AuthContext';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';

interface GameContextType {
  userData: UserData;
  updateUserData: (updates: Partial<UserData>) => void;
  resetProgress: () => void;
}

const defaultUserData: UserData = {
  selectedCharacter: null,
  name: 'Champion',
  currentStreak: 7,
  bestStreak: 7,
  totalDays: 45,
  completedChapters: 2,
  totalStars: 127,
  level: 5,
  achievements: [
    { id: 1, unlockedAt: new Date().toISOString() },
    { id: 2, unlockedAt: new Date().toISOString() }
  ],
  unlockedRewards: [1, 2, 3, 4, 5],
  brushingLogs: {
    [new Date().toISOString().split('T')[0]]: { morning: true, evening: false }
  },
  lastBrushedTimestamp: new Date().toISOString(),
  enamelHealth: 100,
  xp: 0,
  gold: 0,
  questProgress: {
    completedQuests: [],
    activeQuests: []
  },
  inventory: [],
  notifications: [
    {
      id: 1,
      type: 'reminder',
      title: 'Time to Brush!',
      message: 'Evening brushing time. Keep your streak alive!',
      time: '5 min ago',
      read: false,
      color: 'from-blue-400 to-cyan-500',
      iconName: 'Bell'
    },
    {
      id: 2,
      type: 'achievement',
      title: 'New Achievement Unlocked!',
      message: 'You earned "Week Warrior" for 7-day streak',
      time: '1 hour ago',
      read: false,
      color: 'from-amber-400 to-orange-500',
      iconName: 'Award'
    }
  ],
  settings: {
    darkMode: false,
    notifications: true,
    sound: true
  }
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();

  const [userData, setUserData] = useState<UserData>(() => {
    try {
      const savedData = localStorage.getItem('toothKingdomUserData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        return {
          ...defaultUserData,
          ...parsed,
          questProgress: { ...defaultUserData.questProgress, ...(parsed.questProgress || {}) },
          settings: { ...defaultUserData.settings, ...(parsed.settings || {}) }
        };
      }
      return defaultUserData;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultUserData;
    }
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid || currentUser.uid === 'undefined') return;

      try {
        // v5.0 Senior Fix: Use CapacitorHttp for Android Reliability
        const options = {
          url: `${API_URL}/users/${currentUser.uid}`,
          headers: { 'Content-Type': 'application/json' }
        };
        const res: HttpResponse = await CapacitorHttp.get(options);
        const data = res.data;

        if (data.success && data.userData) {
          console.log("Loaded userData from Backend:", data.userData);
          setUserData(data.userData);
        } else {
          if (currentUser.displayName && userData.name !== currentUser.displayName) {
            setUserData(prev => ({ ...prev, name: currentUser.displayName || 'Champion' }));
          }
        }
      } catch (error) {
        console.warn("Failed to fetch from backend (Offline?), using local data.", error);
        if (currentUser.displayName && userData.name === 'Champion') {
          setUserData(prev => ({ ...prev, name: currentUser.displayName || 'Champion' }));
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    try {
      localStorage.setItem('toothKingdomUserData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }

    const saveToBackend = async () => {
      if (!currentUser?.uid || currentUser.uid === 'undefined') return;

      try {
        const options = {
          url: `${API_URL}/users/${currentUser.uid}`,
          headers: { 'Content-Type': 'application/json' },
          data: {
            userData: userData,
            name: userData.name,
            email: currentUser.email
          }
        };
        await CapacitorHttp.post(options);
      } catch (err) {
        console.warn("Failed to save to backend:", err);
      }
    };

    if (currentUser) {
      const timer = setTimeout(saveToBackend, 1000);
      return () => clearTimeout(timer);
    }
  }, [userData, currentUser]);

  const checkAchievements = (data: UserData): UserData => {
    const newAchievements = [...data.achievements];
    let updated = false;

    const addAch = (id: number) => {
      if (!newAchievements.some(a => a.id === id)) {
        newAchievements.push({ id, unlockedAt: new Date().toISOString() });
        updated = true;
      }
    };

    if (data.xp > 0) addAch(1);
    if (data.currentStreak >= 3) addAch(2);
    if (data.currentStreak >= 7) addAch(6);
    if (data.totalStars >= 50) addAch(3);
    if (data.totalStars >= 250) addAch(5);
    if (data.completedChapters >= 1) addAch(4);
    if (data.completedChapters >= 3) addAch(8);
    if (data.level >= 5) addAch(7);

    return updated ? { ...data, achievements: newAchievements } : data;
  };

  const updateUserData = (updates: Partial<UserData>) => {
    setUserData(prev => {
      const updated = {
        ...prev,
        ...updates,
        questProgress: updates.questProgress ? { ...prev.questProgress, ...updates.questProgress } : prev.questProgress,
        settings: updates.settings ? { ...prev.settings, ...updates.settings } : prev.settings,
        notifications: updates.notifications ? updates.notifications : prev.notifications
      };
      return checkAchievements(updated);
    });
  };

  const resetProgress = () => {
    setUserData(defaultUserData);
  };

  return (
    <GameContext.Provider value={{ userData, updateUserData, resetProgress }}>
      {children}
    </GameContext.Provider>
  );
};
