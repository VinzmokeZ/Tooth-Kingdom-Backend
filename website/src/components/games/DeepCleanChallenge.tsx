import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brush, Sparkles, Wand2 } from 'lucide-react';
import { GameProps } from './types';
import { GameStartScreen, GameVictoryScreen } from './common/GameUI';

// Asset imports
import toothKingdomBg from '../../assets/tooth_kingdom_bg.png';
import heroChibi from '../../assets/CHIBI 5.svg';

type Screen = 'start' | 'playing' | 'victory';

interface DirtPatch {
    id: number;
    x: number;
    y: number;
    size: number;
    health: number;
    type: 'grime' | 'food' | 'slime';
}

export function DeepCleanChallenge({ onComplete, onExit }: GameProps) {
    const [screen, setScreen] = useState<Screen>('start');
    const [dirtPatches, setDirtPatches] = useState<DirtPatch[]>([]);
    const [cleanliness, setCleanliness] = useState(0);
    const [cursorPos, setCursorPos] = useState({ x: 50, y: 50 });
    const [isCleaning, setIsCleaning] = useState(false);
    const gameAreaRef = useRef<HTMLDivElement>(null);

    const totalDirt = 15;
    const maxScore = 500;

    const initGame = useCallback(() => {
        const patches: DirtPatch[] = [];
        for (let i = 0; i < totalDirt; i++) {
            patches.push({
                id: i,
                x: 15 + Math.random() * 70,
                y: 20 + Math.random() * 60,
                size: 40 + Math.random() * 40,
                health: 100,
                type: ['grime', 'food', 'slime'][Math.floor(Math.random() * 3)] as DirtPatch['type'],
            });
        }
        setDirtPatches(patches);
        setCleanliness(0);
        setScreen('playing');
    }, []);

    const handlePointerMove = (e: React.PointerEvent | React.MouseEvent) => {
        if (screen !== 'playing' || !gameAreaRef.current) return;

        const rect = gameAreaRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setCursorPos({ x, y });

        if (isCleaning) {
            setDirtPatches(prev => {
                let anyCleaned = false;
                const updated = prev.map(patch => {
                    const dx = patch.x - x;
                    const dy = patch.y - y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 10) {
                        anyCleaned = true;
                        return { ...patch, health: Math.max(0, patch.health - 5) };
                    }
                    return patch;
                }).filter(p => p.health > 0);

                if (prev.length !== updated.length) {
                    const removedCount = prev.length - updated.length;
                    setCleanliness(c => Math.min(100, c + (removedCount / totalDirt) * 100));
                }

                return updated;
            });
        }
    };

    useEffect(() => {
        if (cleanliness >= 100 && screen === 'playing') {
            setTimeout(() => setScreen('victory'), 1000);
        }
    }, [cleanliness, screen]);

    // Fixed star logic: 0 stars for 0 points
    const stars = cleanliness > 0 ? (cleanliness >= 100 ? 3 : cleanliness >= 70 ? 2 : 1) : 0;
    const score = Math.floor((cleanliness / 100) * maxScore);

    // Handle game completion
    useEffect(() => {
        if (screen === 'victory') {
            onComplete(score, stars);
        }
    }, [screen, score, stars, onComplete]);

    return (
        <div
            className="absolute inset-0 w-full h-full flex flex-col overflow-hidden bg-cover bg-center bg-no-repeat touch-none"
            style={{ backgroundImage: `url(${toothKingdomBg})` }}
            onPointerMove={handlePointerMove}
            onPointerDown={() => setIsCleaning(true)}
            onPointerUp={() => setIsCleaning(false)}
            ref={gameAreaRef}
        >
            <div className="absolute inset-0 bg-cyan-900/30 pointer-events-none z-0" />

            <AnimatePresence mode="wait">
                {screen === 'start' && (
                    <GameStartScreen
                        key="start"
                        title="Deep Clean"
                        subtitle="Kingdom Challenge!"
                        instructions="The castle is covered in grime! Hold and drag the brush to clean it all up and restore the sparkle."
                        heroAsset={heroChibi}
                        onStart={initGame}
                        onExit={onExit}
                        icon={<Wand2 className="w-6 h-6 text-cyan-400" />}
                    />
                )}

                {screen === 'playing' && (
                    <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col">
                        {/* HUD */}
                        <div className="p-4 flex items-center justify-between bg-black/40 relative z-20">
                            <div className="flex-1 mr-4">
                                <div className="flex justify-between text-white text-xs font-bold mb-1 uppercase tracking-wider">
                                    <span>Cleanliness</span>
                                    <span>{Math.floor(cleanliness)}%</span>
                                </div>
                                <div className="h-4 bg-white/20 rounded-full overflow-hidden border border-white/10">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-cyan-400 to-blue-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                                        animate={{ width: `${cleanliness}%` }}
                                    />
                                </div>
                            </div>
                            <div className="text-yellow-300 font-black text-2xl drop-shadow-md">
                                {score}
                            </div>
                        </div>

                        {/* Game Area patches */}
                        <div className="flex-1 relative overflow-hidden">
                            {/* Castle Background (dirty) */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-40 grayscale-[0.5] blur-[1px]">
                                <div className="text-[12rem]">🏰</div>
                            </div>

                            <AnimatePresence>
                                {dirtPatches.map(patch => (
                                    <motion.div
                                        key={patch.id}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 0.8 }}
                                        exit={{ scale: 1.5, opacity: 0 }}
                                        className="absolute pointer-events-none"
                                        style={{
                                            left: `${patch.x}%`,
                                            top: `${patch.y}%`,
                                            width: patch.size,
                                            height: patch.size,
                                            transform: 'translate(-50%, -50%)',
                                        }}
                                    >
                                        <div className={`w-full h-full rounded-full blur-xl ${patch.type === 'grime' ? 'bg-amber-900/80' :
                                            patch.type === 'food' ? 'bg-green-800/80' : 'bg-lime-600/80'
                                            }`} />
                                        {patch.type === 'food' && <div className="absolute inset-0 flex items-center justify-center text-2xl">🍕</div>}
                                        {patch.type === 'slime' && <div className="absolute inset-0 flex items-center justify-center text-2xl">🤢</div>}
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Custom Brush Cursor */}
                            <motion.div
                                className="absolute pointer-events-none z-50 text-5xl"
                                animate={{
                                    left: `${cursorPos.x}%`,
                                    top: `${cursorPos.y}%`,
                                    rotate: isCleaning ? [0, -20, 20, 0] : 0,
                                    scale: isCleaning ? 1.2 : 1
                                }}
                                transition={{
                                    left: { type: 'spring', stiffness: 500, damping: 30 },
                                    top: { type: 'spring', stiffness: 500, damping: 30 },
                                    rotate: { duration: 0.2, repeat: isCleaning ? Infinity : 0 }
                                }}
                                style={{ x: '-50%', y: '-50%' }}
                            >
                                <div className="relative">
                                    <Brush className="w-16 h-16 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]" />
                                    {isCleaning && (
                                        <motion.div
                                            className="absolute -top-4 -right-4"
                                            animate={{ opacity: [1, 0], scale: [0.5, 1.5] }}
                                            transition={{ repeat: Infinity, duration: 0.3 }}
                                        >
                                            <Sparkles className="w-8 h-8 text-cyan-300" />
                                        </motion.div>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                )}

                {screen === 'victory' && null}
            </AnimatePresence>
        </div>
    );
}
