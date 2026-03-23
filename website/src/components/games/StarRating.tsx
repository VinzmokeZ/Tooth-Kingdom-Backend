import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface StarRatingProps {
  stars: number;
  maxStars?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StarRating({ stars, maxStars = 3, size = 'md' }: StarRatingProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-14 h-14',
    lg: 'w-24 h-24'
  };

  return (
    <div className="flex gap-4 justify-center items-center py-4">
      {Array.from({ length: maxStars }).map((_, i) => {
        const isEarned = i < stars;

        return (
          <motion.div
            key={i}
            initial={{ scale: 0, rotate: -180, y: 20 }}
            animate={{ scale: 1, rotate: 0, y: 0 }}
            transition={{
              delay: i * 0.15,
              type: 'spring',
              stiffness: 260,
              damping: 20
            }}
            className="relative"
          >
            {/* Background Slot - "Premium Stone" Look */}
            <div
              className={`absolute inset-0 rounded-2xl transform rotate-45 border-2 transition-all duration-500 ${isEarned
                  ? 'bg-amber-400/20 border-amber-300/40 shadow-[0_0_20px_rgba(251,191,36,0.2)]'
                  : 'bg-white/5 border-white/10 shadow-inner'
                }`}
              style={{ width: '100%', height: '100%', scale: '0.8' }}
            />

            {/* Glow effect for earned stars */}
            {isEarned && (
              <motion.div
                className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl opacity-40 mix-blend-screen"
                animate={{
                  scale: [1, 1.4, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            <motion.div
              animate={isEarned ? {
                scale: [1, 1.1, 1],
                filter: [
                  'drop-shadow(0 0 5px rgba(251,191,36,0.8))',
                  'drop-shadow(0 0 15px rgba(251,191,36,1))',
                  'drop-shadow(0 0 5px rgba(251,191,36,0.8))'
                ]
              } : {}}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className={`${sizeClasses[size]} relative z-10 transition-colors duration-500`}
                style={{
                  filter: isEarned ? 'url(#star-gradient-shadow)' : 'none'
                }}
              >
                <defs>
                  <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FDE68A" /> {/* amber-200 */}
                    <stop offset="50%" stopColor="#F59E0B" /> {/* amber-500 */}
                    <stop offset="100%" stopColor="#B45309" /> {/* amber-700 */}
                  </linearGradient>
                  <filter id="star-gradient-shadow">
                    <feDropShadow dx="0" dy="1" stdDeviation="0.5" floodColor="#92400E" />
                  </filter>
                </defs>
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                  fill={isEarned ? "url(#gold-gradient)" : "rgba(255,255,255,0.05)"}
                  stroke={isEarned ? "#FEF3C7" : "rgba(255,255,255,0.15)"}
                  strokeWidth={isEarned ? "1" : "0.5"}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>

            {/* Premium Sparkles for Earned Stars */}
            {isEarned && (
              <>
                <motion.div
                  className="absolute -top-1 -right-1 text-xs"
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 90],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4 }}
                >
                  ✨
                </motion.div>
                <motion.div
                  className="absolute -bottom-1 -left-1 text-xs"
                  animate={{
                    scale: [0, 1.2, 0],
                    rotate: [0, -90],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: i * 0.8 }}
                >
                  🌟
                </motion.div>
              </>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
