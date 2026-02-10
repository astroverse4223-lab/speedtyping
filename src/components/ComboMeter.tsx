// ── Combo Meter ──
import { motion, AnimatePresence } from 'framer-motion';

interface ComboMeterProps {
  combo: number;
  overdrive: boolean;
}

export function ComboMeter({ combo, overdrive }: ComboMeterProps) {
  if (combo < 3) return null;

  const progress = Math.min(combo / 20, 1);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-4xl mb-4"
    >
      <div className="flex items-center gap-3">
        {/* Combo count */}
        <AnimatePresence mode="wait">
          <motion.span
            key={combo}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className={`text-sm font-bold font-mono tabular-nums
              ${overdrive ? 'text-neon-cyan text-glow-cyan' : 'text-neon-yellow'}`}
          >
            {combo}x
          </motion.span>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="flex-1 h-1.5 rounded-full bg-surface-700 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              overdrive
                ? 'bg-gradient-to-r from-neon-cyan via-neon-pink to-neon-cyan'
                : 'bg-gradient-to-r from-neon-yellow to-neon-orange'
            }`}
            style={{ width: `${progress * 100}%` }}
            animate={{
              width: `${progress * 100}%`,
              ...(overdrive ? {
                boxShadow: [
                  '0 0 10px rgba(0,240,255,0.5)',
                  '0 0 20px rgba(255,45,149,0.5)',
                  '0 0 10px rgba(0,240,255,0.5)',
                ],
              } : {}),
            }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Overdrive label */}
        {overdrive && (
          <motion.span
            initial={{ x: 10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="text-[10px] font-bold tracking-[0.2em] text-neon-cyan uppercase px-2 py-0.5 rounded
                       bg-neon-cyan/10 border border-neon-cyan/30"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            OVERDRIVE
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
