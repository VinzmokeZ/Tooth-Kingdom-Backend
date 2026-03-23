
import { UserData } from '../components/screens/types';

// Knowledge base for the Dental AI Chatbot
const DENTAL_KNOWLEDGE_BASE = [
    {
        keywords: ['brush', 'how to', 'technique'],
        responses: [
            "Great question! specific_user! To brush like a pro, maintain a 45-degree angle against the gums. Use gentle circular motions—don't scrub too hard! 🦷✨",
            "Imagine you're massaging your teeth! Gentle circles are the key. Don't forget the back teeth—they like to hide sugar bugs! 🦠",
            "Two minutes is the magic number! Try singing 'Happy Birthday' twice while you brush. That's about the right time! 🎵"
        ]
    },
    {
        keywords: ['floss', 'string'],
        responses: [
            "Flossing is like a secret agent mission! You need to get between the teeth where the brush can't reach. Once a day keeps the dentist away! 🕵️‍♀️",
            "Did you know your toothbrush misses 35% of your tooth surfaces? That's why we floss! It cleans the tight spots between teeth.",
            "Gentle is the way! Slide the floss up and down against the side of each tooth. Don't snap it on your gums—ouch! 🚫"
        ]
    },
    {
        keywords: ['sugar', 'candy', 'sweet', 'chocolate'],
        responses: [
            "Sugar bugs throw a party when you eat sweets! 🍬 If you have a treat, drink lots of water or brush afterwards to send them home.",
            "Sugar turns into acid that can hurt your teeth. It's okay to have treats sometimes, just make sure to clean your teeth right after! 🍭",
            "Healthy snacks like apples and carrots are actually nature's toothbrush! They help clean your teeth while you eat. 🍎"
        ]
    },
    {
        keywords: ['pain', 'hurt', 'ache', 'ouch'],
        responses: [
            "Oh no! If your tooth hurts, it's really important to tell a grown-up so they can take you to the dentist. They are tooth superheroes! 🦸‍♂️",
            "Tooth pain is a sign that a sugar bug might have made a house in your tooth. The dentist can help fix it and make it feel better! 🏥",
            "Don't worry! Dentists are friends who help stop the ouchies. Make sure to point to exactly where it hurts."
        ]
    },
    {
        keywords: ['scared', 'afraid', 'fear'],
        responses: [
            "It's okay to be nervous! But guess what? The dentist's chair is actually a spaceship! 🚀 And the dentist is the pilot helping you keep your smile bright.",
            "Dentists are super nice! They have cool gadgets and sometimes even give you a prize for being brave! 🎁",
            "You are a Tooth Kingdom Champion! Champions are brave. Taking deep breaths helps a lot! 😤"
        ]
    }
];

const DEFAULT_RESPONSES = [
    "That's interesting! Tell me more about your teeth! 🦷",
    "I'm learning more about dental health every day. Remember to brush twice a day! ✨",
    "You're doing great! Keep asking questions. Smart kids have healthy smiles! 🧠",
    "I'm not sure about that one, but I know that water is the best drink for your teeth! 💧"
];

// Helper to get a random item from an array
const getRandom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export const getAIChatResponse = (input: string, userName: string = 'Champion'): string => {
    const lowerInput = input.toLowerCase();

    for (const topic of DENTAL_KNOWLEDGE_BASE) {
        if (topic.keywords.some(k => lowerInput.includes(k))) {
            const response = getRandom(topic.responses);
            return response.replace('specific_user', userName);
        }
    }

    return getRandom(DEFAULT_RESPONSES);
};

// Personality traits for the report
const REPORT_PERSONALITIES = [
    { style: 'Encouraging', emojis: ['🌟', '💪', '🦷'], intros: ['Fantastic progress, Champion!', 'You are making us proud!', 'The Tooth Kingdom is safer thanks to you!'], outros: ['Keep that smile shining!', 'Onward to victory!'] },
    { style: 'Scientific', emojis: ['🧪', '📊', '🔍'], intros: ['Data analysis complete.', 'I have scanned your historical logs.', 'Statistical overview updated.'], outros: ['Optimizing for next session...', 'Data-driven smiles are the brightest.'] },
    { style: 'Playful', emojis: ['🎉', '👾', '🎈'], intros: ['Whoa! Look at those stats!', 'Guess who is a dental superstar?', 'Sugar bugs are trembling!'], outros: ['You rock!', 'Level up incoming!'] },
    { style: 'Zen/Calm', emojis: ['🌊', '🧘', '✨'], intros: ['Find your focus in the routine.', 'A peaceful mind starts with a clean mouth.', 'Your journey is steady and bright.'], outros: ['Be one with the brush.', 'Peace and polish.'] },
    { style: 'Competitive', emojis: ['🏆', '⚡', '🔥'], intros: ['You are CRUSHING it!', 'Leaderboard status: ELITE.', 'No sugar bug can stand in your way!'], outros: ['Stay on top!', 'Victory is yours!'] }
];

export const generateAIProgressReport = (userData: UserData): string => {
    const logs = userData.brushingLogs || {};
    const totalBrushes = Object.values(logs).reduce((acc: number, log: { morning: boolean; evening: boolean }) => acc + (log.morning ? 1 : 0) + (log.evening ? 1 : 0), 0);
    const streak = userData.currentStreak;
    const stars = userData.totalStars;

    const personality = REPORT_PERSONALITIES[Math.floor(Math.random() * REPORT_PERSONALITIES.length)];
    const intro = personality.intros[Math.floor(Math.random() * personality.intros.length)];
    const outro = personality.outros[Math.floor(Math.random() * personality.outros.length)];
    const date = new Date().toLocaleDateString();

    // Random choice helpers
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

    let analysis = "";
    let recommendation = "";

    // Variety in Analysis
    if (streak > 5) {
        analysis = pick([
            `Your ${streak}-day streak is legendary! You've become a true master of consistency.`,
            `Behold! The ${streak}-day fire! Your dedication to dental health is unmatched.`,
            `Six days and beyond! Your consistency score is in the top 1% of the Kingdom.`
        ]);
    } else if (streak > 0) {
        analysis = pick([
            `A solid ${streak}-day start! You're building the foundations of a hero.`,
            `Momentum is building! That ${streak}-day streak is looking strong.`,
            `Great job maintaining your ${streak}-day presence. Keep the fire burning!`
        ]);
    } else {
        analysis = pick([
            `Every hero has a quiet day. Today is the perfect moment for a comeback!`,
            `Let's restart the engine. One brush today starts a brand new legacy.`,
            `Sugar bugs think they've won... prove them wrong with a session right now!`
        ]);
    }

    // Variety in Recommendations
    if (totalBrushes % 7 === 0 && totalBrushes > 0) {
        recommendation = pick([
            "Milestone alert! Since you've hit a multiple of 7, try focusing on your gum line today.",
            "Special Mission: Spend an extra 10 seconds on your 'hidden' back molars tonight.",
            "Pro Tip: You're doing great! Have you tried flossing before your evening brush?"
        ]);
    } else if (stars > 100) {
        recommendation = pick([
            "Rich in stars! Why not trade some in for a new character skin soon?",
            "With such high star power, you should lead a raid against the Cavity King!",
            "Your star count is astronomical! Keep the high-quality sessions coming."
        ]);
    } else {
        recommendation = pick([
            "Focus on the '2-minute rule' to maximize your star earnings per session.",
            "Try to make the evening brush a non-negotiable part of your bedtime ritual.",
            "Did you know? Brushing gently in circles protects your enamel better than scrubbing!"
        ]);
    }

    return `
**AI Progress Analysis ${personality.emojis[0]}**
Date: ${date}

**Style:** ${personality.style} Analysis

**${intro}**

**Overview:**
${analysis}

**Stat Highlight:**
- Total Sessions: ${totalBrushes} ${personality.emojis[1]}
- Current Streak: ${streak} days ${personality.emojis[2]}
- Star Power: ${stars} ⭐

**Coach's Tip:**
${recommendation}

**${outro}**
  `.trim();
};
