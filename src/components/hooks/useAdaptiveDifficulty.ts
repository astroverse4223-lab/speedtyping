// ── Adaptive Difficulty Hook ──
// Adjusts difficulty based on player performance in real-time
import { useCallback, useRef } from 'react';
import type { DifficultyConfig } from '../../types';

export function useAdaptiveDifficulty(baseDifficulty: DifficultyConfig) {
  const difficultyRef = useRef<DifficultyConfig>({ ...baseDifficulty });
  const recentAccuracyRef = useRef<number[]>([]);

  const updateDifficulty = useCallback((accuracy: number, combo: number) => {
    recentAccuracyRef.current.push(accuracy);
    if (recentAccuracyRef.current.length > 10) {
      recentAccuracyRef.current.shift();
    }

    const avgAccuracy = recentAccuracyRef.current.reduce((a, b) => a + b, 0)
      / recentAccuracyRef.current.length;

    const d = difficultyRef.current;

    // Player is doing very well — ramp up
    if (avgAccuracy > 95 && combo > 15) {
      d.punctuationLevel = Math.min(0.6, d.punctuationLevel + 0.02);
      d.wordLengthBias = Math.min(0.8, d.wordLengthBias + 0.02);
      d.rareLetterBias = Math.min(0.5, d.rareLetterBias + 0.01);
    }
    // Player is struggling — ease off
    else if (avgAccuracy < 80) {
      d.punctuationLevel = Math.max(0.05, d.punctuationLevel - 0.02);
      d.wordLengthBias = Math.max(0.2, d.wordLengthBias - 0.02);
      d.rareLetterBias = Math.max(0.05, d.rareLetterBias - 0.01);
    }

    difficultyRef.current = d;
    return d;
  }, []);

  const getDifficulty = useCallback(() => {
    return { ...difficultyRef.current };
  }, []);

  return { updateDifficulty, getDifficulty };
}
