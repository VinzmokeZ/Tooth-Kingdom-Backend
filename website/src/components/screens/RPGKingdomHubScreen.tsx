import React from 'react';
import { ScreenProps } from './types';
import { ArrowLeft, Sparkles, Scroll, ChevronRight, ChevronLeft, BookOpen, Star, Home } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { getCharacter, characters } from '../../data/characters';
import { AnimatedBackground } from '../AnimatedBackground';

export function RPGKingdomHubScreen({ navigateTo, userData }: ScreenProps) {
    console.log("RPG Kingdom Hub - Version 1.2 (Premium Effects)");
    const [selectedHeroIndex, setSelectedHeroIndex] = React.useState(
        characters.findIndex(c => c.id === userData.selectedCharacter) || 0
    );

    const currentHero = characters[selectedHeroIndex];

    const handleNextHero = () => {
        setSelectedHeroIndex((prev) => (prev + 1) % characters.length);
    };

    const handlePrevHero = () => {
        setSelectedHeroIndex((prev) => (prev - 1 + characters.length) % characters.length);
    };

    const scrollToLore = () => {
        const loreBox = document.getElementById('lore-box');
        if (loreBox) {
            loreBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // 🏰 Unique Backgrounds for Each Character (Pearly High-Res)
    const CHARACTER_BGS: { [key: number]: string } = {
        1: "/thumbnails/vibrant_kingdom_lore_bg.png",
        2: "/thumbnails/dashboard_hero_castle.png",
        3: "/thumbnails/banner_academy.png",
        4: "/thumbnails/streak_galaxy_bg.png",
        5: "/thumbnails/tooth_kingdom_bg.png"
    };

    // Legendary Fairytale Dental Lore for the Hub
    const HERO_LORE: { [key: number]: { title: string, story: string, power: string } } = {
        1: {
            title: "Guardian of the Silver Seal",
            story: "Luna was born from a falling star that landed in the Minty Meadows. She wields the Silver Seal, a legendary shield that can block the most corrosive acid attacks with a single flash of radiance.",
            power: "Enamel Fortification"
        },
        2: {
            title: "Master of the Crystal Gear",
            story: "Max is the Grand Architect of the Teeth Kingdom. He built the Enamel Wall using fragments of ancient crystal toothbrushes, ensuring no cavity-forming sugar swarm could ever breach the gates.",
            power: "Structural Integrity"
        },
        3: {
            title: "The Minty Enchanter",
            story: "Mia discovered the Secret of the Sparkle in a hidden cave of floss-silk. Her voice can calm an irritated gum-forest, and her magic minty aura keeps the kingdom smelling like a fresh spring morning.",
            power: "Soothing Radiance"
        },
        4: {
            title: "Speed-Spirit of the Pearly Path",
            story: "Zara moves like a streak of lightning across the gum-line. She can clear ten thousand plaque-shadows in the blink of an eye, leaving behind nothing but a trail of sparkling gems.",
            power: "Plaque Purge"
        },
        5: {
            title: "Sentinel of the White Bastion",
            story: "Kai is as solid as a molar and as wise as an ancient molar-tree. He stands guard at the Great Incisor Gates, his presence alone enough to make even the strongest Sugar King flee in terror.",
            power: "Unbreakable Defense"
        }
    };

    const lore = HERO_LORE[currentHero.id] || { title: "Unsung Hero", story: "A brave protector of the kingdom.", power: "Pure Courage" };

    return (
        <div className="h-full bg-slate-950 text-white flex flex-col relative overflow-hidden font-sans selection:bg-rose-500/30">
            <AnimatedBackground />
            {/* 🏰 TRUE FULL-SCREEN Background Backdrop */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                    key={currentHero.id}
                    src={CHARACTER_BGS[currentHero.id] || CHARACTER_BGS[1]}
                    className="w-full h-full object-cover opacity-100 scale-100 animate-in fade-in duration-1000"
                    alt=""
                />
                {/* Visual Overlays for Professional Depth */}
                <div className="absolute inset-0 bg-slate-950/40" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-transparent to-transparent" />
            </div>

            {/* 🔝 Floating Header Controls */}
            <div className="relative z-50 flex items-center justify-between p-6">
                <button
                    onClick={() => navigateTo('dashboard')}
                    className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-xl text-white shadow-2xl active-pop hover:scale-110 transition-all border border-white/20 group"
                >
                    <ArrowLeft className="w-6 h-6 drop-shadow-lg group-hover:-translate-x-1 transition-transform" />
                </button>

                <button
                    onClick={scrollToLore}
                    className="flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-[0_0_20px_rgba(34,211,238,0.3)] active-pop hover:bg-white/20 transition-all group animate-pulse-slow"
                >
                    <BookOpen className="w-5 h-5 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] group-hover:scale-110 transition-transform" />
                    <span className="font-black text-[10px] uppercase tracking-[0.3em] text-white animate-chromaLore drop-shadow-md">Lore Registry</span>
                </button>
            </div>

            {/* 📱 Main Content Area (Scrollable within parent) */}
            <div className="flex-1 overflow-y-auto relative z-10 px-6">
                <div className="min-h-full flex flex-col pt-4 pb-24">

                    {/* 🎭 Hero Staging Area */}
                    <div className="flex-none relative flex flex-col items-center justify-center pt-20 pb-4 w-full overflow-visible">
                        <div className="relative group">
                            {/* Cinematic Aura (Tighter) */}
                            <div className={`absolute inset-0 blur-[60px] rounded-full animate-pulse transition-all duration-1000 ${currentHero.color.split(' ')[0].replace('from-', 'bg-')}/50`} />

                            <div className="relative z-10 animate-float-ultra py-1">
                                <UserAvatar
                                    characterId={currentHero.id}
                                    size="large"
                                    className="filter drop-shadow-[0_0_30px_rgba(255,255,255,0.4)] scale-[1.2]"
                                    showBackground={false}
                                />
                            </div>

                            {/* Floating Platform Shadow (Smaller) */}
                            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-black/40 blur-xl rounded-full scale-110" />
                        </div>

                        {/* Hero Name Badge & Navigation Controls */}
                        <div className="mt-6 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-2 duration-700 w-full px-4">
                            <div className="flex items-center justify-between w-full max-w-sm">
                                <button
                                    onClick={handlePrevHero}
                                    className="p-5 bg-white/10 backdrop-blur-2xl text-white rounded-2xl shadow-xl active-pop hover:scale-110 transition-all border border-white/20 flex items-center justify-center group"
                                >
                                    <ChevronLeft className="w-8 h-8 stroke-[3] group-hover:-translate-x-1 transition-transform" />
                                </button>

                                <div className="px-8 py-3 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full shadow-lg">
                                    <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white animate-chromaLore drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                                        {currentHero.name}
                                    </h2>
                                </div>

                                <button
                                    onClick={handleNextHero}
                                    className="p-5 bg-white/10 backdrop-blur-2xl text-white rounded-2xl shadow-xl active-pop hover:scale-110 transition-all border border-white/20 flex items-center justify-center group"
                                >
                                    <ChevronRight className="w-8 h-8 stroke-[3] group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>

                            {/* Navigation Indicator Dots */}
                            <div className="flex gap-3">
                                {characters.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-2.5 rounded-full transition-all duration-700 ${i === selectedHeroIndex ? 'w-8 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]' : 'w-2.5 bg-white/20'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* 📜 The Lore Box (Simplified Theme) */}
                    <div id="lore-box" className="mt-10 max-w-2xl mx-auto w-full scroll-mt-24 relative px-4">
                        <div className="bg-[#6D421F]/95 border-[8px] border-[#4A2C18] rounded-[3rem] p-10 shadow-[0_30px_60px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                            {/* Decorative Scroll Emblems */}
                            <div className="absolute -top-6 -right-6 opacity-10 rotate-12">
                                <Scroll className="w-32 h-32 text-white" />
                            </div>

                            <div className="relative z-10 space-y-8">
                                <div className="flex flex-col gap-4 border-b-2 border-white/10 pb-8">
                                    <div className="inline-flex items-center self-start gap-4 px-6 py-2 bg-white/10 rounded-xl shadow-lg border border-white/20">
                                        <Scroll className="w-5 h-5 text-white" />
                                        <h3 className="font-black text-white text-2xl uppercase tracking-tighter leading-none animate-chromaLore drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">{lore.title}</h3>
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-white/90 animate-chromaLore">
                                        Pearly Wisdom Power: {lore.power}
                                    </p>
                                </div>

                                <p className="text-white font-bold text-xl leading-relaxed italic font-serif py-2 animate-chromaLore">
                                    "{lore.story}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <style dangerouslySetInnerHTML={{
                    __html: `
        @import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@1,700&display=swap');
        .font-serif { font-family: 'Crimson Pro', serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
        @keyframes float-ultra {
          0%, 100% { transform: translateY(0px) scale(1.2); }
          50% { transform: translateY(-5px) scale(1.2); }
        }
        .animate-float-ultra {
          animation: float-ultra 4s ease-in-out infinite;
        }

        @keyframes pulse-slow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 211, 238, 0.3); }
          50% { box-shadow: 0 0 35px rgba(34, 211, 238, 0.6); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        @keyframes chromaLore {
          0% { color: #FFFFFF; text-shadow: 0 0 12px rgba(255, 255, 255, 0.6); filter: brightness(1.2); }
          16% { color: #A78BFA; text-shadow: 0 0 12px rgba(167, 139, 250, 0.6); filter: brightness(1.2); }
          33% { color: #22D3EE; text-shadow: 0 0 12px rgba(34, 211, 238, 0.6); filter: brightness(1.2); }
          50% { color: #FBBF24; text-shadow: 0 0 12px rgba(251, 191, 36, 0.6); filter: brightness(1.2); }
          66% { color: #F472B6; text-shadow: 0 0 12px rgba(244, 114, 182, 0.6); filter: brightness(1.2); }
          83% { color: #4ADE80; text-shadow: 0 0 12px rgba(74, 222, 128, 0.6); filter: brightness(1.2); }
          100% { color: #FFFFFF; text-shadow: 0 0 12px rgba(255, 255, 255, 0.6); filter: brightness(1.2); }
        }
        .animate-chromaLore {
          animation: chromaLore 8s linear infinite;
        }
      ` }} />
            </div>
        </div>
    );
}
