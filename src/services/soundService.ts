/**
 * Generative 60 BPM Calming Supermarket & Infant Soothe Audio Synthesizer
 * Uses the Web Audio API to create a gentle, continuous 60 BPM maternal/ambient pulse
 * designed to lower stress, regulate heart rate, and mask store noise.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private intervalId: number | null = null;
  private gainNode: GainNode | null = null;
  private noiseNode: AudioNode | null = null;
  private isRunning: boolean = false;
  private volume: number = 0.25;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public start() {
    if (this.isRunning) return;
    this.initContext();
    if (!this.ctx) return;

    this.isRunning = true;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    // Warm ambient background texture (soft pink noise floor)
    try {
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2) * 0.035;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.gainNode);
      whiteNoise.start();
      this.noiseNode = whiteNoise;
    } catch {
      // Noise fallback gracefully
    }

    // 60 BPM rhythm = 1 beat per second (1000ms)
    const playBeat = () => {
      if (!this.ctx || !this.isRunning || !this.gainNode) return;
      const now = this.ctx.currentTime;

      // Heartbeat pulse: Primary low 'lub' and softer 'dub'
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(78, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.18);

      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.exponentialRampToValueAtTime(0.35, now + 0.04);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

      osc.connect(oscGain);
      oscGain.connect(this.gainNode);

      osc.start(now);
      osc.stop(now + 0.35);

      // Secondary soft echo 'dub' after 280ms
      setTimeout(() => {
        if (!this.ctx || !this.isRunning || !this.gainNode) return;
        const dubNow = this.ctx.currentTime;
        const dubOsc = this.ctx.createOscillator();
        const dubGain = this.ctx.createGain();

        dubOsc.type = 'sine';
        dubOsc.frequency.setValueAtTime(68, dubNow);
        dubOsc.frequency.exponentialRampToValueAtTime(36, dubNow + 0.14);

        dubGain.gain.setValueAtTime(0.0001, dubNow);
        dubGain.gain.exponentialRampToValueAtTime(0.2, dubNow + 0.03);
        dubGain.gain.exponentialRampToValueAtTime(0.001, dubNow + 0.24);

        dubOsc.connect(dubGain);
        dubGain.connect(this.gainNode);

        dubOsc.start(dubNow);
        dubOsc.stop(dubNow + 0.26);
      }, 260);
    };

    playBeat();
    this.intervalId = window.setInterval(playBeat, 1000);
  }

  public stop() {
    this.isRunning = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.noiseNode) {
      try {
        (this.noiseNode as AudioScheduledSourceNode).stop();
      } catch {
        // ignore
      }
      this.noiseNode = null;
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public getIsRunning() {
    return this.isRunning;
  }
}

export const soundEngine = new SoundEngine();
