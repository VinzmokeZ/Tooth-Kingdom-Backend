import React from 'react';
import { ScreenProps } from './types';
import { Sparkles, Award, Trophy } from 'lucide-react';
import { UserAvatar } from '../common/UserAvatar';
import { TransparentImage } from '../common/TransparentImage';
import { StarRating } from '../games/StarRating';
import { motion } from 'framer-motion';

export function PremiumChromaText({ children, className = "" }: { children: React.ReactNode, className?: string }) {
  return (
    <span className={`inline-block font-black animate-premiumChroma ${className}`}>
      {children}
    </span>
  );
}

export function RewardUnlockedScreen({ navigateTo, userData }: ScreenProps) {
  const result = userData.lastGameResult;

  return (
    <div className="h-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex flex-col items-center justify-center p-8 relative overflow-hidden">
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
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        .animate-sparkle {
          animation: sparkle 2s ease-in-out infinite;
        }
      ` }} />

      {/* Sparkle effects */}
      <div className="absolute inset-0">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute text-yellow-300 animate-sparkle opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          >
            <Sparkles className="w-4 h-4" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 text-center w-full max-w-sm">
        {/* Character celebrating with reward */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-4"
        >
          <UserAvatar
            characterId={userData.selectedCharacter}
            size="large"
            showBackground={true}
            className="mx-auto border-4 border-white/30 shadow-2xl"
          />
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl mb-4">
            <PremiumChromaText>Reward Unlocked!</PremiumChromaText>
          </h2>
        </motion.div>

        {/* Victory Stats (Score & Stars Integration) */}
        {result && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-6 flex flex-col items-center gap-2"
          >
            <div className="flex items-center gap-2">
              <div className="h-[1px] w-8 bg-gradient-to-r from-transparent to-white/40" />
              <span className="text-3xl font-black text-white drop-shadow-lg tabular-nums">
                <PremiumChromaText className="!animation-duration-[4s]">{result.score.toLocaleString()}</PremiumChromaText>
                <span className="text-sm uppercase tracking-widest text-white/60 ml-1">pts</span>
              </span>
              <div className="h-[1px] w-8 bg-gradient-to-l from-transparent to-white/40" />
            </div>
            <StarRating stars={result.stars} size="md" />
          </motion.div>
        )}

        {/* Reward card */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="rounded-[2.5rem] p-1 mb-6 relative group"
        >
          <div className="absolute inset-0 bg-white/10 blur-xl rounded-[2.5rem] -z-10 group-hover:bg-white/20 transition-all" />
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden relative">
            <div className="w-40 h-40 mx-auto mb-4 flex items-center justify-center relative bg-white rounded-3xl overflow-hidden shadow-xl p-3">
              <img
                src="/thumbnails/reward_golden_crown.png"
                alt="Golden Crown"
                className="w-full h-full object-contain"
              />
            </div>
            <h3 className="text-2xl font-black mb-1">
              <PremiumChromaText className="!animation-duration-[8s]">Golden Crown</PremiumChromaText>
            </h3>
            <p className="text-white/70 text-xs font-bold uppercase tracking-wider">
              Chapter Completion Reward
            </p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={() => navigateTo('rewards')}
            className="w-full h-14 bg-gradient-to-r from-white to-white/90 border-2 border-white/50 text-purple-600 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_10px_20px_rgba(0,0,0,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group"
          >
            <Award className="w-5 h-5 group-hover:rotate-12 transition-transform text-purple-500" />
            <PremiumChromaText>View My Rewards</PremiumChromaText>
          </button>

          <button
            onClick={() => navigateTo('dashboard')}
            className="text-white/60 hover:text-white transition-colors text-xs font-black uppercase tracking-[0.2em] flex items-center justify-center gap-2 mt-2 drop-shadow-md"
          >
            <PremiumChromaText className="!animation-duration-[8s]">Continue Adventure</PremiumChromaText> <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
          </button>
        </motion.div>
      </div>
    </div>
  );
}