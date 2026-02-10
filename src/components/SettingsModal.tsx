// ── Settings Modal ──
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { UserSettings } from '../types';
import { getSettings, saveSettings } from '../utils/storage';
import { soundEngine } from '../utils/sound';

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const [settings, setSettings] = useState<UserSettings>(getSettings());

  const update = (partial: Partial<UserSettings>) => {
    const newSettings = { ...settings, ...partial };
    setSettings(newSettings);
    saveSettings(newSettings);

    // Sync sound engine
    soundEngine.setEnabled(newSettings.soundEnabled);
    soundEngine.setVolume(newSettings.volume);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-md mx-4 rounded-xl bg-surface-800 border border-surface-500 p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
            SETTINGS
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-5">
          {/* Sound section */}
          <div>
            <h3 className="text-xs text-text-secondary uppercase tracking-[0.2em] mb-3">Sound</h3>
            <div className="space-y-3">
              <Toggle
                label="Sound Enabled"
                value={settings.soundEnabled}
                onChange={v => update({ soundEnabled: v })}
              />
              <Toggle
                label="Keypress Sounds"
                value={settings.keypressSounds}
                onChange={v => update({ keypressSounds: v })}
              />
              <Toggle
                label="Error Sound"
                value={settings.errorSound}
                onChange={v => update({ errorSound: v })}
              />
              <Toggle
                label="Ambient Synth"
                value={settings.ambientSound}
                onChange={v => update({ ambientSound: v })}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-primary">Volume</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(settings.volume * 100)}
                  onChange={e => update({ volume: Number(e.target.value) / 100 })}
                  className="w-32 accent-neon-cyan"
                />
              </div>
            </div>
          </div>

          {/* Display section */}
          <div>
            <h3 className="text-xs text-text-secondary uppercase tracking-[0.2em] mb-3">Display</h3>
            <div className="space-y-3">
              <Toggle
                label="Smooth Caret"
                value={settings.smoothCaret}
                onChange={v => update({ smoothCaret: v })}
              />
              <Toggle
                label="Keyboard Heatmap"
                value={settings.showKeyboardHeatmap}
                onChange={v => update({ showKeyboardHeatmap: v })}
              />
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-primary">Font Size</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => update({ fontSize: Math.max(16, settings.fontSize - 2) })}
                    className="w-7 h-7 rounded bg-surface-600 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    −
                  </button>
                  <span className="text-sm font-mono w-8 text-center">{settings.fontSize}</span>
                  <button
                    onClick={() => update({ fontSize: Math.min(40, settings.fontSize + 2) })}
                    className="w-7 h-7 rounded bg-surface-600 text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-primary">Caret Style</span>
                <div className="flex gap-1">
                  {(['line', 'block', 'underline'] as const).map(style => (
                    <button
                      key={style}
                      onClick={() => update({ caretStyle: style })}
                      className={`px-3 py-1 rounded text-xs transition-all cursor-pointer
                        ${settings.caretStyle === style
                          ? 'bg-neon-cyan text-surface-900 font-bold'
                          : 'bg-surface-600 text-text-secondary hover:text-text-primary'
                        }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Toggle({ label, value, onChange }: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-text-primary">{label}</span>
      <button
        onClick={() => onChange(!value)}
        className={`w-10 h-5 rounded-full transition-all duration-200 relative cursor-pointer
          ${value ? 'bg-neon-cyan' : 'bg-surface-500'}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200
            ${value ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  );
}
