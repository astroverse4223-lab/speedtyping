// ── Stats Panel (Real-time) ──
import { motion } from 'framer-motion';
import type { GameStats } from '../types';

interface StatsPanelProps {
  stats: GameStats;
}

export function StatsPanel({ stats }: StatsPanelProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-4xl"
    >
      <div className="flex items-center justify-center gap-6 md:gap-10 py-3 px-4 rounded-xl bg-surface-800/60 border border-surface-600/30">
        <StatItem label="WPM" value={stats.wpm} color="text-neon-cyan" glow />
        <Divider />
        <StatItem label="ACC" value={`${stats.accuracy}%`} color="text-neon-green" />
        <Divider />
        <StatItem label="COMBO" value={stats.combo} color={stats.combo >= 20 ? 'text-neon-pink' : 'text-neon-yellow'} />
        <Divider />
        <StatItem label="ERRORS" value={stats.incorrectChars} color="text-neon-red" />
        <Divider />
        <StatItem label="RAW" value={stats.rawWpm} color="text-text-secondary" />
      </div>

      {/* Keyboard Heatmap */}
      {Object.keys(stats.missedKeys).length > 0 && (
        <div className="mt-3 flex items-center gap-2 justify-center flex-wrap">
          <span className="text-[10px] text-text-muted uppercase tracking-wider">Missed:</span>
          {Object.entries(stats.missedKeys)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([key, count]) => (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs
                           bg-neon-red/10 text-neon-red border border-neon-red/20"
              >
                <span className="font-bold">{key}</span>
                <span className="text-[10px] opacity-60">×{count}</span>
              </span>
            ))}
        </div>
      )}
    </motion.div>
  );
}

function StatItem({ label, value, color, glow }: {
  label: string;
  value: number | string;
  color: string;
  glow?: boolean;
}) {
  return (
    <div className="text-center">
      <div className={`text-xl md:text-2xl font-bold font-mono tabular-nums ${color}
        ${glow ? 'text-glow-cyan' : ''}`}>
        {value}
      </div>
      <div className="text-[9px] text-text-muted tracking-[0.15em] uppercase mt-0.5">{label}</div>
    </div>
  );
}

function Divider() {
  return <div className="w-px h-8 bg-surface-600/50" />;
}
