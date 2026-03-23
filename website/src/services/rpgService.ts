import { UserData } from '../components/screens/types';

export const RPG_CONFIG = {
    XP_PER_LESSON: 50,
    GOLD_PER_LESSON: 20,
    XP_PER_BRUSH: 30,
    GOLD_PER_BRUSH: 10,
    HEALTH_LOSS_ON_SKIP: 10,
    MAX_HEALTH: 100,
};

/**
 * Service to handle background RPG logic without UI impact.
 */
export const rpgService = {
    /**
     * Awards XP and Gold for completing a dental task.
     */
    rewardTaskCompletion: (userData: UserData, type: 'lesson' | 'brush'): Partial<UserData> => {
        const xpGain = type === 'lesson' ? RPG_CONFIG.XP_PER_LESSON : RPG_CONFIG.XP_PER_BRUSH;
        const goldGain = type === 'lesson' ? RPG_CONFIG.GOLD_PER_LESSON : RPG_CONFIG.GOLD_PER_BRUSH;
        const healthGain = type === 'brush' ? 20 : 0;

        let newXp = (userData.xp || 0) + xpGain;
        let newLevel = userData.level || 1;
        let newGold = (userData.gold || 0) + goldGain;
        let newHealth = Math.min(RPG_CONFIG.MAX_HEALTH, (userData.enamelHealth || 100) + healthGain);

        // Logic for Level Up (Simple: 100 XP per level)
        const xpToNextLevel = newLevel * 100;
        if (newXp >= xpToNextLevel) {
            newXp -= xpToNextLevel;
            newLevel += 1;
            newGold += 50;
        }

        const newNotifications = [...(userData.notifications || [])];
        const newNotif = {
            id: Date.now(),
            type: 'reward' as const,
            title: type === 'lesson' ? 'Lesson Complete!' : 'Quest Complete!',
            message: `You earned ${xpGain} XP${healthGain > 0 ? `, +${healthGain} Health` : ''} and ${goldGain} Gold.`,
            time: 'Just now',
            read: false,
            color: type === 'lesson' ? 'from-purple-500 to-indigo-600' : 'from-green-400 to-emerald-500',
            iconName: type === 'lesson' ? 'Award' : 'Sparkles'
        };
        newNotifications.unshift(newNotif);

        // Update Brushing Stats
        const today = new Date().toISOString().split('T')[0];
        const newBrushingLogs = { ...userData.brushingLogs };
        let newCurrentStreak = userData.currentStreak || 0;
        let newTotalDays = userData.totalDays || 0;
        let newBestStreak = Math.max(userData.bestStreak || 0, newCurrentStreak);

        if (type === 'brush') {
            newBrushingLogs[today] = {
                morning: true,
                evening: true // Simplified for prototype: a brush counts as a full day
            };
            newCurrentStreak += 1;
            newTotalDays += 1;
            if (newCurrentStreak > newBestStreak) {
                newBestStreak = newCurrentStreak;
            }
        }

        return {
            xp: newXp,
            level: newLevel,
            gold: newGold,
            enamelHealth: newHealth,
            brushingLogs: newBrushingLogs,
            currentStreak: newCurrentStreak,
            totalDays: newTotalDays,
            bestStreak: newBestStreak,
            totalStars: (userData.totalStars || 0) + (type === 'lesson' ? 3 : 1),
            notifications: newNotifications.slice(0, 20)
        };
    },

    /**
     * Calculates health loss if a requirement (like brushing) is missed.
     */
    applyHealthPenalty: (userData: UserData): Partial<UserData> => {
        const currentHealth = userData.enamelHealth ?? 100;
        const newHealth = Math.max(0, currentHealth - RPG_CONFIG.HEALTH_LOSS_ON_SKIP);

        const newNotifications = [...(userData.notifications || [])];
        if (newHealth < currentHealth) {
            newNotifications.unshift({
                id: Date.now(),
                type: 'reminder',
                title: 'Enamel Warning!',
                message: 'You missed a task! Your enamel health decreased.',
                time: 'Just now',
                read: false,
                color: 'from-red-500 to-pink-600',
                iconName: 'Bell'
            });
        }

        return {
            enamelHealth: newHealth,
            notifications: newNotifications.slice(0, 20)
        };
    },

    /**
     * Hidden quest tracking.
     */
    trackQuestProgress: (userData: UserData, questId: number, progressIncrement: number): Partial<UserData> => {
        const activeQuests = [...(userData.questProgress?.activeQuests || [])];
        const questIndex = activeQuests.findIndex(q => q.id === questId);

        if (questIndex > -1) {
            activeQuests[questIndex].progress += progressIncrement;
        } else {
            activeQuests.push({ id: questId, progress: progressIncrement });
        }

        // Check if quest completed (Mock condition: progress >= 100)
        const updatedQuests = activeQuests.filter(q => {
            if (q.progress >= 100) {
                // Award bonus if completed
                userData.gold = (userData.gold || 0) + 100;
                userData.questProgress.completedQuests.push(q.id);
                return false;
            }
            return true;
        });

        return {
            questProgress: {
                ...userData.questProgress,
                activeQuests: updatedQuests,
            },
            gold: userData.gold
        };
    }
};
