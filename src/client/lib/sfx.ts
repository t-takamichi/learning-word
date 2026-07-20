let sharedAudioContext: AudioContext | null = null;

/**
 * Lazily initializes and returns a shared AudioContext instance.
 */
export const getAudioContext = (): AudioContext | null => {
  if (typeof window === 'undefined') return null;
  if (!sharedAudioContext) {
    const AudioContextClass =
      window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      sharedAudioContext = new AudioContextClass();
    }
  }
  return sharedAudioContext;
};

/** True once the shared AudioContext is running (unlocked). */
export const isAudioContextRunning = (): boolean => {
  return sharedAudioContext?.state === 'running';
};

/**
 * True when the page currently has a transient user activation.
 * resume() outside of this window is rejected by Chrome/Safari and pollutes
 * the console with "AudioContext was not allowed to start". Falls back to true
 * on browsers without the userActivation API (Firefox/older Safari), where we
 * assume the caller is already inside a gesture handler.
 */
const hasUserActivation = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = (navigator as Navigator & { userActivation?: { isActive: boolean } }).userActivation;
  return ua ? ua.isActive : true;
};

/**
 * Unlocks the AudioContext. MUST be called synchronously from within a real
 * user gesture handler (Chrome/Safari autoplay policy).
 * Plays a 1-sample silent buffer — the proven trick to force the context to
 * 'running' on Chrome/iOS Safari (resume() alone is unreliable there).
 * Because resume() is async, one call may not flip the state immediately;
 * callers should retry on subsequent gestures until isAudioContextRunning().
 */
export const unlockAudioContext = (): void => {
  // Touch the AudioContext ONLY inside a real user activation. Constructing,
  // resuming, or starting a source node outside a gesture all trigger Chrome's
  // "AudioContext was not allowed to start" warning. The retry loop in
  // StudyPage keeps calling this on every gesture until it succeeds.
  if (!hasUserActivation()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  // Silent-buffer kick: forces 'running' on WebKit/iOS even when resume() alone
  // is ignored. Safe here because we are inside a user gesture.
  try {
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);
  } catch {
    /* ignore — resume() below is the fallback path */
  }
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {
      /* best-effort: a later gesture will retry */
    });
  }
};

/**
 * Introduces subtle pitch fluctuation to avoid repetitive machine-gun effect.
 */
const wobble = (freq: number): number => {
  return freq + (Math.random() - 0.5) * 8; // ±4Hz fluctuation
};

export type SFXId = 'correct' | 'combo' | 'again' | 'flip' | 'complete' | 'tap' | 'undo';

/**
 * Synthesizes and plays a sound effect using Web Audio API oscillators.
 */
export const playSFX = (id: SFXId, volume = 0.35): void => {
  // Never construct/touch the context outside a gesture (avoids the autoplay
  // warning). If it isn't running yet and we have no activation to unlock it,
  // bail before getAudioContext() would lazily create it.
  if (!isAudioContextRunning() && !hasUserActivation()) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  // Suspended but we have activation: kick a resume for next time and skip this
  // sound (scheduling needs a running context).
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
    return;
  }

  const now = ctx.currentTime;
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(volume, now);
  masterGain.connect(ctx.destination);

  const createOscillator = (
    type: OscillatorType,
    freq: number,
    startTime: number,
    duration: number,
    gainEnd = 0.001
  ) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.8, startTime);
    gain.gain.exponentialRampToValueAtTime(gainEnd, startTime + duration);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration);
  };

  switch (id) {
    case 'correct': {
      // C6 (1046.50Hz) -> E6 (1318.51Hz)
      const c6 = wobble(1046.5);
      const e6 = wobble(1318.5);
      createOscillator('triangle', c6, now, 0.12);
      createOscillator('triangle', e6, now + 0.08, 0.22);
      break;
    }
    case 'combo': {
      // E6 (1318.51Hz) -> G6 (1567.98Hz) -> C7 (2093.00Hz)
      const e6 = wobble(1318.5);
      const g6 = wobble(1568.0);
      const c7 = wobble(2093.0);
      createOscillator('triangle', e6, now, 0.1);
      createOscillator('triangle', g6, now + 0.06, 0.12);
      createOscillator('triangle', c7, now + 0.12, 0.3);
      break;
    }
    case 'again': {
      // Gentle soft low A3 (220.00Hz) to C4 (261.63Hz) slide. Extremely gentle.
      const a3 = wobble(220.0);
      const c4 = wobble(261.6);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(a3, now);
      osc.frequency.exponentialRampToValueAtTime(c4, now + 0.22);

      gain.gain.setValueAtTime(0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.22);
      break;
    }
    case 'flip': {
      // A quick 350Hz -> 150Hz frequency slide to mimic a card flip
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(wobble(350), now);
      osc.frequency.exponentialRampToValueAtTime(wobble(150), now + 0.08);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.08);
      break;
    }
    case 'complete': {
      // Arpeggio: C5 (523.25Hz) -> E5 (659.25Hz) -> G5 (783.99Hz) -> C6 (1046.50Hz) -> Chord (C5,E5,G5,C6)
      const c5 = wobble(523.3);
      const e5 = wobble(659.3);
      const g5 = wobble(784.0);
      const c6 = wobble(1046.5);

      // Fast arpeggio
      createOscillator('triangle', c5, now, 0.12);
      createOscillator('triangle', e5, now + 0.08, 0.15);
      createOscillator('triangle', g5, now + 0.16, 0.18);
      createOscillator('triangle', c6, now + 0.24, 0.25);

      // Final chord sustained and faded out within 1.2s total (0.3s -> 1.2s)
      const chord = [c5, e5, g5, c6];
      chord.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + 0.32);

        gain.gain.setValueAtTime(0.3, now + 0.32);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(now + 0.32);
        osc.stop(now + 1.2);
      });
      break;
    }
    case 'tap': {
      // Very short crisp high frequency click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(wobble(900), now);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.03);
      break;
    }
    case 'undo': {
      // A quick 200Hz -> 600Hz sweep for undoing actions
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(wobble(200), now);
      osc.frequency.exponentialRampToValueAtTime(wobble(600), now + 0.12);

      gain.gain.setValueAtTime(0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.12);
      break;
    }
  }
};
