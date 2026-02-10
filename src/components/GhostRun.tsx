// ── Ghost Run Overlay ──
// Shows a ghost wpm line from a previous run during gameplay
import { useMemo } from 'react';
import type { GameRun } from '../types';

interface GhostRunProps {
  ghostRun: GameRun | null;
  elapsed: number;
}

export function GhostRun({ ghostRun, elapsed }: GhostRunProps) {
  const ghostWpm = useMemo(() => {
    if (!ghostRun?.stats.wpmHistory.length) return null;
    const history = ghostRun.stats.wpmHistory;
    const closest = history.reduce((prev, curr) =>
      Math.abs(curr.time - elapsed) < Math.abs(prev.time - elapsed) ? curr : prev
    );
    return closest.wpm;
  }, [ghostRun, elapsed]);

  if (!ghostWpm) return null;

  return (
    <div className="flex items-center gap-2 text-xs text-text-muted opacity-60">
      <span className="inline-block w-2 h-2 rounded-full bg-neon-purple/50" />
      <span>Ghost: {ghostWpm} WPM</span>
    </div>
  );
}
