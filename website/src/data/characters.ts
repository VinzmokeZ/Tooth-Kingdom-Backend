export interface Character {
    id: number;
    name: string;
    color: string;
    image: string;
    description: string;
}

export const characters: Character[] = [
    {
        id: 1,
        name: 'Luna',
        color: 'from-purple-400 to-pink-400',
        image: '/characters/CHIBI 1.svg',
        description: 'The Vanguard of Radiance. Armed with the Silver Seal, Luna leads the charge against the forces of decay, illuminating every smile with her courage.'
    },
    {
        id: 2,
        name: 'Max',
        color: 'from-blue-400 to-cyan-400',
        image: '/characters/CHIBI 2.svg',
        description: 'The Strategist of Sparkle. A brilliant engineer who designs advanced defense systems against the Sugar Swarm, Max always finds the smartest path to victory.'
    },
    {
        id: 3,
        name: 'Mia',
        color: 'from-pink-400 to-rose-400',
        image: '/characters/CHIBI 3.svg',
        description: 'The Enamel Enchanter. With her magical Minty Wand, Mia weaves spells of protection that harden the kingdom\'s defenses and bring joy to every morning routine.'
    },
    {
        id: 4,
        name: 'Zara',
        color: 'from-amber-400 to-orange-400',
        image: '/characters/CHIBI 5.svg',
        description: 'The Plaque Prowler. Moving faster than the swiftest rinse, Zara is a whirlwind of precision who can neutralize hidden sugar pockets before they strike.'
    },
    {
        id: 5,
        name: 'Kai',
        color: 'from-indigo-400 to-purple-400',
        image: '/characters/CHIBI 4.svg',
        description: 'The Stalwart Sentry. A mountain of resilience, Kai stands as an unmovable wall against the Acid Invasion, protecting the kingdom\'s foundations with his unbreakable will.'
    },
];

export const getCharacter = (id: number | null) => {
    return characters.find(c => c.id === id);
};
