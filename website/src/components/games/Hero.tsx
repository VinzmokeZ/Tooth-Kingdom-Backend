import { motion } from 'framer-motion';

interface HeroProps {
  x: number;
  y: number;
  direction: 'left' | 'right';
  isAttacking: boolean;
  health: number;
  maxHealth: number;
  variant?: 'knight' | 'tooth' | 'brush';
}

export function Hero({ x, y, direction, isAttacking, health, maxHealth, variant = 'tooth' }: HeroProps) {
  const healthPercent = (health / maxHealth) * 100;

  return (
    <motion.div
      className="absolute z-30"
      style={{ left: x, top: y }}
      animate={{
        scaleX: direction === 'left' ? -1 : 1,
      }}
      transition={{ duration: 0.1 }}
    >
      {/* Health Bar - Bubbly style */}
      <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-20 h-4 bg-purple-900 rounded-full overflow-hidden border-3 border-pink-400 shadow-lg">
        <motion.div
          className="h-full bg-gradient-to-r from-green-400 via-lime-400 to-green-300 rounded-full"
          animate={{ width: `${healthPercent}%` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent rounded-full" />
      </div>

      {variant === 'tooth' && (
        <motion.div
          className="relative"
          animate={{
            rotate: isAttacking ? [0, -15, 15, -10, 10, 0] : [0, 2, -2, 0],
            scale: isAttacking ? [1, 1.1, 1] : 1
          }}
          transition={{ duration: isAttacking ? 0.4 : 2, repeat: isAttacking ? 0 : Infinity }}
        >
          {/* Main Tooth Body - Cute cartoon style */}
          <div className="relative w-16 h-20">
            {/* Glow effect */}
            <div className="absolute -inset-2 bg-cyan-400/30 rounded-full blur-md" />

            {/* Tooth body */}
            <div className="absolute inset-0 bg-gradient-to-b from-white via-blue-50 to-blue-100 rounded-t-full rounded-b-lg shadow-lg border-4 border-cyan-300">
              {/* Shine */}
              <div className="absolute top-2 left-2 w-4 h-6 bg-white rounded-full opacity-70" />

              {/* Face */}
              <div className="absolute top-6 left-0 right-0 flex flex-col items-center">
                {/* Eyes */}
                <div className="flex gap-3 mb-1">
                  <motion.div
                    className="w-3 h-4 bg-slate-800 rounded-full relative"
                    animate={{ scaleY: isAttacking ? [1, 0.2, 1] : 1 }}
                  >
                    <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full" />
                  </motion.div>
                  <motion.div
                    className="w-3 h-4 bg-slate-800 rounded-full relative"
                    animate={{ scaleY: isAttacking ? [1, 0.2, 1] : 1 }}
                  >
                    <div className="absolute top-0.5 left-0.5 w-1.5 h-1.5 bg-white rounded-full" />
                  </motion.div>
                </div>
                {/* Mouth */}
                <motion.div
                  className="w-5 h-3 bg-pink-400 rounded-full flex items-center justify-center"
                  animate={{ scale: isAttacking ? [1, 1.3, 1] : 1 }}
                >
                  {isAttacking && <span className="text-[8px]">😤</span>}
                </motion.div>
              </div>
            </div>

            {/* Roots */}
            <div className="absolute bottom-0 left-1 w-3 h-4 bg-gradient-to-b from-blue-100 to-blue-200 rounded-b-lg" />
            <div className="absolute bottom-0 right-1 w-3 h-4 bg-gradient-to-b from-blue-100 to-blue-200 rounded-b-lg" />
          </div>

          {/* Brush/Weapon - when attacking */}
          {isAttacking && (
            <motion.div
              className="absolute -right-8 top-2"
              initial={{ rotate: -90, scale: 0 }}
              animate={{ rotate: [45, -30, 45], scale: 1, x: [0, 10, 0] }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-4 h-14 bg-gradient-to-b from-pink-400 to-pink-500 rounded-lg shadow-lg border-2 border-pink-300">
                <div className="absolute -top-2 left-0 right-0 h-4 bg-gradient-to-b from-cyan-300 to-cyan-400 rounded-t-lg flex flex-col gap-0.5 p-0.5">
                  <div className="w-full h-0.5 bg-white/50 rounded" />
                  <div className="w-full h-0.5 bg-white/50 rounded" />
                  <div className="w-full h-0.5 bg-white/50 rounded" />
                </div>
              </div>
            </motion.div>
          )}

          {/* Sparkles when healthy */}
          {healthPercent > 70 && (
            <>
              <motion.div
                className="absolute -top-4 -right-4 text-lg"
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                ✨
              </motion.div>
              <motion.div
                className="absolute -top-2 -left-4 text-sm"
                animate={{ scale: [1, 0.8, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
              >
                ⭐
              </motion.div>
            </>
          )}
        </motion.div>
      )}

      {variant === 'brush' && (
        <motion.div
          className="relative"
          animate={{
            rotate: isAttacking ? [0, -20, 20, -20, 20, 0] : [0, 3, -3, 0],
          }}
          transition={{ duration: isAttacking ? 0.5 : 1.5, repeat: isAttacking ? 0 : Infinity }}
        >
          {/* Toothbrush Hero */}
          <div className="relative w-12 h-24">
            {/* Glow */}
            <div className="absolute -inset-2 bg-pink-400/30 rounded-full blur-md" />

            {/* Handle */}
            <div className="absolute bottom-0 left-2 w-8 h-16 bg-gradient-to-r from-pink-400 via-pink-300 to-pink-400 rounded-lg shadow-lg border-2 border-pink-500">
              {/* Grip details */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-8 bg-pink-500/30 rounded" />

              {/* Face on handle */}
              <div className="absolute top-8 left-0 right-0 flex flex-col items-center">
                <div className="flex gap-1">
                  <motion.div
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ scaleY: [1, 0.5, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  <motion.div
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{ scaleY: [1, 0.5, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                </div>
                <div className="w-2 h-1 bg-red-400 rounded-full mt-0.5" />
              </div>
            </div>

            {/* Bristles */}
            <div className="absolute top-0 left-1 w-10 h-8 bg-gradient-to-b from-cyan-300 to-cyan-400 rounded-t-lg border-2 border-cyan-500">
              <div className="flex flex-col gap-0.5 p-1">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-full h-1 bg-white rounded"
                    animate={{ scaleX: isAttacking ? [1, 0.8, 1] : 1 }}
                    transition={{ delay: i * 0.05 }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Attack swoosh */}
          {isAttacking && (
            <motion.div
              className="absolute -right-6 top-4"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5], opacity: [1, 0] }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-8 h-2 bg-gradient-to-r from-cyan-400 to-transparent rounded-full" />
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Attack Effect - Colorful sparkles */}
      {isAttacking && (
        <motion.div
          className="absolute -right-4 top-1/2 -translate-y-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex gap-1">
            <motion.span
              className="text-xl"
              animate={{ x: [0, 20], y: [0, -10], opacity: [1, 0] }}
              transition={{ duration: 0.3 }}
            >
              💥
            </motion.span>
            <motion.span
              className="text-lg"
              animate={{ x: [0, 15], y: [0, 5], opacity: [1, 0] }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              ✨
            </motion.span>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
