// ── Sound Engine (Web Audio API) ──

class SoundEngine {
  private ctx: AudioContext | null = null;
  private volume = 0.5;
  private enabled = true;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
    }
    return this.ctx;
  }

  setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
  }

  setEnabled(e: boolean) {
    this.enabled = e;
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', vol?: number) {
    if (!this.enabled) return;
    const ctx = this.getCtx();
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, ctx.currentTime);

    const v = (vol ?? this.volume) * 0.15;
    gain.gain.setValueAtTime(v, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }

  keypress() {
    const freq = 800 + Math.random() * 400;
    this.playTone(freq, 0.05, 'sine', this.volume * 0.3);
  }

  error() {
    this.playTone(200, 0.15, 'sawtooth', this.volume * 0.4);
  }

  comboUp() {
    this.playTone(1200, 0.08, 'sine');
    setTimeout(() => this.playTone(1600, 0.08, 'sine'), 60);
  }

  overdrive() {
    this.playTone(600, 0.3, 'square', this.volume * 0.3);
    setTimeout(() => this.playTone(900, 0.2, 'square', this.volume * 0.2), 100);
    setTimeout(() => this.playTone(1200, 0.15, 'square', this.volume * 0.15), 200);
  }

  bossWord() {
    this.playTone(150, 0.4, 'sawtooth', this.volume * 0.5);
    setTimeout(() => this.playTone(200, 0.3, 'sawtooth', this.volume * 0.4), 200);
  }

  bossDefeat() {
    [0, 80, 160, 240].forEach((delay, i) => {
      setTimeout(() => this.playTone(800 + i * 200, 0.15, 'sine'), delay);
    });
  }

  finish() {
    [0, 100, 200, 300, 400].forEach((delay, i) => {
      setTimeout(() => this.playTone(600 + i * 150, 0.2, 'triangle'), delay);
    });
  }
}

export const soundEngine = new SoundEngine();
