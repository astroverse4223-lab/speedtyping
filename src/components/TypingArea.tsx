// ── Typing Area ──
import { useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { GameMode } from '../types';
import { SeededRNG } from '../utils/rng';
import { glitchWord } from '../utils/textgen';

interface TypingAreaProps {
  words: string[];
  currentWordIndex: number;
  currentCharIndex: number;
  typedChars: Map<string, 'correct' | 'incorrect'>;
  input: string;
  mode: GameMode;
  bossWordIndices: number[];
  overdrive: boolean;
  seed: number;
}

export function TypingArea({
  words,
  currentWordIndex,
  currentCharIndex,
  typedChars,
  input,
  mode,
  bossWordIndices,
  overdrive,
  seed,
}: TypingAreaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  // Scroll active word into view
  useEffect(() => {
    if (activeWordRef.current && containerRef.current) {
      const container = containerRef.current;
      const activeWord = activeWordRef.current;
      const containerRect = container.getBoundingClientRect();
      const wordRect = activeWord.getBoundingClientRect();

      if (wordRect.top < containerRect.top || wordRect.bottom > containerRect.bottom) {
        activeWord.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }, [currentWordIndex]);

  // Generate glitch display words
  const glitchDisplayWords = useMemo(() => {
    if (mode !== 'glitch') return {};
    const map: Record<number, string> = {};
    const rng = new SeededRNG(seed + 9999);
    for (let i = 0; i < words.length; i++) {
      if (rng.next() < 0.15) {
        map[i] = glitchWord(words[i], rng);
      }
    }
    return map;
  }, [words, mode, seed]);

  // Visible word range (show ~3 lines around the current word)
  const visibleStart = Math.max(0, currentWordIndex - 15);
  const visibleEnd = Math.min(words.length, currentWordIndex + 50);
  const visibleWords = words.slice(visibleStart, visibleEnd);

  return (
    <div
      ref={containerRef}
      className={`w-full max-h-[200px] overflow-hidden relative rounded-xl p-6
        ${overdrive
          ? 'bg-surface-800/80 shadow-[0_0_60px_rgba(0,240,255,0.15),inset_0_0_60px_rgba(0,240,255,0.05)]'
          : 'bg-surface-800/60'
        }`}
      style={{ fontSize: '1.5rem', lineHeight: '2.2rem' }}
    >
      <div className="flex flex-wrap gap-x-3 gap-y-1 select-none">
        {visibleWords.map((word, vi) => {
          const wordIdx = visibleStart + vi;
          const isActive = wordIdx === currentWordIndex;
          const isPast = wordIdx < currentWordIndex;
          const isBoss = bossWordIndices.includes(wordIdx);
          const isGlitched = mode === 'glitch' && glitchDisplayWords[wordIdx] && !isActive && !isPast;
          const displayWord = isGlitched ? glitchDisplayWords[wordIdx] : word;

          return (
            <span
              key={wordIdx}
              ref={isActive ? activeWordRef : undefined}
              className={`relative inline-block transition-opacity duration-200
                ${isPast ? 'opacity-40' : ''}
                ${isBoss && !isPast ? 'font-bold' : ''}
              `}
            >
              {isBoss && !isPast && (
                <span className="absolute -top-4 left-0 text-[8px] text-neon-red tracking-wider font-bold uppercase opacity-80">
                  BOSS
                </span>
              )}
              {[...displayWord].map((char, ci) => {
                const key = `${wordIdx}-${ci}`;
                const result = typedChars.get(key);
                const isCaret = isActive && ci === currentCharIndex;

                let color = 'text-text-secondary';
                if (result === 'correct') color = 'text-neon-green';
                if (result === 'incorrect') color = 'text-neon-red';
                if (isBoss && !result) color = 'text-neon-orange';
                if (isGlitched) color = 'text-neon-purple opacity-80';

                return (
                  <span key={ci} className={`relative ${color} transition-colors duration-75`}>
                    {isCaret && (
                      <motion.span
                        layoutId="caret"
                        className="absolute -left-[1px] top-0 w-[2px] h-full bg-neon-cyan caret-blink"
                        style={{
                          boxShadow: overdrive
                            ? '0 0 8px rgba(0, 240, 255, 0.8), 0 0 20px rgba(0, 240, 255, 0.4)'
                            : '0 0 4px rgba(0, 240, 255, 0.5)'
                        }}
                      />
                    )}
                    {char}
                  </span>
                );
              })}
              {/* Caret at end of word */}
              {isActive && currentCharIndex >= word.length && (
                <span className="relative">
                  <motion.span
                    layoutId="caret"
                    className="absolute left-0 top-0 w-[2px] h-full bg-neon-cyan caret-blink"
                    style={{ boxShadow: '0 0 4px rgba(0, 240, 255, 0.5)' }}
                  />
                </span>
              )}
              {/* Extra typed chars (overflow) */}
              {isActive && input.length > word.length && (
                <span className="text-neon-red/60">
                  {input.slice(word.length)}
                </span>
              )}
            </span>
          );
        })}
      </div>

      {/* Rhythm mode pulse overlay */}
      {mode === 'rhythm' && (
        <div className="absolute inset-0 pointer-events-none rounded-xl border-2 border-neon-pink/10 animate-pulse" />
      )}
    </div>
  );
}
