import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { characters, Character } from '../../data/characters';

interface ChibiGuideProps {
    userName: string;
    onComplete: () => void;
}

// Lore-based dialogues for each Chibi
const CHIBI_DIALOGUES = [
    (name: string) => [
        `Greetings, ${name}! I am Luna, Vanguard of Radiance.`,
        `The Kingdom's brightness depends on your toothbrush!`,
        `Ready for another day of brilliant smiles? Let's go!`
    ],
    (name: string) => [
        `Scanning biometrics... Welcome back, ${name}. I'm Max.`,
        `I've analyzed your patterns. Optimal efficiency detected!`,
        `Let's deploy defenses against the Sugar Swarm.`
    ],
    (name: string) => [
        `Magic and mint! Hello, ${name}! I'm Mia!`,
        `I can see your enamel is absolutely glowing today.`,
        `Let's keep those gum monsters away with magic spells!`
    ],
    (name: string) => [
        `Swift and silent... Ah, ${name}. I am Zara.`,
        `I've already scouted the path ahead for us.`,
        `Let's neutralize those sugar pockets before they blink.`
    ],
    (name: string) => [
        `Stand firm, ${name}. I am Kai, the Stalwart Sentry.`,
        `The Acid Invasion is relentless, but so are we.`,
        `I'll guard you while you strengthen our foundations!`
    ]
];

export function ChibiGuide({ userName, onComplete }: ChibiGuideProps) {
    const [chibiSequenceIndex, setChibiSequenceIndex] = useState(0);
    const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const audioContextRef = useRef<AudioContext | null>(null);

    // Safeguard to prevent out-of-bounds error if sequence index exceeds array bounds
    const safeSequenceIndex = Math.min(chibiSequenceIndex, characters.length - 1);
    const activeChibi = characters[safeSequenceIndex];
    const dialogues = CHIBI_DIALOGUES[safeSequenceIndex] ? CHIBI_DIALOGUES[safeSequenceIndex](userName || 'Hero') : ['...'];

    const initAudio = () => {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (audioContextRef.current.state === 'suspended') {
            audioContextRef.current.resume();
        }
    };

    const playBlip = () => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.type = 'square';
        const baseFreq = 400 + (Math.random() * 200 - 100);
        oscillator.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.05);
    };

    useEffect(() => {
        if (isTransitioning) return;
        const fullText = dialogues[currentDialogueIndex];
        let charIndex = 0;
        setDisplayedText('');
        setIsTyping(true);
        const typingInterval = setInterval(() => {
            if (charIndex < fullText.length) {
                setDisplayedText(fullText.substring(0, charIndex + 1));
                if (charIndex % 2 === 0 && fullText[charIndex] !== ' ') playBlip();
                charIndex++;
            } else {
                setIsTyping(false);
                clearInterval(typingInterval);
            }
        }, 10);
        return () => clearInterval(typingInterval);
    }, [currentDialogueIndex, chibiSequenceIndex, isTransitioning]);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isTransitioning) return; // Prevent double clicks queuing multiple state updates

        initAudio();
        if (isTyping) {
            setDisplayedText(dialogues[currentDialogueIndex]);
            setIsTyping(false);
            return;
        }
        if (currentDialogueIndex < dialogues.length - 1) {
            setCurrentDialogueIndex(prev => prev + 1);
        } else {
            if (chibiSequenceIndex < characters.length - 1) {
                setIsTransitioning(true);
                setTimeout(() => {
                    setChibiSequenceIndex(prev => prev + 1);
                    setCurrentDialogueIndex(0);
                    setIsTransitioning(false);
                }, 200);
            } else {
                onComplete();
            }
        }
    };

    if (!activeChibi) return null;

    return (
        <div className="absolute inset-0 pointer-events-auto flex flex-col justify-end" style={{ zIndex: 999999 }}>
            <AnimatePresence>
                {/* Backdrop Layer */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
                    onClick={handleNext}
                />

                {/* Content Layer - Strict Absolute Positioning through Inline Styles logic */}
                <div className="absolute inset-0 pointer-events-none w-full h-full overflow-hidden">

                    {/* Character - Miniature, Absolute Top-Left EXACTLY Over Avatar Square using Inline Styles */}
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={activeChibi.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                            className="absolute pointer-events-none z-20 flex items-center justify-center bg-transparent"
                            style={{
                                top: '235px',
                                left: '15px',
                                width: '90px',
                                height: '90px'
                            }}
                        >
                            <motion.img
                                src={activeChibi.image}
                                alt={activeChibi.name}
                                animate={{ y: [0, -4, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                                className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
                                style={{ transform: 'scale(1.3) translateY(4px)' }}
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Speech Bubble - Minimalist Position NEXT TO Avatar Square using Inline Styles */}
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={`${activeChibi.id}-${currentDialogueIndex}`}
                            initial={{ scale: 0.8, opacity: 0, x: -20 }}
                            animate={{ scale: 1, opacity: 1, x: 0 }}
                            exit={{ scale: 0.8, opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                            className="absolute flex flex-col justify-start pointer-events-auto z-30"
                            style={{
                                top: '225px',
                                left: '115px'
                            }}
                        >
                            <div
                                className="rounded-xl p-3.5 shadow-2xl relative cursor-pointer flex items-center pr-8"
                                onClick={handleNext}
                                style={{
                                    backgroundColor: '#ffffff',
                                    border: '2px solid #D6C19F',
                                    width: 'auto',
                                    maxWidth: '280px',
                                    minHeight: '75px',
                                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                                }}
                            >
                                {/* Close Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onComplete();
                                    }}
                                    className="absolute top-1 right-1 p-1 hover:bg-stone-100 rounded-lg transition-colors group"
                                >
                                    <CloseIcon />
                                </button>
                                <p className="font-extrabold text-[12px] leading-snug break-words" style={{ color: '#292524' }}>
                                    {displayedText}
                                    {isTyping && <span className="inline-block w-2 h-3 ml-1 bg-stone-800 animate-pulse align-middle" />}
                                </p>

                                {/* Tail pointing left towards the Chibi */}
                                <div
                                    className="absolute"
                                    style={{
                                        left: '-7px',
                                        top: '18px',
                                        width: '12px',
                                        height: '12px',
                                        backgroundColor: '#ffffff',
                                        borderLeft: '2px solid #D6C19F',
                                        borderBottom: '2px solid #D6C19F',
                                        transform: 'rotate(45deg)'
                                    }}
                                />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </AnimatePresence>
        </div>
    );
}

function CloseIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 3L3 9M3 3L9 9" stroke="#A8A29E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}
