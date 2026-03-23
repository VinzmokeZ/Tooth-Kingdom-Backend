import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Utensils } from 'lucide-react';
import { GameProps } from './types';
import { useGameAudio } from './useGameAudio';
import { GameStartScreen, GameVictoryScreen } from './common/GameUI';

// Asset imports
import toothKingdomBg from '../../assets/tooth_kingdom_bg.png';
import kingHeroChibi from '../../assets/CHIBI 4.svg';

// Generated asset imports
import foodApple from '../../assets/food/food_apple_1772515463265.png';
import foodBroccoli from '../../assets/food/food_broccoli_1772515536080.png';
import foodCarrot from '../../assets/food/food_carrot_1772515476805.png';
import foodCheese from '../../assets/food/food_cheese_1772515508553.png';
import foodChicken from '../../assets/food/food_chicken_1772515570388.png';
import foodEgg from '../../assets/food/food_egg_1772515554611.png';
import foodMilk from '../../assets/food/food_milk_1772515491871.png';
import foodNuts from '../../assets/food/food_nuts_1772683511935.png';
import foodLollipop from '../../assets/food/food_lollipop_1772683530421.png';
import foodCandy from '../../assets/food/food_candy_1772683545366.png';
import foodDonut from '../../assets/food/food_donut_1772683563767.png';
import foodChocolate from '../../assets/food/food_chocolate_1772683582627.png';
import foodCupcake from '../../assets/food/food_cupcake_1772683600593.png';
import foodCookie from '../../assets/food/food_cookie_1772683626966.png';
import foodSoda from '../../assets/food/food_soda_1772683643468.png';
import foodCake from '../../assets/food/food_cake_1772683671171.png';

type Screen = 'start' | 'playing' | 'victory';

interface FoodItem {
  id: number;
  emoji: string;
  name: string;
  isHealthy: boolean;
  image?: string;
}

const FOODS: Omit<FoodItem, 'id'>[] = [
  { emoji: '🍎', name: 'Apple', isHealthy: true, image: foodApple },
  { emoji: '🥕', name: 'Carrot', isHealthy: true, image: foodCarrot },
  { emoji: '🥛', name: 'Milk', isHealthy: true, image: foodMilk },
  { emoji: '🧀', name: 'Cheese', isHealthy: true, image: foodCheese },
  { emoji: '🥦', name: 'Broccoli', isHealthy: true, image: foodBroccoli },
  { emoji: '🥚', name: 'Egg', isHealthy: true, image: foodEgg },
  { emoji: '🍗', name: 'Chicken', isHealthy: true, image: foodChicken },
  { emoji: '🥜', name: 'Nuts', isHealthy: true, image: foodNuts },
  { emoji: '🍭', name: 'Lollipop', isHealthy: false, image: foodLollipop },
  { emoji: '🍬', name: 'Candy', isHealthy: false, image: foodCandy },
  { emoji: '🍩', name: 'Donut', isHealthy: false, image: foodDonut },
  { emoji: '🍫', name: 'Chocolate', isHealthy: false, image: foodChocolate },
  { emoji: '🧁', name: 'Cupcake', isHealthy: false, image: foodCupcake },
  { emoji: '🍪', name: 'Cookie', isHealthy: false, image: foodCookie },
  { emoji: '🥤', name: 'Soda', isHealthy: false, image: foodSoda },
  { emoji: '🍰', name: 'Cake', isHealthy: false, image: foodCake },
];

export function KingsBanquet({ onComplete, onExit }: GameProps) {
  const [screen, setScreen] = useState<Screen>('start');
  const [score, setScore] = useState(0);
  const [currentFood, setCurrentFood] = useState<FoodItem | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [foodsAnswered, setFoodsAnswered] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);

  const maxScore = 500;
  const totalFoods = 15;

  const audio = useGameAudio('banquet');

  // Start/stop background music
  useEffect(() => {
    if (screen === 'playing') audio.startBg();
    else audio.stopBg();
  }, [screen]);

  // Get next food
  const getNextFood = useCallback(() => {
    const food = FOODS[Math.floor(Math.random() * FOODS.length)];
    setCurrentFood({ ...food, id: Date.now() });
    setFeedback(null);
  }, []);

  // Start game
  useEffect(() => {
    if (screen === 'playing' && !currentFood) {
      getNextFood();
    }
  }, [screen, currentFood, getNextFood]);

  // Timer with tick SFX
  useEffect(() => {
    if (screen !== 'playing') return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setScreen('victory');
          return 0;
        }
        if (t <= 6) audio.sfxTick(); // tick each second in last 5s
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screen]);

  // Check if game complete
  useEffect(() => {
    if (foodsAnswered >= totalFoods && screen === 'playing') {
      setScreen('victory');
    }
  }, [foodsAnswered, screen]);

  const handleAnswer = (isHealthy: boolean) => {
    if (!currentFood || feedback) return;

    const correct = currentFood.isHealthy === isHealthy;
    setFeedback(correct ? 'correct' : 'wrong');

    if (correct) {
      const newStreak = streak + 1;
      const bonus = Math.min(streak * 5, 20);
      if (newStreak >= 3) audio.sfxPerfect(); else audio.sfxSuccess();
      setScore(s => Math.min(maxScore, s + 25 + bonus));
      setStreak(newStreak);
    } else {
      audio.sfxHit();
      setStreak(0);
    }

    setFoodsAnswered(f => f + 1);

    setTimeout(() => {
      if (foodsAnswered + 1 < totalFoods) {
        getNextFood();
      } else {
        setScreen('victory');
      }
    }, 800);
  };

  // Fixed star logic: 0 stars for 0 points
  const stars = score > 0 ? (score >= 400 ? 3 : score >= 250 ? 2 : 1) : 0;

  // Handle game completion
  useEffect(() => {
    if (screen === 'victory') {
      audio.sfxVictory();
      onComplete(score, stars);
    }
  }, [screen, score, stars, onComplete]);

  return (
    <div
      className="absolute inset-0 w-full h-full flex flex-col overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${toothKingdomBg})` }}
    >
      <div className="absolute inset-0 bg-amber-900/40 pointer-events-none z-0" />

      <AnimatePresence mode="wait">
        {screen === 'start' && (
          <GameStartScreen
            key="start"
            title="The King's"
            subtitle="Banquet!"
            instructions="Sort the foods! Is it healthy for teeth or sugary? ✅ Healthy = Good! ❌ Sugary = Bad!"
            heroAsset={kingHeroChibi}
            onStart={() => setScreen('playing')}
            onExit={onExit}
            icon={<Utensils className="w-6 h-6 text-amber-500" />}
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
              <div className="text-white text-sm font-bold">
                {foodsAnswered}/{totalFoods}
              </div>

              <div className="text-yellow-300 font-bold text-lg">
                {score}
              </div>

              <div className="flex items-center gap-2">
                {streak > 1 && (
                  <span className="bg-orange-500 px-2 py-1 rounded text-white text-xs font-bold">
                    🔥 {streak}x
                  </span>
                )}
                <span className="bg-white/20 px-3 py-1 rounded-full text-white text-sm font-bold">
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Game area */}
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              {currentFood && (
                <motion.div
                  key={currentFood.id}
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="relative"
                >
                  <motion.div
                    className="relative flex flex-col items-center justify-center w-64 h-64"
                    animate={feedback ? { scale: [1, 1.1, 1] } : { y: [0, -5, 0] }}
                    transition={feedback ? { duration: 0.3 } : { duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    {/* Feedback glow */}
                    {feedback === 'correct' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-green-400/40 blur-2xl rounded-full z-0 pointer-events-none"
                      />
                    )}
                    {feedback === 'wrong' && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute inset-0 bg-red-400/40 blur-2xl rounded-full z-0 pointer-events-none"
                      />
                    )}

                    <div className="relative z-10 flex flex-col items-center justify-center pointer-events-none">
                      {currentFood.image ? (
                        <img
                          src={currentFood.image}
                          alt={currentFood.name}
                          className="w-48 h-48 object-contain mb-2 mix-blend-multiply drop-shadow-xl"
                        />
                      ) : (
                        <span className="text-8xl mb-2 drop-shadow-xl">{currentFood.emoji}</span>
                      )}
                      <span className="text-3xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{currentFood.name}</span>
                    </div>

                    {feedback && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`absolute top-0 right-0 w-12 h-12 rounded-full flex items-center justify-center z-20 shadow-lg ${feedback === 'correct' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                      >
                        {feedback === 'correct' ? (
                          <Check className="w-8 h-8 text-white" />
                        ) : (
                          <X className="w-8 h-8 text-white" />
                        )}
                      </motion.div>
                    )}
                  </motion.div>

                  {feedback && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`text-center mt-4 font-bold text-lg ${feedback === 'correct' ? 'text-green-200' : 'text-red-200'
                        }`}
                    >
                      {feedback === 'correct'
                        ? (currentFood.isHealthy ? '🦷 Great for teeth!' : '✓ You knew it!')
                        : (currentFood.isHealthy ? 'Actually healthy!' : 'That\'s sugary!')
                      }
                    </motion.p>
                  )}
                </motion.div>
              )}
            </div>

            {/* Controls */}
            <div className="p-6 bg-black/50 flex items-center justify-center gap-6 pointer-events-auto relative z-20">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAnswer(true)}
                disabled={!!feedback}
                className="w-28 h-20 bg-gradient-to-b from-green-400 to-green-600 rounded-2xl text-white shadow-lg flex flex-col items-center justify-center active:from-green-500 active:to-green-700 disabled:opacity-50"
              >
                <Check className="w-8 h-8" />
                <span className="text-xs font-bold mt-1">Healthy</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => handleAnswer(false)}
                disabled={!!feedback}
                className="w-28 h-20 bg-gradient-to-b from-red-400 to-red-600 rounded-2xl text-white shadow-lg flex flex-col items-center justify-center active:from-red-500 active:to-red-700 disabled:opacity-50"
              >
                <X className="w-8 h-8" />
                <span className="text-xs font-bold mt-1">Sugary</span>
              </motion.button>
            </div>
          </motion.div>
        )}

        {screen === 'victory' && null}
      </AnimatePresence>
    </div>
  );
}
