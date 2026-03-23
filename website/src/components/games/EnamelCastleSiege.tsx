import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Swords } from 'lucide-react';
import { GameProps } from './types';
import { GameStartScreen, GameVictoryScreen } from './common/GameUI';

// Asset imports
import toothKingdomBg from '../../assets/tooth_kingdom_bg.png';
import heroChibi from '../../assets/CHIBI 1.svg';
import warrior01 from '../../assets/Dynasty_Kingdoms_Pack_2_Lianzhou/LianZhou_Warrior_01.png';
import warrior02 from '../../assets/Dynasty_Kingdoms_Pack_2_Lianzhou/LianZhou_Warrior_06.png';
import warrior03 from '../../assets/Dynasty_Kingdoms_Pack_2_Lianzhou/LianZhou_Warrior_12.png';

type Screen = 'start' | 'playing' | 'victory';

interface Monster {
  id: number;
  x: number;
  y: number;
  health: number;
  type: 'plaque' | 'candy' | 'bacteria';
}

export function EnamelCastleSiege({ onComplete, onExit }: GameProps) {
  const [screen, setScreen] = useState<Screen>('start');
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [heroY, setHeroY] = useState(50);
  const [monsters, setMonsters] = useState<Monster[]>([]);
  const [isAttacking, setIsAttacking] = useState(false);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);

  const maxScore = 500;

  // Spawn monsters
  useEffect(() => {
    if (screen !== 'playing') return;

    const spawnInterval = setInterval(() => {
      const newMonster: Monster = {
        id: Date.now(),
        x: 100,
        y: Math.random() * 60 + 20,
        health: 1,
        type: ['plaque', 'candy', 'bacteria'][Math.floor(Math.random() * 3)] as Monster['type'],
      };
      setMonsters(prev => [...prev, newMonster]);
    }, 1200);

    return () => clearInterval(spawnInterval);
  }, [screen]);

  // Move monsters
  useEffect(() => {
    if (screen !== 'playing') return;

    const moveInterval = setInterval(() => {
      setMonsters(prev => {
        const updated = prev.map(m => ({ ...m, x: m.x - 2 }));

        // Check for monsters reaching castle
        const reached = updated.filter(m => m.x <= 15);
        if (reached.length > 0) {
          setHealth(h => Math.max(0, h - reached.length * 10));
          setCombo(0);
        }

        return updated.filter(m => m.x > 10);
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

  // Check game over
  useEffect(() => {
    if (health <= 0 && screen === 'playing') {
      setScreen('victory');
    }
  }, [health, screen]);

  // Handle attack
  const handleAttack = useCallback(() => {
    if (screen !== 'playing' || isAttacking) return;

    setIsAttacking(true);
    setTimeout(() => setIsAttacking(false), 200);

    // Find monsters in attack range
    setMonsters(prev => {
      const inRange = prev.filter(m => m.x >= 20 && m.x <= 45 && Math.abs(m.y - heroY) < 25);

      if (inRange.length > 0) {
        const points = inRange.length * 10 * (1 + combo * 0.1);
        setScore(s => Math.min(maxScore, s + Math.floor(points)));
        setCombo(c => c + 1);
        return prev.filter(m => !inRange.includes(m));
      } else {
        setCombo(0);
        return prev;
      }
    });
  }, [screen, isAttacking, heroY, combo]);

  // Handle movement
  const moveHero = (direction: 'up' | 'down') => {
    if (screen !== 'playing') return;
    setHeroY(y => {
      if (direction === 'up') return Math.max(15, y - 12);
      return Math.min(85, y + 12);
    });
  };

  // Fixed star logic: 0 stars for 0 points
  const stars = score > 0 ? (score >= 400 ? 3 : score >= 250 ? 2 : 1) : 0;

  // Handle game completion
  useEffect(() => {
    if (screen === 'victory') {
      onComplete(score, stars);
    }
  }, [screen, score, stars, onComplete]);

  // Monster image based on type
  const getMonsterAsset = (type: Monster['type']) => {
    switch (type) {
      case 'plaque': return warrior01;
      case 'candy': return warrior02;
      case 'bacteria': return warrior03;
    }
  };

  return (
    <div
      className="absolute inset-0 w-full h-full flex flex-col overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${toothKingdomBg})` }}
    >
      <div className="absolute inset-0 bg-indigo-900/40 pointer-events-none z-0" />

      <AnimatePresence mode="wait">
        {screen === 'start' && (
          <GameStartScreen
            key="start"
            title="Enamel Castle Siege"
            subtitle="Defend the Gates!"
            instructions="Protect the Enamel Castle from invading sugar bugs! Click them to defeat them before they reach the gates."
            heroAsset={heroChibi}
            onStart={() => setScreen('playing')}
            onExit={onExit}
            icon={<Swords className="w-6 h-6 text-emerald-400" />}
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
            {/* HUD */}
            <div className="p-3 flex items-center justify-between bg-black/30">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-400" />
                <div className="w-20 h-3 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-red-500 to-red-400"
                    animate={{ width: `${health}%` }}
                  />
                </div>
              </div>

              <div className="text-yellow-300 font-bold text-lg">
                {score}
              </div>

              <div className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-bold">
                {timeLeft}s
              </div>
            </div>

            {/* Combo indicator */}
            {combo > 1 && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute top-16 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold"
              >
                {combo}x Combo! 🔥
              </motion.div>
            )}

            {/* Game area */}
            <motion.div
              className="flex-1 relative overflow-hidden pointer-events-auto"
              animate={isAttacking ? { x: [-2, 2, -2, 0] } : {}}
              transition={{ duration: 0.1 }}
            >
              {/* Background castle */}
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-4xl opacity-80">
                🏰
              </div>

              {/* Hero */}
              <motion.div
                className="absolute left-8 w-20 h-20"
                animate={{
                  top: `${heroY}%`,
                  scale: isAttacking ? 1.2 : 1,
                  x: isAttacking ? 20 : 0,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{ translateY: '-50%' }}
              >
                <motion.img
                  src={heroChibi}
                  alt="Hero"
                  className="w-full h-full object-contain filter drop-shadow-lg"
                  animate={{
                    y: [0, -5, 0],
                    rotate: isAttacking ? [0, -10, 10, 0] : 0
                  }}
                  transition={{
                    y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                    rotate: { duration: 0.2 }
                  }}
                />

                <AnimatePresence>
                  {isAttacking && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5, x: 20, rotate: -45 }}
                      animate={{ opacity: 1, scale: 1.2, x: 40, rotate: 45 }}
                      exit={{ opacity: 0, scale: 1.5, x: 60 }}
                      className="absolute left-full top-1/2 -translate-y-1/2 pointer-events-none"
                    >
                      <div className="w-24 h-24 border-r-8 border-t-8 border-white/80 rounded-full blur-[2px] shadow-[0_0_20px_rgba(255,255,255,0.8)]"
                        style={{ transform: 'rotate(225deg)' }} />
                      <div className="absolute inset-0 text-4xl">⚔️</div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Monsters */}
              <AnimatePresence>
                {monsters.map(monster => (
                  <motion.div
                    key={monster.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0, rotate: 180 }}
                    className="absolute w-12 h-12"
                    style={{
                      left: `${monster.x}%`,
                      top: `${monster.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    <img
                      src={getMonsterAsset(monster.type)}
                      alt="Enemy"
                      className="w-full h-full object-contain"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {/* Controls */}
            <div className="p-4 bg-black/50 flex items-center justify-between pointer-events-auto relative z-20">
              <div className="flex flex-col gap-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onTouchStart={() => moveHero('up')}
                  onClick={() => moveHero('up')}
                  className="w-14 h-14 bg-blue-500 rounded-xl text-white text-2xl shadow-lg active:bg-blue-600"
                >
                  ⬆️
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onTouchStart={() => moveHero('down')}
                  onClick={() => moveHero('down')}
                  className="w-14 h-14 bg-blue-500 rounded-xl text-white text-2xl shadow-lg active:bg-blue-600"
                >
                  ⬇️
                </motion.button>
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onTouchStart={handleAttack}
                onClick={handleAttack}
                className={`w-24 h-24 rounded-full text-4xl shadow-xl flex items-center justify-center ${isAttacking
                  ? 'bg-red-600'
                  : 'bg-gradient-to-br from-red-500 to-orange-500'
                  }`}
              >
                ⚔️
              </motion.button>
            </div>
          </motion.div>
        )}

        {screen === 'victory' && null}
      </AnimatePresence>
    </div>
  );
}
