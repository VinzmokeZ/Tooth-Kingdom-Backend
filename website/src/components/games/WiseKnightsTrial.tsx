import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Brain } from 'lucide-react';
import { GameProps } from './types';
import { GameStartScreen, GameVictoryScreen } from './common/GameUI';
import { useGameAudio } from './useGameAudio';

// Asset imports
import toothKingdomBg from '../../assets/tooth_kingdom_bg.png';
import wiseKnightChibi from '../../assets/CHIBI 5.svg';
import quizBrushFreq from '../../assets/quiz/quiz_brush_freq_1772515270057.png';
import quizBrushTimer from '../../assets/quiz/quiz_brush_timer_1772515288039.png';
import quizFluoride from '../../assets/quiz/quiz_fluoride_1772515305670.png';
import quizHealthyFood from '../../assets/quiz/quiz_healthy_food_1772515322467.png';
import quizFloss from '../../assets/quiz/quiz_floss_1772515338924.png';
import quizDentist from '../../assets/quiz/quiz_dentist_1772515355022.png';
import quizCavityCause from '../../assets/quiz/quiz_cavity_cause_1772515447763.png';
import quizReplaceBrush from '../../assets/quiz/quiz_replace_brush_1772515387022.png';
import quizWaterDrink from '../../assets/quiz/quiz_water_drink_1772515404327.png';
import quizEnamel from '../../assets/quiz/quiz_enamel_1772515419600.png';

type Screen = 'start' | 'playing' | 'victory';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
  emoji: string;
  image?: string;
}

const QUESTIONS: (Question & { image?: string })[] = [
  {
    question: 'How many times should you brush your teeth daily?',
    options: ['Once', 'Twice', 'Three times', 'Never'],
    correctIndex: 1,
    emoji: '🪥',
    image: quizBrushFreq,
  },
  {
    question: 'How long should you brush your teeth?',
    options: ['30 seconds', '1 minute', '2 minutes', '5 minutes'],
    correctIndex: 2,
    emoji: '⏱️',
    image: quizBrushTimer,
  },
  {
    question: 'What helps make teeth stronger?',
    options: ['Sugar', 'Fluoride', 'Candy', 'Soda'],
    correctIndex: 1,
    emoji: '💪',
    image: quizFluoride,
  },
  {
    question: 'Which food is good for your teeth?',
    options: ['Candy', 'Cheese', 'Lollipop', 'Soda'],
    correctIndex: 1,
    emoji: '🧀',
    image: quizHealthyFood,
  },
  {
    question: 'What should you use to clean between teeth?',
    options: ['Toothpick', 'Dental floss', 'Pencil', 'Paper'],
    correctIndex: 1,
    emoji: '🧵',
    image: quizFloss,
  },
  {
    question: 'How often should you visit the dentist?',
    options: ['Every week', 'Every month', 'Every 6 months', 'Never'],
    correctIndex: 2,
    emoji: '👨‍⚕️',
    image: quizDentist,
  },
  {
    question: 'What causes cavities?',
    options: ['Water', 'Vegetables', 'Sugar and bacteria', 'Cheese'],
    correctIndex: 2,
    emoji: '🦷',
    image: quizCavityCause,
  },
  {
    question: 'When should you replace your toothbrush?',
    options: ['Every week', 'Every 3-4 months', 'Every year', 'Never'],
    correctIndex: 1,
    emoji: '🪥',
    image: quizReplaceBrush,
  },
  {
    question: 'Which drink is best for your teeth?',
    options: ['Soda', 'Juice', 'Water', 'Energy drink'],
    correctIndex: 2,
    emoji: '💧',
    image: quizWaterDrink,
  },
  {
    question: 'What protects the outside of your tooth?',
    options: ['Sugar', 'Enamel', 'Candy', 'Plaque'],
    correctIndex: 1,
    emoji: '🛡️',
    image: quizEnamel,
  },
];

export function WiseKnightsTrial({ onComplete, onExit }: GameProps) {
  const [screen, setScreen] = useState<Screen>('start');
  const [score, setScore] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(15);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);

  const maxScore = 500;
  const totalQuestions = 8;

  const audio = useGameAudio('banquet'); // royal/quiz theme

  // Start/stop background music
  useEffect(() => {
    if (screen === 'playing') audio.startBg();
    else audio.stopBg();
  }, [screen]);

  // Shuffle questions on start
  const startGame = useCallback(() => {
    const shuffled = [...QUESTIONS].sort(() => Math.random() - 0.5).slice(0, totalQuestions);
    setShuffledQuestions(shuffled);
    setScreen('playing');
    setCurrentQuestionIndex(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(15);
    setSelectedAnswer(null);
    setIsCorrect(null);
  }, []);

  // Timer with tick SFX on last 5 seconds
  useEffect(() => {
    if (screen !== 'playing' || selectedAnswer !== null) return;

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          handleAnswer(-1);
          return 15;
        }
        if (t <= 6) audio.sfxTick();
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, selectedAnswer]);

  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) return;

    const currentQuestion = shuffledQuestions[currentQuestionIndex];
    const correct = answerIndex === currentQuestion.correctIndex;

    setSelectedAnswer(answerIndex);
    setIsCorrect(correct);

    if (correct) {
      const newStreak = streak + 1;
      const timeBonus = Math.floor(timeLeft * 2);
      const streakBonus = Math.min(streak * 10, 30);
      if (newStreak >= 3) audio.sfxPerfect(); else audio.sfxSuccess();
      setScore(s => Math.min(maxScore, s + 40 + timeBonus + streakBonus));
      setStreak(newStreak);
    } else {
      audio.sfxHit();
      setStreak(0);
    }

    // Move to next question or victory
    setTimeout(() => {
      if (currentQuestionIndex + 1 >= totalQuestions) {
        setScreen('victory');
      } else {
        setCurrentQuestionIndex(i => i + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setTimeLeft(15);
      }
    }, 1200);
  };

  const currentQuestion = shuffledQuestions[currentQuestionIndex];

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
      <div className="absolute inset-0 bg-indigo-900/50 pointer-events-none z-0" />

      <AnimatePresence mode="wait">
        {screen === 'start' && (
          <GameStartScreen
            key="start"
            title="Wise Knight's"
            subtitle="Trial!"
            instructions="Test your dental knowledge and prove your wisdom! Answer fast for bonus points!"
            heroAsset={wiseKnightChibi}
            onStart={startGame}
            onExit={onExit}
            icon={<Brain className="w-6 h-6 text-amber-400" />}
          />
        )}

        {screen === 'playing' && currentQuestion && (
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
                Q{currentQuestionIndex + 1}/{totalQuestions}
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
                <motion.div
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold ${timeLeft <= 5 ? 'bg-red-500 text-white' : 'bg-white/20 text-white'
                    }`}
                  animate={timeLeft <= 5 ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Clock className="w-4 h-4" />
                  {timeLeft}s
                </motion.div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full max-w-lg mx-auto p-4 pb-20 pointer-events-auto relative z-20">
              <motion.div
                key={currentQuestionIndex}
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                style={{
                  background: '#fff',
                  borderRadius: 20,
                  padding: '16px 18px',
                  marginBottom: 16,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.22)',
                }}
              >
                <div className="flex flex-col items-center">
                  {currentQuestion.image && (
                    <motion.div
                      initial={{ scale: 0.8 }}
                      animate={{ scale: 1 }}
                      className="w-full h-24 sm:h-32 rounded-xl overflow-hidden mb-2 flex items-center justify-center bg-gray-50"
                      style={{ border: '2px solid #e2e8f0' }}
                    >
                      <img src={currentQuestion.image} alt="Question Illustration" className="h-full w-auto object-contain" />
                    </motion.div>
                  )}
                  <div className="text-3xl text-center mb-2">{currentQuestion.emoji}</div>
                  <p style={{ color: '#1e293b', fontWeight: 800, fontSize: 16, lineHeight: 1.4, textAlign: 'center', margin: 0 }}>
                    {currentQuestion.question}
                  </p>
                </div>
              </motion.div>

              {/* Options */}
              <div className="flex flex-col gap-3 relative z-20">
                {currentQuestion.options.map((option: string, index: number) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrectAnswer = index === currentQuestion.correctIndex;
                  const showResult = selectedAnswer !== null;

                  let btnBg = '#ffffff';
                  let btnColor = '#1e293b';
                  if (showResult) {
                    if (isCorrectAnswer) {
                      btnBg = '#22c55e'; btnColor = '#fff';
                    } else if (isSelected && !isCorrect) {
                      btnBg = '#ef4444'; btnColor = '#fff';
                    } else {
                      btnBg = '#f1f5f9'; btnColor = '#94a3b8';
                    }
                  }

                  return (
                    <motion.button
                      key={index}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedAnswer !== null}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        borderRadius: 14,
                        border: 'none',
                        background: btnBg,
                        color: btnColor,
                        fontWeight: 700,
                        fontSize: 14,
                        textAlign: 'left',
                        cursor: selectedAnswer !== null ? 'default' : 'pointer',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                        transition: 'background 0.25s',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      <span className="text-gray-800 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
                          {String.fromCharCode(65 + index)}
                        </span>
                        {option}
                        {showResult && isCorrectAnswer && (
                          <span className="ml-auto text-xl">✓</span>
                        )}
                        {showResult && isSelected && !isCorrect && (
                          <span className="ml-auto text-xl">✗</span>
                        )}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Feedback */}
              {isCorrect !== null && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`text-center py-3 rounded-xl mt-3 font-bold ${isCorrect ? 'bg-green-500/50 text-green-100' : 'bg-red-500/50 text-red-100'
                    }`}
                >
                  {isCorrect ? '🎉 Correct! +' + (40 + Math.floor(timeLeft * 2)) : '❌ Not quite!'}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {screen === 'victory' && null}
      </AnimatePresence>
    </div>
  );
}
