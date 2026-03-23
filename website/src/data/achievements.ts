import { Star, Trophy, Zap, Shield, Award, Target } from 'lucide-react';

export interface Achievement {
    id: number;
    title: string;
    description: string;
    icon: any;
    thumbnail: string;
    category: 'lessons' | 'streak' | 'special' | 'stars' | 'chapters';
    color: string;
    progress?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 1,
        title: 'First Steps',
        description: 'Complete your first lesson',
        icon: Star,
        thumbnail: '/thumbnails/medallion_first_steps_v2.png',
        category: 'lessons',
        color: 'from-purple-400 to-purple-600',
        progress: 100
    },
    {
        id: 2,
        title: 'Brush Master',
        description: 'Maintain a 3-day streak',
        icon: Trophy,
        thumbnail: '/thumbnails/medallion_streak_master_v2.png',
        category: 'streak',
        color: 'from-blue-400 to-blue-600',
        progress: 100
    },
    {
        id: 3,
        title: 'Star Hunter',
        description: 'Earn 50 total stars',
        icon: Zap,
        thumbnail: '/thumbnails/medallion_star_collector.png',
        category: 'stars',
        color: 'from-amber-400 to-amber-600',
        progress: 80
    },
    {
        id: 4,
        title: 'Chapter Champion',
        description: 'Finish Chapter 1',
        icon: Shield,
        thumbnail: '/thumbnails/medallion_chapter_champion_v2.png',
        category: 'chapters',
        color: 'from-green-400 to-green-600',
        progress: 100
    },
    {
        id: 5,
        title: 'Star Legend',
        description: 'Earn 250 total stars',
        icon: Star,
        thumbnail: '/thumbnails/medallion_star_legend_v2.png',
        category: 'special',
        color: 'from-blue-400 to-cyan-500',
        progress: 20
    },
    {
        id: 6,
        title: 'Perfect Week',
        description: 'Complete all tasks for 7 days',
        icon: Target,
        thumbnail: '/thumbnails/medallion_perfect_week_v2.png',
        category: 'streak',
        color: 'from-green-400 to-emerald-500',
        progress: 60
    },
    {
        id: 7,
        title: 'Master Brusher',
        description: 'Achieve perfect technique',
        icon: Trophy,
        thumbnail: '/thumbnails/medallion_master_brusher_3d.png',
        category: 'lessons',
        color: 'from-purple-400 to-pink-500',
        progress: 40
    },
    {
        id: 8,
        title: 'Kingdom Defender',
        description: 'Complete all chapters',
        icon: Award,
        thumbnail: '/thumbnails/medallion_kingdom_defender_v2.png',
        category: 'special',
        color: 'from-indigo-400 to-purple-600',
        progress: 10
    },
];
