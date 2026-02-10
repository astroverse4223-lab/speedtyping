// ── Daily Challenge Generator ──
import { dateSeed, todayString } from './rng';
import type { DailyChallengeData, GameConfig, GameMode, Theme, TimerOption } from '../types';
import { DEFAULT_DIFFICULTY } from '../types';
import { getDailyChallenge } from './storage';
import { SeededRNG } from './rng';

const MODES: GameMode[] = ['classic', 'rhythm', 'glitch'];
const THEMES: Theme[] = ['cyberpunk', 'scifi', 'fantasy', 'philosophy'];
const TIMERS: TimerOption[] = [30, 60, 120];

export function generateDailyChallenge(date?: string): DailyChallengeData {
  const d = date || todayString();

  // Check if already generated
  const existing = getDailyChallenge(d);
  if (existing) return existing;

  const seed = dateSeed(d);
  const rng = new SeededRNG(seed);

  const mode = rng.pick(MODES);
  const theme = rng.pick(THEMES);
  const timer = rng.pick(TIMERS);

  const config: GameConfig = {
    mode,
    theme,
    timer,
    seed,
    difficulty: {
      ...DEFAULT_DIFFICULTY,
      punctuationLevel: 0.15 + rng.next() * 0.35,
      numbersEnabled: rng.next() > 0.6,
      rareLetterBias: 0.1 + rng.next() * 0.3,
      wordLengthBias: 0.3 + rng.next() * 0.4,
    },
  };

  return {
    date: d,
    config,
    completed: false,
    score: null,
    stats: null,
    rankTier: null,
  };
}

export function getTimeUntilNextChallenge(): { hours: number; minutes: number; seconds: number } {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const diff = tomorrow.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { hours, minutes, seconds };
}

export function getRankTier(wpm: number): 'bronze' | 'silver' | 'gold' | 'neon' {
  if (wpm >= 120) return 'neon';
  if (wpm >= 80) return 'gold';
  if (wpm >= 50) return 'silver';
  return 'bronze';
}

export function getRankColor(tier: string): string {
  switch (tier) {
    case 'neon': return '#00f0ff';
    case 'gold': return '#ffe600';
    case 'silver': return '#c0c0c0';
    default: return '#cd7f32';
  }
}
