// ── Main App ──
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { GameConfig, GameStats } from './types';
import { DEFAULT_DIFFICULTY } from './types';
import { HomePage } from './components/HomePage';
import { GameScreen } from './components/GameScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { SettingsModal } from './components/SettingsModal';
import { Background } from './components/Background';

type Page = 'home' | 'game' | 'results';

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [config, setConfig] = useState<GameConfig>({
    mode: 'classic',
    theme: 'cyberpunk',
    timer: 30,
    seed: Date.now(),
    difficulty: { ...DEFAULT_DIFFICULTY },
  });
  const [lastStats, setLastStats] = useState<GameStats | null>(null);
  const [lastConfig, setLastConfig] = useState<GameConfig>(config);
  const [showSettings, setShowSettings] = useState(false);

  const handleStartGame = (gameConfig: GameConfig) => {
    setConfig({ ...gameConfig, seed: gameConfig.seed || Date.now() });
    setLastConfig(gameConfig);
    setPage('game');
  };

  const handleGameEnd = (stats: GameStats) => {
    setLastStats(stats);
    setPage('results');
  };

  const handleRestart = () => {
    setConfig(prev => ({ ...prev, seed: Date.now() }));
    setPage('game');
  };

  const handleRetry = () => {
    // Same seed — replay
    setPage('game');
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <Background />

      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {page === 'home' && (
            <HomePage
              key="home"
              onStartGame={handleStartGame}
              onOpenSettings={() => setShowSettings(true)}
            />
          )}
          {page === 'game' && (
            <GameScreen
              key="game"
              config={config}
              onFinish={handleGameEnd}
              onBack={() => setPage('home')}
            />
          )}
          {page === 'results' && lastStats && (
            <ResultsScreen
              key="results"
              stats={lastStats}
              config={lastConfig}
              onRestart={handleRestart}
              onRetry={handleRetry}
              onHome={() => setPage('home')}
            />
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showSettings && (
          <SettingsModal onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
