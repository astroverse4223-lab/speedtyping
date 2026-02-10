// ── Types for Neon Type ──

export type GameMode = 'classic' | 'rhythm' | 'glitch';
export type Theme = 'cyberpunk' | 'scifi' | 'fantasy' | 'philosophy';
export type TimerOption = 15 | 30 | 60 | 120;
export type RankTier = 'bronze' | 'silver' | 'gold' | 'neon';

export interface DifficultyConfig {
  punctuationLevel: number; // 0-1
  numbersEnabled: boolean;
  rareLetterBias: number; // 0-1
  wordLengthBias: number; // 0 = short, 1 = long
}

export interface GameConfig {
  mode: GameMode;
  theme: Theme;
  timer: TimerOption;
  difficulty: DifficultyConfig;
  seed: number;
}

export interface CharResult {
  char: string;
  typed: string | null;
  correct: boolean | null;
  timestamp: number | null;
}

export interface WordResult {
  word: string;
  typed: string;
  correct: boolean;
  isBossWord: boolean;
  startTime: number;
  endTime: number;
}

export interface WpmSnapshot {
  time: number;
  wpm: number;
  raw: number;
}

export interface GameStats {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  correctChars: number;
  incorrectChars: number;
  totalChars: number;
  combo: number;
  maxCombo: number;
  overdrive: boolean;
  overdriveCount: number;
  wpmHistory: WpmSnapshot[];
  missedKeys: Record<string, number>;
  wordResults: WordResult[];
  elapsedTime: number;
  bossWordsDefeated: number;
}

export interface GameRun {
  id: string;
  config: GameConfig;
  stats: GameStats;
  timestamp: number;
  isDaily: boolean;
}

export interface DailyChallengeData {
  date: string; // YYYY-MM-DD
  config: GameConfig;
  completed: boolean;
  score: number | null;
  stats: GameStats | null;
  rankTier: RankTier | null;
}

export interface DailyChallengeHistory {
  [date: string]: DailyChallengeData;
}

export interface UserSettings {
  soundEnabled: boolean;
  keypressSounds: boolean;
  errorSound: boolean;
  ambientSound: boolean;
  volume: number; // 0-1
  showKeyboardHeatmap: boolean;
  smoothCaret: boolean;
  fontSize: number;
  caretStyle: 'line' | 'block' | 'underline';
}

export interface StoredData {
  bestScores: Record<string, number>; // mode-timer -> wpm
  runs: GameRun[];
  settings: UserSettings;
  dailyChallengeHistory: DailyChallengeHistory;
  lastDailyChallengeDate: string;
  streakCount: number;
  bestDailyScore: number;
  ghostRun: GameRun | null;
}

export const DEFAULT_SETTINGS: UserSettings = {
  soundEnabled: true,
  keypressSounds: true,
  errorSound: true,
  ambientSound: false,
  volume: 0.5,
  showKeyboardHeatmap: true,
  smoothCaret: true,
  fontSize: 24,
  caretStyle: 'line',
};

export const DEFAULT_DIFFICULTY: DifficultyConfig = {
  punctuationLevel: 0.2,
  numbersEnabled: false,
  rareLetterBias: 0.1,
  wordLengthBias: 0.4,
};
