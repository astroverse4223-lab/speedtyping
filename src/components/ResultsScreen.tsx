// ── Results Screen ──
import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Area, AreaChart } from 'recharts';
import type { GameConfig, GameStats } from '../types';
import { getRankTier, getRankColor } from '../utils/dailyChallenge';

interface ResultsScreenProps {
  stats: GameStats;
  config: GameConfig;
  onRestart: () => void;
  onRetry: () => void;
  onHome: () => void;
}

export function ResultsScreen({ stats, config, onRestart, onRetry, onHome }: ResultsScreenProps) {
  const rank = getRankTier(stats.wpm);
  const rankColor = getRankColor(rank);

  const chartData = useMemo(() => {
    return stats.wpmHistory.map(s => ({
      time: Math.round(s.time),
      WPM: s.wpm,
      Raw: s.raw,
    }));
  }, [stats.wpmHistory]);

  const wrongWords = useMemo(() => {
    return stats.wordResults.filter(w => !w.correct).slice(0, 8);
  }, [stats.wordResults]);

  const handleShare = () => {
    const text = `🎮 NEON TYPE\n⚡ ${stats.wpm} WPM | 🎯 ${stats.accuracy}% ACC\n🏆 Rank: ${rank.toUpperCase()}\n🔥 Max Combo: ${stats.maxCombo}x\nMode: ${config.mode} | ${config.timer}s`;
    navigator.clipboard.writeText(text).then(() => {
      alert('Copied to clipboard!');
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
      {/* Rank Badge */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="mb-6"
      >
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center border-2"
          style={{
            borderColor: rankColor,
            boxShadow: `0 0 30px ${rankColor}40, 0 0 60px ${rankColor}20`,
          }}
        >
          <span className="text-3xl font-bold uppercase tracking-wider"
                style={{ color: rankColor, fontFamily: 'var(--font-display)' }}>
            {rank === 'neon' ? '⚡' : rank.charAt(0).toUpperCase()}
          </span>
        </div>
        <p className="text-center mt-2 text-xs uppercase tracking-[0.2em] font-bold"
           style={{ color: rankColor }}>
          {rank}
        </p>
      </motion.div>

      {/* Main Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl mb-8"
      >
        <ResultStat label="WPM" value={stats.wpm} color="text-neon-cyan" big />
        <ResultStat label="Accuracy" value={`${stats.accuracy}%`} color="text-neon-green" big />
        <ResultStat label="Raw WPM" value={stats.rawWpm} color="text-text-secondary" />
        <ResultStat label="Max Combo" value={`${stats.maxCombo}x`} color="text-neon-yellow" />
        <ResultStat label="Correct" value={stats.correctChars} color="text-neon-green" />
        <ResultStat label="Errors" value={stats.incorrectChars} color="text-neon-red" />
        <ResultStat label="Boss Words" value={stats.bossWordsDefeated} color="text-neon-orange" />
        <ResultStat label="Overdrives" value={stats.overdriveCount} color="text-neon-pink" />
      </motion.div>

      {/* WPM Graph */}
      {chartData.length > 1 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-2xl mb-8 p-4 rounded-xl bg-surface-800/60 neon-border"
        >
          <h3 className="text-xs text-text-secondary uppercase tracking-[0.2em] mb-3"
              style={{ fontFamily: 'var(--font-display)' }}>
            Performance
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00f0ff" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#00f0ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#232338" />
              <XAxis
                dataKey="time"
                tick={{ fill: '#555577', fontSize: 10 }}
                axisLine={{ stroke: '#232338' }}
                label={{ value: 'seconds', position: 'bottom', fill: '#555577', fontSize: 10 }}
              />
              <YAxis
                tick={{ fill: '#555577', fontSize: 10 }}
                axisLine={{ stroke: '#232338' }}
              />
              <Tooltip
                contentStyle={{
                  background: '#10101a',
                  border: '1px solid rgba(0,240,255,0.3)',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                labelStyle={{ color: '#8888aa' }}
              />
              <Area
                type="monotone"
                dataKey="WPM"
                stroke="#00f0ff"
                strokeWidth={2}
                fill="url(#wpmGrad)"
              />
              <Line
                type="monotone"
                dataKey="Raw"
                stroke="#555577"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Mistake breakdown */}
      {wrongWords.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-2xl mb-8 p-4 rounded-xl bg-surface-800/60 neon-border"
        >
          <h3 className="text-xs text-text-secondary uppercase tracking-[0.2em] mb-3"
              style={{ fontFamily: 'var(--font-display)' }}>
            Mistakes
          </h3>
          <div className="flex flex-wrap gap-2">
            {wrongWords.map((w, i) => (
              <div key={i} className="px-3 py-1.5 rounded-lg bg-surface-700 border border-surface-500 text-sm">
                <span className="text-neon-red line-through opacity-60">{w.typed}</span>
                <span className="mx-1.5 text-text-muted">→</span>
                <span className="text-neon-green">{w.word}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Missed keys heatmap */}
      {Object.keys(stats.missedKeys).length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="w-full max-w-2xl mb-8 p-4 rounded-xl bg-surface-800/60 neon-border"
        >
          <h3 className="text-xs text-text-secondary uppercase tracking-[0.2em] mb-3"
              style={{ fontFamily: 'var(--font-display)' }}>
            Key Heatmap
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(stats.missedKeys)
              .sort(([, a], [, b]) => b - a)
              .map(([key, count]) => {
                const intensity = Math.min(count / 5, 1);
                return (
                  <div
                    key={key}
                    className="w-10 h-10 rounded-lg flex flex-col items-center justify-center text-xs font-bold"
                    style={{
                      background: `rgba(255, 0, 60, ${0.1 + intensity * 0.4})`,
                      border: `1px solid rgba(255, 0, 60, ${0.2 + intensity * 0.3})`,
                      color: `rgba(255, ${Math.round(200 - intensity * 200)}, ${Math.round(200 - intensity * 200)}, 1)`,
                    }}
                  >
                    <span className="text-sm">{key}</span>
                    <span className="text-[8px] opacity-60">{count}</span>
                  </div>
                );
              })}
          </div>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex flex-wrap gap-3 justify-center"
      >
        <button
          onClick={onRetry}
          className="px-6 py-3 rounded-lg bg-surface-700 border border-surface-500
                     text-text-primary hover:border-neon-cyan hover:text-neon-cyan
                     transition-all text-sm font-bold tracking-wider cursor-pointer"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          RETRY (SAME SEED)
        </button>
        <button
          onClick={onRestart}
          className="px-6 py-3 rounded-lg bg-neon-cyan text-surface-900
                     hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]
                     transition-all text-sm font-bold tracking-wider cursor-pointer"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          NEW RUN
        </button>
        <button
          onClick={handleShare}
          className="px-6 py-3 rounded-lg bg-surface-700 border border-neon-pink/30
                     text-neon-pink hover:bg-neon-pink/10
                     transition-all text-sm font-bold tracking-wider cursor-pointer"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          SHARE
        </button>
        <button
          onClick={onHome}
          className="px-6 py-3 rounded-lg bg-surface-800 border border-surface-600
                     text-text-secondary hover:text-text-primary
                     transition-all text-sm tracking-wider cursor-pointer"
        >
          HOME
        </button>
      </motion.div>

      {/* Seed */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-6 text-[10px] text-text-muted font-mono"
      >
        Seed: {config.seed}
      </motion.p>
    </motion.div>
  );
}

function ResultStat({ label, value, color, big }: {
  label: string;
  value: number | string;
  color: string;
  big?: boolean;
}) {
  return (
    <div className="text-center p-3 rounded-lg bg-surface-800/40 border border-surface-600/30">
      <div className={`font-bold font-mono tabular-nums ${color} ${big ? 'text-3xl' : 'text-xl'}`}>
        {value}
      </div>
      <div className="text-[9px] text-text-muted tracking-[0.15em] uppercase mt-1">{label}</div>
    </div>
  );
}
