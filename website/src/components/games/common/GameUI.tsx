import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Swords, Trophy, Sparkles, ChevronLeft, CheckCircle } from 'lucide-react';
import { StarRating } from '../StarRating';

interface GameStartScreenProps {
    title: string;
    subtitle: string;
    instructions: string;
    heroAsset: string;
    onStart: () => void;
    onExit?: () => void;
    icon?: React.ReactNode;
}

export function PremiumChromaText({ children, className = "" }: { children: React.ReactNode, className?: string }) {
    return (
        <span className={`inline-block font-black animate-premiumChroma ${className}`}>
            {children}
        </span>
    );
}

export function GameStartScreen({
    title,
    subtitle,
    instructions,
    heroAsset,
    onStart,
    onExit,
    icon = <Swords className="w-5 h-5" />
}: GameStartScreenProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 relative z-10"
        >
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes premiumChroma {
                    0% { color: #A78BFA; text-shadow: 0 0 20px rgba(167, 139, 250, 0.6); }
                    20% { color: #22D3EE; text-shadow: 0 0 20px rgba(34, 211, 238, 0.6); }
                    40% { color: #FFFFFF; text-shadow: 0 0 25px rgba(255, 255, 255, 0.8); }
                    60% { color: #FBBF24; text-shadow: 0 0 20px rgba(251, 191, 36, 0.6); }
                    80% { color: #F472B6; text-shadow: 0 0 20px rgba(244, 114, 182, 0.6); }
                    100% { color: #A78BFA; text-shadow: 0 0 20px rgba(167, 139, 250, 0.6); }
                }
                .animate-premiumChroma {
                    animation: premiumChroma 6s linear infinite;
                }
            ` }} />
            {/* Cinematic Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent pointer-events-none" />

            {/* Floating Particles */}
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute text-xl pointer-events-none opacity-20"
                    animate={{
                        y: [-20, 20, -20],
                        x: [-10, 10, -10],
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{ duration: 4 + i % 2, repeat: Infinity, delay: i * 0.2 }}
                    style={{ left: `${(i * 15) % 100}%`, top: `${(i * 25) % 100}%` }}
                >
                    {i % 2 === 0 ? '✨' : '⭐'}
                </motion.div>
            ))}

            {/* Title Section with Layered Typography */}
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="text-center mb-8 relative"
            >
                <div className="absolute -inset-4 bg-white/5 blur-2xl rounded-full -z-10" />
                <h1 className="text-4xl font-black mb-1 tracking-tight relative">
                    <PremiumChromaText>{title}</PremiumChromaText>
                </h1>
                <h2 className="text-2xl font-black relative">
                    <PremiumChromaText className="!animation-duration-[4s]">{subtitle}</PremiumChromaText>
                </h2>
            </motion.div>

            {/* Hero Cinematic Entry */}
            <motion.div
                initial={{ scale: 0, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
                className="relative mb-10 group"
            >
                <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full group-hover:bg-white/40 transition-colors duration-700" />
                <motion.img
                    src={heroAsset}
                    alt="Hero"
                    className="w-40 h-40 object-contain relative z-10 filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                    animate={{ y: [0, -12, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
            </motion.div>

            {/* Instruction Card - Solid White */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                style={{
                    background: '#fff',
                    borderRadius: 24,
                    padding: '16px 20px',
                    marginBottom: 28,
                    maxWidth: 320,
                    width: '100%',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    position: 'relative',
                }}
            >
                <div style={{
                    width: 38,
                    height: 38,
                    borderRadius: 12,
                    background: 'rgba(99,102,241,0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    {icon}
                </div>
                <p style={{
                    color: '#1e293b',
                    fontWeight: 700,
                    fontSize: 13,
                    lineHeight: 1.5,
                    margin: 0,
                }}>
                    {instructions}
                </p>
            </motion.div>

            {/* Action Buttons — matching Chapter 1 & 2 pill style */}
            <div className="flex flex-col items-center gap-4 relative z-10">
                {/* START — green pill like "Claim" */}
                <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={onStart}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 28px',
                        background: 'rgba(22,163,74,0.88)',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255,255,255,0.20)',
                        borderRadius: 999,
                        color: '#fff',
                        fontWeight: 900,
                        fontSize: 14,
                        letterSpacing: '0.09em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        minHeight: 48,
                        boxShadow: '0 4px 16px rgba(0,0,0,0.55)',
                        WebkitTapHighlightColor: 'transparent',
                    }}
                >
                    <Play style={{ width: 18, height: 18, flexShrink: 0 }} fill="currentColor" />
                    Start Adventure
                </motion.button>

                {/* BACK — dark pill like "Map" */}
                {onExit && (
                    <motion.button
                        whileTap={{ scale: 0.93 }}
                        onClick={onExit}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '10px 20px',
                            background: 'rgba(10,16,30,0.82)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.18)',
                            borderRadius: 999,
                            color: '#fff',
                            fontWeight: 800,
                            fontSize: 12,
                            letterSpacing: '0.09em',
                            textTransform: 'uppercase',
                            cursor: 'pointer',
                            minHeight: 40,
                            opacity: 0.85,
                            boxShadow: '0 2px 10px rgba(0,0,0,0.55)',
                            WebkitTapHighlightColor: 'transparent',
                        }}
                    >
                        <ChevronLeft style={{ width: 16, height: 16, flexShrink: 0 }} />
                        Back to Map
                    </motion.button>
                )}
            </div>
        </motion.div>
    );
}

interface GameVictoryScreenProps {
    score: number;
    stars: number;
    onContinue: () => void;
    isVictory?: boolean;
}

export function GameVictoryScreen({ score, stars, onContinue, isVictory = true }: GameVictoryScreenProps) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col items-center justify-center p-6 relative z-10"
        >
            {/* Victory Rays */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20 overflow-hidden pointer-events-none">
                <motion.div
                    className="w-[800px] h-[800px] bg-[conic-gradient(from_0deg,transparent_0deg,white_20deg,transparent_40deg)] rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
            </div>

            {/* Confetti / Sparkles */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute text-2xl pointer-events-none"
                    initial={{ y: -100, opacity: 0 }}
                    animate={{
                        y: [0, 600],
                        x: [0, (i % 2 === 0 ? 1 : -1) * (30 + i * 10)],
                        opacity: [0, 1, 0],
                        rotate: 360,
                    }}
                    transition={{ duration: 2.5, delay: i * 0.1, repeat: Infinity }}
                    style={{ left: `${(i * 7) % 100}%` }}
                >
                    {['🏆', '✨', '🌟', '💎', '🎉'][i % 5]}
                </motion.div>
            ))}

            {/* Main Symbol */}
            <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', bounce: 0.6, duration: 0.8 }}
                className="relative mb-6"
            >
                <div className="absolute inset-0 bg-yellow-400 blur-3xl opacity-30 rounded-full" />
                <div className="text-8xl relative z-10 filter drop-shadow-2xl">
                    {isVictory ? (stars === 3 ? '👑' : '🏆') : '💪'}
                </div>
            </motion.div>

            {/* Results Header */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-center mb-8"
            >
                <h2 className="text-4xl font-black text-white mb-2 tracking-tight drop-shadow-lg uppercase">
                    {isVictory ? (stars === 3 ? 'LEGENDARY!' : 'Victory!') : 'Great Effort!'}
                </h2>
                <div className="flex items-center justify-center gap-3">
                    <div className="h-[2px] w-8 bg-gradient-to-r from-transparent to-white/40" />
                    <p className="text-yellow-300 text-4xl font-black tabular-nums tracking-tighter drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                        {score.toLocaleString()} <span className="text-sm uppercase tracking-widest text-white/60 ml-1">pts</span>
                    </p>
                    <div className="h-[2px] w-8 bg-gradient-to-l from-transparent to-white/40" />
                </div>
            </motion.div>

            {/* Centralized Star Rating */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mb-12"
            >
                <StarRating stars={stars} size="lg" />
            </motion.div>

            {/* Final Action */}
            <motion.button
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 1, type: "spring" }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(52, 211, 153, 0.4)" }}
                whileTap={{ scale: 0.95 }}
                onClick={onContinue}
                className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-400 bg-[length:200%_auto] hover:bg-right transition-all duration-500 text-white font-black py-5 px-16 rounded-full shadow-2xl flex items-center gap-3 text-xl group"
            >
                <span>Collect Rewards</span>
                <Sparkles className="w-6 h-6 animate-pulse" />
            </motion.button>
        </motion.div>
    );
}
