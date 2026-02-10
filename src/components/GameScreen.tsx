// ── Game Screen ──
import { useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { GameConfig, GameStats } from '../types';
import { useGameEngine } from '../hooks/useGameEngine';
import { TypingArea } from './TypingArea';
import { StatsPanel } from './StatsPanel';
import { ComboMeter } from './ComboMeter';
import { saveRun, getGhostRun } from '../utils/storage';
import { saveDailyChallenge } from '../utils/storage';
import { GhostRun } from './GhostRun';
import { getRankTier } from '../utils/dailyChallenge';
import { todayString } from '../utils/rng';

interface GameScreenProps {
  config: GameConfig;
  onFinish: (stats: GameStats) => void;
  onBack: () => void;
}

export function GameScreen({ config, onFinish, onBack }: GameScreenProps) {
  const { state, handleInput, resetGame } = useGameEngine(config);
  const containerRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);
  const ghostRun = useMemo(() => getGhostRun(), []);
  const elapsed = config.timer - state.timeLeft;

  // Focus container for keyboard input
  useEffect(() => {
    containerRef.current?.focus();
  }, []);

  // Handle game finish
  useEffect(() => {
    if (state.status === 'finished' && !finishedRef.current) {
      finishedRef.current = true;

      // Save run
      const run = {
        id: crypto.randomUUID(),
        config,
        stats: state.stats,
        timestamp: Date.now(),
        isDaily: false,
      };
      saveRun(run);

      // Check if this is a daily challenge
      const today = todayString();
      const seed = config.seed;
      // Simple heuristic: if seed matches today's date seed
      saveDailyChallenge({
        date: today,
        config,
        completed: true,
        score: state.stats.wpm,
        stats: state.stats,
        rankTier: getRankTier(state.stats.wpm),
      });

      setTimeout(() => onFinish(state.stats), 500);
    }
  }, [state.status, state.stats, config, onFinish]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onBack();
      return;
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      finishedRef.current = false;
      resetGame();
      return;
    }
    if (state.status === 'finished') return;

    e.preventDefault();
    if (e.key === 'Backspace') {
      handleInput('Backspace');
    } else if (e.key === ' ') {
      handleInput(' ');
    } else if (e.key.length === 1) {
      handleInput(e.key);
    }
  }, [handleInput, resetGame, onBack, state.status]);

  const modeLabel = useMemo(() => {
    switch (config.mode) {
      case 'rhythm': return 'RHYTHM RUN';
      case 'glitch': return 'GLITCH';
      default: return 'CLASSIC';
    }
  }, [config.mode]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="min-h-screen flex flex-col items-center px-4 py-6 outline-none"
    >
      {/* Top bar */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="text-text-secondary hover:text-neon-cyan transition-colors text-sm cursor-pointer flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          ESC
        </button>

        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-[0.2em] text-text-secondary uppercase px-2 py-1 rounded bg-surface-800 border border-surface-600">
            {modeLabel}
          </span>
          <span className="text-[10px] tracking-[0.2em] text-text-secondary uppercase px-2 py-1 rounded bg-surface-800 border border-surface-600">
            {config.theme}
          </span>
        </div>

        {/* Timer */}
        <div className={`text-3xl font-bold font-mono tabular-nums transition-colors
          ${state.timeLeft <= 5 ? 'text-neon-red animate-pulse' :
            state.timeLeft <= 10 ? 'text-neon-orange' : 'text-neon-cyan text-glow-cyan'}`}>
          {state.timeLeft}
        </div>
      </div>

      {/* Combo meter */}
      <ComboMeter combo={state.stats.combo} overdrive={state.overdriveActive} />

      {/* Typing area */}
      <div className="w-full max-w-4xl flex-1 flex items-center justify-center mb-8">
        <TypingArea
          words={state.words}
          currentWordIndex={state.currentWordIndex}
          currentCharIndex={state.currentCharIndex}
          typedChars={state.typedChars}
          input={state.input}
          mode={config.mode}
          bossWordIndices={state.bossWordIndices}
          overdrive={state.overdriveActive}
          seed={config.seed}
        />
      </div>

      {/* Stats panel */}
      <StatsPanel stats={state.stats} />

      {/* Ghost run indicator */}
      {state.status === 'running' && ghostRun && (
        <div className="mt-2">
          <GhostRun ghostRun={ghostRun} elapsed={elapsed} />
        </div>
      )}

      {/* Idle message */}
      {state.status === 'idle' && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-text-muted text-sm mt-4 animate-pulse-neon"
        >
          Start typing to begin...
        </motion.p>
      )}
    </motion.div>
  );
}
