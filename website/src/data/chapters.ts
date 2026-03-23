import thumbnailHero from '../assets/tooth_kingdom_bg.png';
import assetBrushingBasics from '../assets/brushing_basics.png';
import assetSugarMonsters from '../assets/sugar_monsters.png';
import assetColoringBook from '../assets/coloring_book.png';
import assetNutritionGuide from '../assets/nutrition_guide.png';
import assetWorksheets from '../assets/worksheets.png';
import assetMouthBg from '../assets/mouth_bg.png';
import assetChapter6 from '../assets/chapter6.png';
import assetChapter5 from '../assets/chapter5.png';

export interface Chapter {
    id: number;
    title: string;
    description: string;
    lessons: number;
    stars: number;
    completed: boolean;
    locked: boolean;
    color: string;
    illustration: string;
    gameType?: string; // Identifier for the mini-game
    gameConfig?: any; // Specific config for the game
    gameUrl?: string; // External URL for iframe games
}

export const chapters: Chapter[] = [
    {
        id: 1,
        title: 'Cavity Miner Adventure',
        description: 'Dig deep into the tooth to find and remove hidden cavities! Use the virtual D-Pad to move.',
        lessons: 5,
        stars: 15,
        completed: true,
        locked: false,
        color: 'from-purple-100 to-purple-50',
        illustration: assetBrushingBasics,
        gameType: 'external',
        gameUrl: '/games/cavity-miner/index.html',
        gameConfig: { targetScore: 500, timeLimit: 120 }
    },
    {
        id: 2,
        title: 'Shark Dentist Challenge',
        description: 'Help the royal shark keep his teeth clean! Use your precision to brush and extract rotted teeth before the timer runs out.',
        lessons: 6,
        stars: 18,
        completed: true,
        locked: false,
        color: 'from-blue-100 to-blue-50',
        illustration: assetSugarMonsters,
        gameType: 'external',
        gameUrl: '/games/shark-dentist/index.html',
        gameConfig: { germSpeed: 1.5, spawnRate: 1000 }
    },
    {
        id: 3,
        title: 'Flossing Adventures',
        description: 'Master the art of flossing between your teeth and unlock secret passages in the Tooth Kingdom!',
        lessons: 5,
        stars: 15,
        completed: false,
        locked: false,
        color: 'from-pink-100 to-pink-50',
        illustration: assetColoringBook,
        gameType: 'flossing-fantasy',
        gameConfig: {}
    },
    {
        id: 4,
        title: 'Healthy Eating Habits',
        description: 'Learn which foods help keep your teeth strong and which ones to avoid in your quest!',
        lessons: 7,
        stars: 21,
        completed: false,
        locked: true,
        color: 'from-green-100 to-green-50',
        illustration: assetNutritionGuide,
        gameType: 'food-sort-fantasy',
        gameConfig: {}
    },
    {
        id: 5,
        title: 'Tooth Kingdom Master',
        description: 'Become the ultimate dental health champion and earn your crown in the Tooth Kingdom!',
        lessons: 8,
        stars: 24,
        completed: false,
        locked: false,
        color: 'from-amber-100 to-amber-50',
        illustration: assetChapter5,
        gameType: 'external',
        gameUrl: '/games/plaque-pluck/index.html',
        gameConfig: {}
    },
    {
        id: 6,
        title: 'Battle Dentist',
        description: 'Join the last Battle Dentist in a retro-style quest to defend the kingdom from dental decay! Use your tools to blast away the grime.',
        lessons: 4,
        stars: 12,
        completed: false,
        locked: true,
        color: 'from-cyan-100 to-cyan-50',
        illustration: assetChapter6,
        gameType: 'external',
        gameUrl: '/games/beatrix-dentist/index.html',
        gameConfig: { dirtCount: 15 }
    },
];
