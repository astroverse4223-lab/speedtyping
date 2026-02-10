// ── Game Engine Hook ──
import { useState, useCallback, useRef, useEffect } from 'react';
import type { GameConfig, GameStats, WpmSnapshot, WordResult } from '../types';
import { generateText } from '../utils/textgen';
import { soundEngine } from '../utils/sound';

export interface GameState {
  status: 'idle' | 'running' | 'finished';
  words: string[];
  bossWordIndices: number[];
  currentWordIndex: number;
  currentCharIndex: number;
  typedChars: Map<string, 'correct' | 'incorrect'>; // "wordIdx-charIdx" -> result
  input: string;
  timeLeft: number;
  stats: GameStats;
  overdriveActive: boolean;
  glitchActiveWord: number | null;
}

const INITIAL_STATS: GameStats = {
  wpm: 0,
  rawWpm: 0,
  accuracy: 100,
  correctChars: 0,
  incorrectChars: 0,
  totalChars: 0,
  combo: 0,
  maxCombo: 0,
  overdrive: false,
  overdriveCount: 0,
  wpmHistory: [],
  missedKeys: {},
  wordResults: [],
  elapsedTime: 0,
  bossWordsDefeated: 0,
};

export function useGameEngine(config: GameConfig) {
  const [state, setState] = useState<GameState>(() => {
    const gen = generateText(config.seed, config.theme, config.difficulty);
    return {
      status: 'idle',
      words: gen.words,
      bossWordIndices: gen.bossWordIndices,
      currentWordIndex: 0,
      currentCharIndex: 0,
      typedChars: new Map(),
      input: '',
      timeLeft: config.timer,
      stats: { ...INITIAL_STATS },
      overdriveActive: false,
      glitchActiveWord: null,
    };
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const wordStartTimeRef = useRef<number>(0);
  const wpmHistoryRef = useRef<WpmSnapshot[]>([]);
  const lastSnapshotRef = useRef<number>(0);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const finishGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    soundEngine.finish();

    setState(prev => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const minutes = elapsed / 60;
      const wpm = minutes > 0 ? Math.round(prev.stats.correctChars / 5 / minutes) : 0;
      const rawWpm = minutes > 0 ? Math.round(prev.stats.totalChars / 5 / minutes) : 0;
      const accuracy = prev.stats.totalChars > 0
        ? Math.round((prev.stats.correctChars / prev.stats.totalChars) * 100)
        : 100;

      return {
        ...prev,
        status: 'finished',
        stats: {
          ...prev.stats,
          wpm,
          rawWpm,
          accuracy,
          elapsedTime: elapsed,
          wpmHistory: wpmHistoryRef.current,
        },
      };
    });
  }, []);

  const startGame = useCallback(() => {
    startTimeRef.current = Date.now();
    wordStartTimeRef.current = Date.now();
    lastSnapshotRef.current = Date.now();
    wpmHistoryRef.current = [];

    setState(prev => ({
      ...prev,
      status: 'running',
      timeLeft: config.timer,
    }));

    timerRef.current = setInterval(() => {
      setState(prev => {
        if (prev.timeLeft <= 1) {
          setTimeout(finishGame, 0);
          return { ...prev, timeLeft: 0 };
        }

        // Record WPM snapshot every second
        const elapsed = (Date.now() - startTimeRef.current) / 1000;
        const minutes = elapsed / 60;
        const wpm = minutes > 0 ? Math.round(prev.stats.correctChars / 5 / minutes) : 0;
        const raw = minutes > 0 ? Math.round(prev.stats.totalChars / 5 / minutes) : 0;

        wpmHistoryRef.current.push({ time: elapsed, wpm, raw });

        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, [config.timer, finishGame]);

  const handleInput = useCallback((char: string) => {
    setState(prev => {
      if (prev.status === 'finished') return prev;
      if (prev.status === 'idle') {
        // Auto-start on first keypress
        setTimeout(startGame, 0);
      }

      const currentWord = prev.words[prev.currentWordIndex];
      if (!currentWord) return prev;

      const newTypedChars = new Map(prev.typedChars);
      let newCorrectChars = prev.stats.correctChars;
      let newIncorrectChars = prev.stats.incorrectChars;
      let newTotalChars = prev.stats.totalChars;
      let newCombo = prev.stats.combo;
      let newMaxCombo = prev.stats.maxCombo;
      let newMissedKeys = { ...prev.stats.missedKeys };
      let newOverdrive = prev.overdriveActive;
      let newOverdriveCount = prev.stats.overdriveCount;
      let newBossDefeated = prev.stats.bossWordsDefeated;

      // Handle space — advance to next word
      if (char === ' ') {
        if (prev.input.length === 0) return prev; // ignore leading space

        const wordResult: WordResult = {
          word: currentWord,
          typed: prev.input,
          correct: prev.input === currentWord,
          isBossWord: prev.bossWordIndices.includes(prev.currentWordIndex),
          startTime: wordStartTimeRef.current,
          endTime: Date.now(),
        };

        if (wordResult.isBossWord && wordResult.correct) {
          newBossDefeated++;
          soundEngine.bossDefeat();
        }

        wordStartTimeRef.current = Date.now();

        // If more words needed, generate more
        let newWords = prev.words;
        if (prev.currentWordIndex >= prev.words.length - 10) {
          const gen = generateText(
            config.seed + prev.currentWordIndex,
            config.theme,
            config.difficulty,
            40
          );
          newWords = [...prev.words, ...gen.words];
        }

        return {
          ...prev,
          words: newWords,
          currentWordIndex: prev.currentWordIndex + 1,
          currentCharIndex: 0,
          input: '',
          stats: {
            ...prev.stats,
            correctChars: newCorrectChars,
            incorrectChars: newIncorrectChars,
            totalChars: newTotalChars,
            combo: newCombo,
            maxCombo: newMaxCombo,
            missedKeys: newMissedKeys,
            wordResults: [...prev.stats.wordResults, wordResult],
            bossWordsDefeated: newBossDefeated,
          },
          overdriveActive: newOverdrive,
        };
      }

      // Handle backspace
      if (char === 'Backspace') {
        if (prev.input.length === 0) return prev;
        const newInput = prev.input.slice(0, -1);
        const delIdx = prev.input.length - 1;
        newTypedChars.delete(`${prev.currentWordIndex}-${delIdx}`);
        return {
          ...prev,
          input: newInput,
          currentCharIndex: delIdx,
          typedChars: newTypedChars,
        };
      }

      // Regular character
      if (char.length !== 1) return prev; // ignore special keys

      const charIdx = prev.input.length;
      const expected = currentWord[charIdx];
      const isCorrect = char === expected;

      newTotalChars++;

      if (isCorrect) {
        newCorrectChars++;
        newCombo++;
        if (newCombo > newMaxCombo) newMaxCombo = newCombo;
        newTypedChars.set(`${prev.currentWordIndex}-${charIdx}`, 'correct');
        soundEngine.keypress();

        // Overdrive at 20+ combo
        if (newCombo >= 20 && !newOverdrive) {
          newOverdrive = true;
          newOverdriveCount++;
          soundEngine.overdrive();
        }

        if (newCombo > 0 && newCombo % 10 === 0) {
          soundEngine.comboUp();
        }
      } else {
        newIncorrectChars++;
        newCombo = 0;
        newOverdrive = false;
        newTypedChars.set(`${prev.currentWordIndex}-${charIdx}`, 'incorrect');
        soundEngine.error();

        // Track missed key
        if (expected) {
          newMissedKeys[expected] = (newMissedKeys[expected] || 0) + 1;
        }
      }

      const newInput = prev.input + char;

      // Calculate live WPM
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const minutes = elapsed / 60;
      const liveWpm = minutes > 0 ? Math.round(newCorrectChars / 5 / minutes) : 0;
      const liveRaw = minutes > 0 ? Math.round(newTotalChars / 5 / minutes) : 0;
      const liveAcc = newTotalChars > 0
        ? Math.round((newCorrectChars / newTotalChars) * 100)
        : 100;

      return {
        ...prev,
        input: newInput,
        currentCharIndex: charIdx + 1,
        typedChars: newTypedChars,
        stats: {
          ...prev.stats,
          wpm: liveWpm,
          rawWpm: liveRaw,
          accuracy: liveAcc,
          correctChars: newCorrectChars,
          incorrectChars: newIncorrectChars,
          totalChars: newTotalChars,
          combo: newCombo,
          maxCombo: newMaxCombo,
          missedKeys: newMissedKeys,
          overdrive: newOverdrive,
          overdriveCount: newOverdriveCount,
        },
        overdriveActive: newOverdrive,
      };
    });
  }, [config, startGame]);

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    const gen = generateText(config.seed, config.theme, config.difficulty);
    wpmHistoryRef.current = [];

    setState({
      status: 'idle',
      words: gen.words,
      bossWordIndices: gen.bossWordIndices,
      currentWordIndex: 0,
      currentCharIndex: 0,
      typedChars: new Map(),
      input: '',
      timeLeft: config.timer,
      stats: { ...INITIAL_STATS },
      overdriveActive: false,
      glitchActiveWord: null,
    });
  }, [config]);

  return {
    state,
    handleInput,
    startGame,
    resetGame,
    finishGame,
  };
}
