import React from 'react';
import { ScreenProps } from './types';
import { Trophy, Star, Flame, Sparkles } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { useSound } from '../../hooks/useSound';
import { useEffect } from 'react';
import { rpgService } from '../../services/rpgService';

export function LessonCompleteScreen({ navigateTo, userData, updateUserData }: ScreenProps) {
  const { playSound } = useSound();
  const starsEarned = 3;
  const streakIncreased = true;

  // Play fanfare once on mount
  useEffect(() => {
    playSound('achievement');
  }, []);

  const handleContinue = () => {
    // Rewards are now handled by the lesson/quest completion trigger
    navigateTo('reward-unlocked');
  };

  return (
    <div className="h-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            <Star className="w-3 h-3 text-white fill-white/20" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        {/* Character Avatar celebrating */}
        <div className="mb-6 animate-bounce">
          <UserAvatar
            characterId={userData.selectedCharacter}
            size="xlarge"
            showBackground={true}
            className="mx-auto"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-white mb-3">
          Lesson Complete!
        </h1>
        <p className="text-white/90 text-lg mb-8 flex items-center justify-center gap-2">
          Amazing work, Champion! <Sparkles className="w-5 h-5 text-yellow-300" />
        </p>

        {/* Stats */}
        <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 mb-8 border border-white/30">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-6 h-6 text-yellow-300 fill-yellow-300" />
                <span className="text-3xl font-bold text-white">{starsEarned}</span>
              </div>
              <p className="text-white/80 text-sm">Stars Earned</p>
            </div>

            {streakIncreased && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Flame className="w-6 h-6 text-orange-300 fill-orange-300" />
                  <span className="text-3xl font-bold text-white">+1</span>
                </div>
                <p className="text-white/80 text-sm">Streak Day</p>
              </div>
            )}
          </div>
        </div>

        {/* Achievement unlocked */}
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 mb-8 border border-white/30">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center">
              <Trophy className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-white font-bold">New Achievement!</p>
              <p className="text-white/80 text-sm">Brushing Basics Master</p>
            </div>
          </div>
        </div>

        {/* Continue button */}
        <button
          onClick={handleContinue}
          className="w-full h-16 bg-white text-purple-600 rounded-2xl font-bold text-lg shadow-2xl transition-all hover:scale-105 active:scale-95"
        >
          Claim Reward →
        </button>

        {/* Skip option */}
        <button
          onClick={() => navigateTo('dashboard')}
          className="mt-4 text-white/80 text-sm font-medium"
        >
          Back to Dashboard
        </button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
            opacity: 0.5;
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      ` }} />
    </div>
  );
}