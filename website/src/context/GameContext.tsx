import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types from original App.tsx
import { UserData } from '../components/screens/types';

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

import { useAuth, API_URL } from './AuthContext';

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { currentUser } = useAuth();

  // Initialize state from localStorage or default
  const [userData, setUserData] = useState<UserData>(() => {
    try {
      const savedData = localStorage.getItem('toothKingdomUserData');
      if (savedData) {
        const parsed = JSON.parse(savedData);
        // MERGE with defaults to ensure new RPG fields (gold, xp, health) exist for existing users
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

  // Sync with Backend when User Changes (Login/Register)
  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser?.uid || currentUser.uid === 'undefined') return;

      try {
        // 1. Try to fetch from Backend
        const response = await fetch(`${API_URL}/users/${currentUser.uid}`);
        const data = await response.json();

        if (data.success && data.userData) {
          console.log("Loaded userData from Backend:", data.userData);
          setUserData(data.userData);
        } else {
          // 2. If new user (no data in backend yet) but has displayName, update local
          if (currentUser.displayName && userData.name !== currentUser.displayName) {
            setUserData(prev => ({ ...prev, name: currentUser.displayName || 'Champion' }));
          }
        }
      } catch (error) {
        console.warn("Failed to fetch from backend (Offline?), using local data.", error);
        // Fallback: Update name from Auth if local is default
        if (currentUser.displayName && userData.name === 'Champion') {
          setUserData(prev => ({ ...prev, name: currentUser.displayName || 'Champion' }));
        }
      }
    };

    fetchUserData();
  }, [currentUser]); // Run when user logs in/out

  // Save to localStorage AND Backend whenever userData changes
  useEffect(() => {
    // LocalStorage
    try {
      localStorage.setItem('toothKingdomUserData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }

    // Backend Sync (Debounced ideally, but direct for now)
    const saveToBackend = async () => {
      if (!currentUser?.uid || currentUser.uid === 'undefined') return;

      try {
        await fetch(`${API_URL}/users/${currentUser.uid}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userData: userData,
            name: userData.name, // Sync top-level fields too
            email: currentUser.email
          })
        });
      } catch (err) {
        console.warn("Failed to save to backend:", err);
      }
    };

    // Only save if we have a user and it's not the initial default load
    if (currentUser) {
      const timer = setTimeout(saveToBackend, 1000); // 1s debounce
      return () => clearTimeout(timer);
    }

  }, [userData, currentUser]);

  const updateUserData = (updates: Partial<UserData>) => {
    setUserData(prev => ({
      ...prev,
      ...updates,
      // Ensure nested objects like questProgress are also merged if updated
      questProgress: updates.questProgress ? { ...prev.questProgress, ...updates.questProgress } : prev.questProgress,
      settings: updates.settings ? { ...prev.settings, ...updates.settings } : prev.settings,
      notifications: updates.notifications ? updates.notifications : prev.notifications
    }));
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
