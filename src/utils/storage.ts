// ── LocalStorage Manager ──
import type { StoredData, GameRun, UserSettings, DailyChallengeData } from '../types';
import { DEFAULT_SETTINGS } from '../types';

const STORAGE_KEY = 'neontype_data';
const MAX_RUNS = 20;

function getDefaultData(): StoredData {
  return {
    bestScores: {},
    runs: [],
    settings: { ...DEFAULT_SETTINGS },
    dailyChallengeHistory: {},
    lastDailyChallengeDate: '',
    streakCount: 0,
    bestDailyScore: 0,
    ghostRun: null,
  };
}

export function loadData(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultData();
    return { ...getDefaultData(), ...JSON.parse(raw) };
  } catch {
    return getDefaultData();
  }
}

function saveData(data: StoredData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function saveRun(run: GameRun): void {
  const data = loadData();
  data.runs.unshift(run);
  if (data.runs.length > MAX_RUNS) data.runs = data.runs.slice(0, MAX_RUNS);

  // Update best score
  const key = `${run.config.mode}-${run.config.timer}`;
  if (!data.bestScores[key] || run.stats.wpm > data.bestScores[key]) {
    data.bestScores[key] = run.stats.wpm;
  }

  // Store ghost run (latest)
  data.ghostRun = run;

  saveData(data);
}

export function getSettings(): UserSettings {
  return loadData().settings;
}

export function saveSettings(settings: UserSettings): void {
  const data = loadData();
  data.settings = settings;
  saveData(data);
}

export function getBestScore(mode: string, timer: number): number {
  const data = loadData();
  return data.bestScores[`${mode}-${timer}`] || 0;
}

export function getRuns(): GameRun[] {
  return loadData().runs;
}

export function getGhostRun(): GameRun | null {
  return loadData().ghostRun;
}

// ── Daily Challenge ──

export function getDailyChallenge(date: string): DailyChallengeData | null {
  const data = loadData();
  return data.dailyChallengeHistory[date] || null;
}

export function saveDailyChallenge(challenge: DailyChallengeData): void {
  const data = loadData();
  data.dailyChallengeHistory[challenge.date] = challenge;
  data.lastDailyChallengeDate = challenge.date;

  // Update streak
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  if (challenge.completed) {
    if (data.lastDailyChallengeDate === yesterdayStr || data.streakCount === 0) {
      data.streakCount += 1;
    }
    if (challenge.score && challenge.score > data.bestDailyScore) {
      data.bestDailyScore = challenge.score;
    }
  }

  saveData(data);
}

export function getStreak(): number {
  return loadData().streakCount;
}

export function getBestDailyScore(): number {
  return loadData().bestDailyScore;
}
