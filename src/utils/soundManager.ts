/**
 * SoundManager — Synthesized Micro-Interactions via Web Audio API
 * Zero external audio dependencies, zero latency, autoplay-compliant.
 * Creates very subtle, calm, study-friendly acoustic feedback.
 */

export type SoundEvent =
  | 'buttonClick'
  | 'click'
  | 'navigation'
  | 'taskCompleted'
  | 'conceptCompleted'
  | 'milestone'
  | 'error';

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private volume: number = 0.35; // 0.0 - 1.0 (defaults to 35%)
  private initialized: boolean = false;

  constructor() {
    // Read saved preferences from localStorage if available
    try {
      if (typeof window !== 'undefined') {
        const savedEnabled = localStorage.getItem('bholenath_sound_enabled');
        if (savedEnabled !== null) {
          this.enabled = savedEnabled === 'true';
        }
        const savedVolume = localStorage.getItem('bholenath_sound_volume');
        if (savedVolume !== null) {
          const parsed = parseInt(savedVolume, 10);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 100) {
            this.volume = parsed / 100;
          }
        }
      }
    } catch {
      // ignore
    }
  }

  /**
   * Lazily initialize AudioContext on user interaction to comply with browser autoplay policies
   */
  private initContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    try {
      localStorage.setItem('bholenath_sound_enabled', String(enabled));
    } catch {
      // ignore
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setVolume(vol0to100: number) {
    const clamped = Math.max(0, Math.min(100, vol0to100));
    this.volume = clamped / 100;
    try {
      localStorage.setItem('bholenath_sound_volume', String(clamped));
    } catch {
      // ignore
    }
  }

  public getVolume(): number {
    return Math.round(this.volume * 100);
  }

  /**
   * Plays a synthesized sound event
   */
  public play(event: SoundEvent) {
    if (!this.enabled || this.volume <= 0) return;

    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const masterGain = ctx.createGain();
      // Keep master gain very soft to maintain quiet, calm studio feel
      masterGain.gain.setValueAtTime(this.volume * 0.15, now);
      masterGain.connect(ctx.destination);

      switch (event) {
        case 'click':
        case 'buttonClick': {
          // Very soft UI click: 1200Hz micro-click with exponential decay
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1200, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.025);

          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 0.03);
          break;
        }

        case 'navigation': {
          // Subtle page transition sound: gentle 400Hz to 520Hz glide
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(380, now);
          osc.frequency.exponentialRampToValueAtTime(520, now + 0.07);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 0.075);
          break;
        }

        case 'taskCompleted': {
          // Soft success sound: gentle two-tone chime (E5 -> B5)
          const notes = [659.25, 987.77];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = now + idx * 0.08;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.3, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.18);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(start);
            osc.stop(start + 0.2);
          });
          break;
        }

        case 'conceptCompleted': {
          // Slightly more satisfying warm triad chord: C5 -> E5 -> G5
          const notes = [523.25, 659.25, 783.99];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = now + idx * 0.06;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.35, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.26);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(start);
            osc.stop(start + 0.28);
          });
          break;
        }

        case 'milestone': {
          // Special milestone / streak sound: 4-note ascending celestial chime
          const notes = [523.25, 659.25, 783.99, 1046.50];
          notes.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = now + idx * 0.07;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, start);

            gain.gain.setValueAtTime(0.4, start);
            gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

            osc.connect(gain);
            gain.connect(masterGain);

            osc.start(start);
            osc.stop(start + 0.38);
          });
          break;
        }

        case 'error': {
          // Very subtle soft low dual blip
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.linearRampToValueAtTime(140, now + 0.1);

          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

          osc.connect(gain);
          gain.connect(masterGain);

          osc.start(now);
          osc.stop(now + 0.11);
          break;
        }
      }
    } catch (err) {
      // Quiet fail if browser forbids
    }
  }
}

export const soundManager = new SoundManager();
