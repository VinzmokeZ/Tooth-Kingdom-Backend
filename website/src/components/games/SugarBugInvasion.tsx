import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Bug } from 'lucide-react';
import { GameProps } from './types';
import { GameStartScreen, GameVictoryScreen } from './common/GameUI';

// Asset imports
import toothKingdomBg from '../../assets/tooth_kingdom_bg.png';
import sugarBugChibi from '../../assets/CHIBI 4.svg';
import plagueMonster from '../../assets/plaque_monster.png';
import sugarMonsters from '../../assets/sugar_monsters.png';

type Screen = 'start' | 'playing' | 'victory';

interface Bug {
  id: number;
  x: number;
  y: number;
  type: 'sugar' | 'plaque';
  speed: number;
}

export function SugarBugInvasion({ onComplete, onExit }: GameProps) {
  const [screen, setScreen] = useState<Screen>('start');
  const [score, setScore] = useState(0);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [multiplier, setMultiplier] = useState(1);
  const [lastTapTime, setLastTapTime] = useState(0);

  const maxScore = 600;

  // Spawn bugs
  useEffect(() => {
    if (screen !== 'playing') return;

    const spawnInterval = setInterval(() => {
      const type = Math.random() > 0.3 ? 'sugar' : 'plaque';
      const newBug: Bug = {
        id: Date.now(),
        x: 10 + Math.random() * 80,
        y: -10,
        type,
        speed: 2 + Math.random() * 3,
      };
      setBugs(prev => [...prev, newBug]);
    }, 800);

    return () => clearInterval(spawnInterval);
  }, [screen]);

  // Move bugs
  useEffect(() => {
    if (screen !== 'playing') return;

    const moveInterval = setInterval(() => {
      setBugs(prev => {
        const updated = prev.map(bug => ({ ...bug, y: bug.y + bug.speed }));
        // Remove bugs that passed the bottom
        return updated.filter(bug => bug.y < 110);
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [screen]);

  // Timer
  useEffect(() => {
    if (screen !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setScreen('victory');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screen]);

  const handleTapBug = (bugId: number, type: Bug['type']) => {
    const now = Date.now();
    const timeDiff = now - lastTapTime;

    // Multiplier logic
    if (timeDiff < 500) {
      setMultiplier(m => Math.min(m + 0.5, 5));
    } else {
      setMultiplier(1);
    }
    setLastTapTime(now);

    const basePoints = type === 'sugar' ? 10 : 20;
    const totalPoints = Math.floor(basePoints * multiplier);

    setScore(s => Math.min(maxScore, s + totalPoints));
    setBugs(prev => prev.filter(b => b.id !== bugId));
  };

  // Fixed star logic: 0 stars for 0 points
  const stars = score > 0 ? (score >= 480 ? 3 : score >= 300 ? 2 : 1) : 0;

  // Handle game completion
  useEffect(() => {
    if (screen === 'victory') {
      onComplete(score, stars);
    }
  }, [screen, score, stars, onComplete]);

  return (
    <div
      className="absolute inset-0 w-full h-full flex flex-col overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${toothKingdomBg})` }}
    >
      <div className="absolute inset-0 bg-purple-900/40 pointer-events-none z-0" />

      <AnimatePresence mode="wait">
        {screen === 'start' && (
          <GameStartScreen
            key="start"
            title="Sugar Bug"
            subtitle="Invasion!"
            instructions="Tons of sugar bugs are falling! Tap them quickly to defend the kingdom. Fast taps earn big multipliers!"
            heroAsset={sugarBugChibi}
            onStart={() => setScreen('playing')}
            onExit={onExit}
            icon={<Bug className="w-6 h-6 text-purple-400" />}
          />
        )}

        {screen === 'playing' && (
          <motion.div
            key="playing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col pointer-events-none"
          >
            {/* HUD */}
            <div className="p-3 flex items-center justify-between bg-black/30 relative z-20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center text-white">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[10px] text-white/60 uppercase font-black leading-none mb-1">Invasion Level</div>
                  <div className="text-white font-black leading-none">CRITICAL</div>
                </div>
              </div>

              <div className="text-center">
                <div className="text-yellow-300 font-black text-2xl drop-shadow-md leading-none mb-1">
                  {score}
                </div>
                {multiplier > 1 && (
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-orange-400 text-xs font-black uppercase tracking-tighter"
                  >
                    {multiplier}x Combo!
                  </motion.div>
                )}
              </div>

              <div className="bg-white/10 px-4 py-2 rounded-2xl border border-white/20 backdrop-blur-md">
                <div className="flex items-center gap-2 text-white">
                  <Zap className={`w-4 h-4 ${timeLeft <= 5 ? 'text-red-400 animate-pulse' : 'text-yellow-400'}`} />
                  <span className="font-black tabular-nums">{timeLeft}s</span>
                </div>
              </div>
            </div>

            {/* Game area */}
            <div className="flex-1 relative overflow-hidden pointer-events-auto">
              <AnimatePresence>
                {bugs.map(bug => (
                  <motion.div
                    key={bug.id}
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 1.5, opacity: 0, rotate: 45 }}
                    className="absolute cursor-pointer"
                    style={{
                      left: `${bug.x}%`,
                      top: `${bug.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onPointerDown={() => handleTapBug(bug.id, bug.type)}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.1, 1],
                        rotate: [-5, 5, -5]
                      }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="relative w-16 h-16 group"
                    >
                      <div className={`absolute inset-0 blur-xl opacity-40 rounded-full transition-colors ${bug.type === 'sugar' ? 'bg-orange-400' : 'bg-red-500'
                        }`} />
                      <img
                        src={bug.type === 'sugar' ? sugarMonsters : plagueMonster}
                        alt="Bug"
                        className="w-full h-full object-contain filter drop-shadow-lg group-active:scale-90 transition-transform"
                      />
                    </motion.div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Defender at bottom */}
              <motion.div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 w-24 h-24 opacity-50 grayscale pointer-events-none"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <img src={sugarBugChibi} alt="Hero" className="w-full h-full object-contain" />
              </motion.div>
            </div>
          </motion.div>
        )}

        {screen === 'victory' && null}
      </AnimatePresence>
    </div>
  );
}
