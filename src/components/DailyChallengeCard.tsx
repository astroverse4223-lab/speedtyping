// ── Daily Challenge Card ──
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { GameConfig } from '../types';
import { generateDailyChallenge, getTimeUntilNextChallenge, getRankColor } from '../utils/dailyChallenge';
import { getDailyChallenge, getStreak, getBestDailyScore } from '../utils/storage';
import { todayString } from '../utils/rng';

interface DailyChallengeCardProps {
  onStart: (config: GameConfig) => void;
}

export function DailyChallengeCard({ onStart }: DailyChallengeCardProps) {
  const [countdown, setCountdown] = useState(getTimeUntilNextChallenge());
  const today = todayString();
  const challenge = generateDailyChallenge(today);
  const saved = getDailyChallenge(today);
  const completed = saved?.completed || false;
  const streak = getStreak();
  const bestDaily = getBestDailyScore();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getTimeUntilNextChallenge());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const modeLabel = challenge.config.mode.charAt(0).toUpperCase() + challenge.config.mode.slice(1);
  const themeLabel = challenge.config.theme.charAt(0).toUpperCase() + challenge.config.theme.slice(1);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`relative overflow-hidden rounded-xl p-5
        ${completed
          ? 'bg-surface-800 border border-neon-green/30'
          : 'bg-gradient-to-r from-surface-800 to-surface-700 neon-border-pink'
        }`}
    >
      {/* Glow accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-neon-cyan/5 rounded-full blur-3xl" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg">🏆</span>
            <h3 className="text-sm font-bold tracking-wider uppercase"
                style={{ fontFamily: 'var(--font-display)' }}>
              Daily Challenge
            </h3>
            {completed && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neon-green/20 text-neon-green border border-neon-green/30">
                COMPLETED
              </span>
            )}
          </div>
          <div className="text-xs text-text-secondary">
            Next in{' '}
            <span className="text-neon-pink font-mono">
              {String(countdown.hours).padStart(2, '0')}:
              {String(countdown.minutes).padStart(2, '0')}:
              {String(countdown.seconds).padStart(2, '0')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-3 text-xs text-text-secondary">
          <span className="px-2 py-1 rounded bg-surface-600/50">{modeLabel}</span>
          <span className="px-2 py-1 rounded bg-surface-600/50">{themeLabel}</span>
          <span className="px-2 py-1 rounded bg-surface-600/50">{challenge.config.timer}s</span>
          {streak > 0 && (
            <span className="px-2 py-1 rounded bg-neon-orange/10 text-neon-orange border border-neon-orange/20">
              🔥 {streak} day streak
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-4 text-xs">
            {saved?.score && (
              <span>
                Today:{' '}
                <span className="font-bold" style={{ color: getRankColor(saved.rankTier || 'bronze') }}>
                  {saved.score} WPM
                </span>
              </span>
            )}
            {bestDaily > 0 && (
              <span className="text-text-secondary">
                Best: <span className="text-text-primary font-bold">{bestDaily} WPM</span>
              </span>
            )}
          </div>
          <button
            onClick={() => onStart(challenge.config)}
            className={`px-5 py-2 rounded-lg text-sm font-bold tracking-wider transition-all cursor-pointer
              ${completed
                ? 'bg-surface-600 text-text-secondary hover:bg-surface-500'
                : 'bg-neon-pink text-white shadow-[0_0_20px_rgba(255,45,149,0.3)] hover:shadow-[0_0_30px_rgba(255,45,149,0.5)]'
              }`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {completed ? 'RETRY' : 'PLAY'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
