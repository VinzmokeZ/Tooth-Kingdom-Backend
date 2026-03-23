import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, Anchor } from 'lucide-react';
import { GameProps } from './types';
import { GameStartScreen, GameVictoryScreen } from './common/GameUI';
import { useGameAudio } from './useGameAudio';

// Asset imports — unchanged
import flossHero from '../../assets/CHIBI 3.svg';

// Flappy Bird visual assets
import flappySky from '../../assets/flappy/flappy_bg_sky_1772782448928.png';
import flappyPipe from '../../assets/flappy/flappy_pipe_green_1772782463298.png';
import flappyGround from '../../assets/flappy/flappy_ground_1772782478251.png';


type Screen = 'start' | 'playing' | 'victory';

interface Gap {
  id: number;
  x: number;
  gapY: number;
  gapHeight: number;
  passed: boolean;
}

// Pixelated crack marks rendered inside the pipe shaft
const CRACK_MARKS = [
  { top: '20%', left: '20%', w: 14, h: 3, rot: 30 },
  { top: '20%', left: '42%', w: 8, h: 3, rot: -20 },
  { top: '55%', left: '15%', w: 10, h: 3, rot: 15 },
  { top: '55%', left: '55%', w: 6, h: 3, rot: -35 },
  { top: '75%', left: '30%', w: 12, h: 3, rot: 25 },
];


export function RoyalRopeRescue({ onComplete, onExit }: GameProps) {
  const [screen, setScreen] = useState<Screen>('start');
  const [score, setScore] = useState(0);
  const [flossY, setFlossY] = useState(50);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [lives, setLives] = useState(3);
  const [, setScrollX] = useState(0);
  const [isPerfect, setIsPerfect] = useState(false);

  // Ground scroll offset (for animation only)
  const [groundX, setGroundX] = useState(0);
  const groundRef = useRef<NodeJS.Timeout | null>(null);

  // Chibi radius in % units — kept small for forgiving feel
  const CHIBI_R = 3;

  // Invincibility cooldown after a hit (prevents one pipe double-counting)
  const hitCooldownRef = useRef(false);

  const maxScore = 500;

  const audio = useGameAudio('floss');

  // Start/stop background music with gameplay
  useEffect(() => {
    if (screen === 'playing') audio.startBg();
    else audio.stopBg();
  }, [screen]);

  // Scroll ground strip while playing
  useEffect(() => {
    if (screen !== 'playing') return;
    groundRef.current = setInterval(() => {
      setGroundX(x => (x - 2) % 400);
    }, 30);
    return () => { if (groundRef.current) clearInterval(groundRef.current); };
  }, [screen]);


  // Create gaps (teeth to navigate through) — UNCHANGED LOGIC
  useEffect(() => {
    if (screen !== 'playing') return;

    const gapInterval = setInterval(() => {
      const newGap: Gap = {
        id: Date.now(),
        x: 110,
        gapY: 25 + Math.random() * 50,
        gapHeight: 25,
        passed: false,
      };
      setGaps(prev => [...prev, newGap]);
    }, 2000);

    return () => clearInterval(gapInterval);
  }, [screen]);

  // Move gaps toward player — UNCHANGED LOGIC
  useEffect(() => {
    if (screen !== 'playing') return;

    const moveInterval = setInterval(() => {
      setScrollX(x => x + 1);

      setGaps(prev => {
        return prev.map(gap => {
          const newX = gap.x - 1.5;

          // X hit zone: pipe shaft occupies gap.x% to gap.x+12%; chibi is at ~12-28%
          // Trigger check whenever pipe overlaps chibi horizontally
          if (!gap.passed && newX <= 26 && newX >= -2) {
            // Tight Y: account for chibi radius on both edges
            const flossTop = flossY - CHIBI_R;
            const flossBottom = flossY + CHIBI_R;
            const flossInGap = flossTop >= gap.gapY && flossBottom <= gap.gapY + gap.gapHeight;

            if (flossInGap && newX <= 14) {
              // Successfully passed through
              const center = gap.gapY + gap.gapHeight / 2;
              const distFromCenter = Math.abs(flossY - center);
              const isPerfectPass = distFromCenter < 4;

              setIsPerfect(isPerfectPass);
              setTimeout(() => setIsPerfect(false), 500);

              if (isPerfectPass) audio.sfxPerfect(); else audio.sfxSuccess();
              setScore(s => s + (isPerfectPass ? 30 : 20));
              return { ...gap, x: newX, passed: true };
            } else if (!flossInGap && newX <= 18 && newX >= 6 && !hitCooldownRef.current) {
              // Chibi hit a pipe — forgiving narrow x window + cooldown guard
              hitCooldownRef.current = true;
              setTimeout(() => { hitCooldownRef.current = false; }, 900);
              audio.sfxHit();
              setLives(l => l - 1);
              return { ...gap, x: newX, passed: true };
            }
          }

          return { ...gap, x: newX };
        }).filter(gap => gap.x > -10);
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [screen, flossY]);

  // Game ends only when all 3 lives are lost
  useEffect(() => {
    if (lives <= 0 && screen === 'playing') {
      setScreen('victory');
    }
  }, [lives, screen]);

  const moveFloss = useCallback((direction: 'up' | 'down') => {
    if (screen !== 'playing') return;
    audio.sfxTap();
    setFlossY(y => {
      if (direction === 'up') return Math.max(10, y - 8);
      return Math.min(90, y + 8);
    });
  }, [screen]);

  // Fixed star logic — UNCHANGED
  const stars = score > 0 ? (score >= 400 ? 3 : score >= 250 ? 2 : 1) : 0;

  // Handle game completion — UNCHANGED
  useEffect(() => {
    if (screen === 'victory') {
      audio.sfxVictory();
      onComplete(score, stars);
    }
  }, [screen, score, stars, onComplete]);

  return (
    <div className="absolute inset-0 w-full h-full flex flex-col overflow-hidden">

      {/* ── FLAPPY BIRD BACKGROUND ── */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${flappySky})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />



      {/* Scrolling ground strip at the bottom */}
      <div
        className="absolute bottom-0 left-0 z-10 pointer-events-none"
        style={{ width: '100%', height: 52, overflow: 'hidden' }}
      >
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '200%',
            transform: `translateX(${groundX}px)`,
          }}
        >
          <img src={flappyGround} alt="" aria-hidden style={{ flex: 1, height: '100%', objectFit: 'cover' }} />
          <img src={flappyGround} alt="" aria-hidden style={{ flex: 1, height: '100%', objectFit: 'cover' }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {screen === 'start' && (
          <GameStartScreen
            key="start"
            title="Royal Rope"
            subtitle="Rescue!"
            instructions="Guide the floss through the gaps between teeth! Hit the center for bonus points!"
            heroAsset={flossHero}
            onStart={() => setScreen('playing')}
            onExit={onExit}
            icon={<Anchor className="w-6 h-6 text-blue-400" />}
          />
        )}

        {screen === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col"
          >
            {/* HUD — solid white pill */}
            <div
              className="relative z-20 flex items-center justify-between px-4 py-2"
              style={{
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(8px)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
              }}
            >
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <span key={i} className="text-xl">
                    {i < lives ? '❤️' : '🖤'}
                  </span>
                ))}
              </div>

              <div style={{ color: '#1e293b', fontWeight: 800, fontSize: 16 }}>
                {score} / {maxScore}
              </div>

              {isPerfect && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    background: '#fbbf24',
                    color: '#78350f',
                    padding: '2px 10px',
                    borderRadius: 999,
                    fontWeight: 900,
                    fontSize: 12,
                    letterSpacing: '0.08em',
                  }}
                >
                  PERFECT!
                </motion.span>
              )}
            </div>

            {/* Game area — canvas */}
            <div
              className="flex-1 relative overflow-hidden pointer-events-none"
              style={{ marginBottom: 52 /* leave room for ground */ }}
            >
              {/* Chibi hero — UNCHANGED position logic */}
              <motion.div
                className="absolute left-[12%] w-16 h-16 flex items-center justify-center z-10"
                animate={{ top: `${flossY}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{ transform: 'translateY(-50%)' }}
              >
                <motion.img
                  src={flossHero}
                  alt="Floss Hero"
                  className="w-full h-full object-contain filter drop-shadow-lg"
                  animate={{ y: [0, -4, 0], rotate: [-2, 2, -2] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                />
              </motion.div>


              {gaps.map(gap => (
                <div key={gap.id}>

                  {/* TOP TOOTH — hanging from ceiling, root tips pointing down */}
                  <div
                    className="absolute z-10"
                    style={{
                      left: `${gap.x}%`,
                      top: 0,
                      height: `${gap.gapY}%`,
                      width: 52,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-end',
                      alignItems: 'center',
                    }}
                  >
                    {/* Shaft (enamel body) */}
                    <div style={{
                      flex: 1, width: 38, position: 'relative',
                      background: 'linear-gradient(to right, #f5f0e0 0%, #fffdf6 40%, #e8e0cc 100%)',
                      outline: '3px solid #111',
                      imageRendering: 'pixelated',
                    }}>
                      {CRACK_MARKS.map((c, i) => (
                        <div key={i} style={{
                          position: 'absolute', top: c.top, left: c.left,
                          width: c.w, height: c.h,
                          background: '#b8a88a',
                          transform: `rotate(${c.rot}deg)`,
                          imageRendering: 'pixelated',
                        }} />
                      ))}
                    </div>
                    {/* Crown base */}
                    <div style={{
                      width: 52, height: 16, flexShrink: 0,
                      background: 'linear-gradient(to right, #f5f0e0, #fffdf6, #e8e0cc)',
                      outline: '3px solid #111',
                      boxShadow: '0 4px 0 #111',
                      imageRendering: 'pixelated',
                    }} />
                    {/* Root tips pointing down */}
                    <div style={{ display: 'flex', gap: 5, marginTop: -3, flexShrink: 0 }}>
                      {[0, 1, 2].map(r => (
                        <div key={r} style={{
                          width: 13, height: 13,
                          borderRadius: '0 0 50% 50%',
                          background: '#f5f0e0',
                          border: '3px solid #111',
                          imageRendering: 'pixelated',
                        }} />
                      ))}
                    </div>
                  </div>

                  {/* BOTTOM TOOTH — crown pointing up with cusps */}
                  <div
                    className="absolute z-10"
                    style={{
                      left: `${gap.x}%`,
                      top: `${gap.gapY + gap.gapHeight}%`,
                      height: `${100 - gap.gapY - gap.gapHeight}%`,
                      width: 52,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                    }}
                  >
                    {/* Cusp bumps — 3 rounded bumps = tooth crown */}
                    <div style={{ display: 'flex', gap: 3, marginBottom: -3, flexShrink: 0 }}>
                      {[14, 16, 14].map((h, r) => (
                        <div key={r} style={{
                          width: 14, height: h,
                          borderRadius: '50% 50% 0 0',
                          background: 'linear-gradient(to bottom, #fffdf6, #e8e0cc)',
                          border: '3px solid #111',
                          imageRendering: 'pixelated',
                        }} />
                      ))}
                    </div>
                    {/* Crown shoulder */}
                    <div style={{
                      width: 52, height: 16, flexShrink: 0,
                      background: 'linear-gradient(to right, #f5f0e0, #fffdf6, #e8e0cc)',
                      outline: '3px solid #111',
                      boxShadow: '0 -4px 0 #111',
                      imageRendering: 'pixelated',
                    }} />
                    {/* Shaft (enamel body) */}
                    <div style={{
                      flex: 1, width: 38, position: 'relative',
                      background: 'linear-gradient(to right, #f5f0e0 0%, #fffdf6 40%, #e8e0cc 100%)',
                      outline: '3px solid #111',
                      imageRendering: 'pixelated',
                    }}>
                      {CRACK_MARKS.map((c, i) => (
                        <div key={i} style={{
                          position: 'absolute', top: c.top, left: c.left,
                          width: c.w, height: c.h,
                          background: '#b8a88a',
                          transform: `rotate(${c.rot}deg)`,
                          imageRendering: 'pixelated',
                        }} />
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Controls — UNCHANGED logic, updated pill style */}
            <div
              className="relative z-20 flex items-center justify-center gap-6 py-3"
              style={{
                background: 'rgba(10,16,30,0.82)',
                backdropFilter: 'blur(10px)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <motion.button
                whileTap={{ scale: 0.9 }}
                onTouchStart={() => moveFloss('up')}
                onClick={() => moveFloss('up')}
                style={{
                  width: 72, height: 72,
                  background: 'linear-gradient(to bottom, #60a5fa, #2563eb)',
                  borderRadius: 18,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.5)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <ChevronUp style={{ width: 36, height: 36, color: '#fff' }} />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onTouchStart={() => moveFloss('down')}
                onClick={() => moveFloss('down')}
                style={{
                  width: 72, height: 72,
                  background: 'linear-gradient(to bottom, #60a5fa, #2563eb)',
                  borderRadius: 18,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(37,99,235,0.5)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <ChevronDown style={{ width: 36, height: 36, color: '#fff' }} />
              </motion.button>
            </div>
          </motion.div>
        )}

        {screen === 'victory' && null}
      </AnimatePresence>
    </div>
  );
}
