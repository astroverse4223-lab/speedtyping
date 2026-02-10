// ── Home Page ──
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { GameConfig, GameMode, Theme, TimerOption } from '../types';
import { DEFAULT_DIFFICULTY } from '../types';
import { DailyChallengeCard } from './DailyChallengeCard';
import { getBestScore, getRuns } from '../utils/storage';

interface HomePageProps {
  onStartGame: (config: GameConfig) => void;
  onOpenSettings: () => void;
}

const MODES: { id: GameMode; label: string; desc: string; icon: string }[] = [
  { id: 'classic', label: 'CLASSIC', desc: 'Pure speed. Beat the clock.', icon: '⚡' },
  { id: 'rhythm', label: 'RHYTHM RUN', desc: 'Words drop in beats. Keep the combo.', icon: '🎵' },
  { id: 'glitch', label: 'GLITCH', desc: 'Can you see through the noise?', icon: '👾' },
];

const THEMES: { id: Theme; label: string; color: string }[] = [
  { id: 'cyberpunk', label: 'Cyberpunk', color: 'neon-cyan' },
  { id: 'scifi', label: 'Sci-Fi', color: 'neon-green' },
  { id: 'fantasy', label: 'Fantasy', color: 'neon-purple' },
  { id: 'philosophy', label: 'Philosophy', color: 'neon-yellow' },
];

const TIMERS: TimerOption[] = [15, 30, 60, 120];

export function HomePage({ onStartGame, onOpenSettings }: HomePageProps) {
  const [selectedMode, setSelectedMode] = useState<GameMode>('classic');
  const [selectedTheme, setSelectedTheme] = useState<Theme>('cyberpunk');
  const [selectedTimer, setSelectedTimer] = useState<TimerOption>(30);
  const [bestWpm, setBestWpm] = useState(0);
  const [totalRuns, setTotalRuns] = useState(0);

  useEffect(() => {
    setBestWpm(getBestScore(selectedMode, selectedTimer));
    setTotalRuns(getRuns().length);
  }, [selectedMode, selectedTimer]);

  const handleStart = () => {
    onStartGame({
      mode: selectedMode,
      theme: selectedTheme,
      timer: selectedTimer,
      seed: Date.now(),
      difficulty: { ...DEFAULT_DIFFICULTY },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen flex flex-col items-center px-4 py-8"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-center mb-8"
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-wider text-glow-cyan"
            style={{ fontFamily: 'var(--font-display)' }}>
          NEON<span className="text-neon-pink">TYPE</span>
        </h1>
        <p className="text-text-secondary mt-2 text-sm tracking-[0.3em] uppercase">
          Cyberpunk Typing Arena
        </p>
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex gap-6 mb-8 text-xs text-text-secondary"
      >
        <div className="flex items-center gap-2">
          <span className="text-neon-cyan">●</span>
          <span>Best: <span className="text-text-primary font-bold">{bestWpm || '—'}</span> WPM</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-neon-pink">●</span>
          <span>Runs: <span className="text-text-primary font-bold">{totalRuns}</span></span>
        </div>
        <button
          onClick={onOpenSettings}
          className="flex items-center gap-1 hover:text-neon-cyan transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Settings
        </button>
      </motion.div>

      {/* Daily Challenge */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-2xl mb-8"
      >
        <DailyChallengeCard onStart={onStartGame} />
      </motion.div>

      {/* Mode Selection */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full max-w-2xl mb-6"
      >
        <h2 className="text-xs text-text-secondary uppercase tracking-[0.2em] mb-3">Select Mode</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {MODES.map(mode => (
            <button
              key={mode.id}
              onClick={() => setSelectedMode(mode.id)}
              className={`p-4 rounded-lg text-left transition-all duration-200 cursor-pointer
                ${selectedMode === mode.id
                  ? 'bg-surface-700 neon-border box-glow-cyan'
                  : 'bg-surface-800 border border-surface-600 hover:border-surface-400'
                }`}
            >
              <span className="text-2xl mb-1 block">{mode.icon}</span>
              <span className="font-bold text-sm tracking-wider block"
                    style={{ fontFamily: 'var(--font-display)' }}>
                {mode.label}
              </span>
              <span className="text-xs text-text-secondary mt-1 block">{mode.desc}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Theme Selection */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="w-full max-w-2xl mb-6"
      >
        <h2 className="text-xs text-text-secondary uppercase tracking-[0.2em] mb-3">Theme</h2>
        <div className="flex flex-wrap gap-2">
          {THEMES.map(theme => (
            <button
              key={theme.id}
              onClick={() => setSelectedTheme(theme.id)}
              className={`px-4 py-2 rounded-lg text-sm transition-all duration-200 cursor-pointer
                ${selectedTheme === theme.id
                  ? `bg-surface-700 neon-border text-${theme.color}`
                  : 'bg-surface-800 border border-surface-600 text-text-secondary hover:text-text-primary'
                }`}
            >
              {theme.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Timer Selection */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-2xl mb-8"
      >
        <h2 className="text-xs text-text-secondary uppercase tracking-[0.2em] mb-3">Timer</h2>
        <div className="flex gap-2">
          {TIMERS.map(t => (
            <button
              key={t}
              onClick={() => setSelectedTimer(t)}
              className={`px-5 py-2 rounded-lg text-sm font-mono transition-all duration-200 cursor-pointer
                ${selectedTimer === t
                  ? 'bg-neon-cyan text-surface-900 font-bold'
                  : 'bg-surface-800 border border-surface-600 text-text-secondary hover:text-text-primary'
                }`}
            >
              {t}s
            </button>
          ))}
        </div>
      </motion.div>

      {/* Start Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleStart}
        className="px-12 py-4 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-purple
                   text-surface-900 font-bold text-lg tracking-wider
                   shadow-[0_0_30px_rgba(0,240,255,0.3)] hover:shadow-[0_0_50px_rgba(0,240,255,0.5)]
                   transition-shadow duration-300 cursor-pointer"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        START TYPING
      </motion.button>

      {/* Footer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-[10px] text-text-muted tracking-widest"
      >
        PRESS START TO BEGIN • TAB TO RESTART • ESC TO EXIT
      </motion.p>
    </motion.div>
  );
}
