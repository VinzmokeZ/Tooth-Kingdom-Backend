export interface AppNotification {
  id: number;
  type: 'reminder' | 'achievement' | 'streak' | 'reward' | 'game' | 'social';
  title: string;
  message: string;
  time: string;
  read: boolean;
  color: string;
  iconName: string;
}

export interface UserData {
  uid?: string;
  selectedCharacter: number | null;
  currentStreak: number;
  bestStreak: number;
  totalDays: number;
  completedChapters: number;
  totalStars: number;
  level: number;
  achievements: { id: number; unlockedAt: string }[];
  unlockedRewards: number[];
  brushingLogs: { [date: string]: { morning: boolean; evening: boolean } };
  lastBrushedTimestamp: string | null;
  name?: string;
  email?: string;
  phone?: string;
  notifications?: AppNotification[];
  // --- RPG STATS (HIDDEN) ---
  enamelHealth: number; // 0-100
  xp: number;
  gold: number;
  questProgress: {
    completedQuests: number[];
    activeQuests: { id: number; progress: number }[];
  };
  inventory: { id: number; type: string }[];
  // --------------------------
  settings?: {
    darkMode: boolean;
    notifications: boolean;
    sound: boolean;
  };
  lastGameResult?: {
    score: number;
    stars: number;
    gameId: string;
  };
}

export interface ScreenProps {
  navigateTo: (screen: string) => void;
  userData: UserData;
  updateUserData: (updates: Partial<UserData>) => void;
}
