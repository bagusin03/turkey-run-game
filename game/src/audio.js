// Every sound is synthesised with WebAudio in code: no audio files, no
// network. Gobbles, jumps, corn chimes, the farmer's alarm and the escape
// fanfare are all tiny oscillator/noise recipes, plus a lazy banjo-pluck loop.
export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    if (this.ctx) this.ctx.suspend();
    if (!this.muted) this.ensure();
    return this.muted;
  }

  tone(freq, dur, type, vol, slideTo) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol || 0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  noise(dur, vol, lowpass) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = lowpass || 1200;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol || 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(filter).connect(gain).connect(this.ctx.destination);
    src.start(t);
  }

  // The turkey's signature: three quick throaty gobble bursts.
  gobble() {
    if (!this.ctx || this.muted) return;
    [0, 0.09, 0.18].forEach((delay, i) => {
      setTimeout(() => this.tone(190 - i * 25, 0.09, 'sawtooth', 0.12, 120), delay * 1000);
    });
    this.noise(0.12, 0.08, 700);
  }

  jump() { this.tone(280, 0.16, 'sine', 0.14, 620); }
  dash() { this.noise(0.18, 0.14, 2400); }
  corn() { this.tone(880, 0.1, 'triangle', 0.16); setTimeout(() => this.tone(1320, 0.14, 'triangle', 0.14), 70); }
  feather() { [660, 880, 1100, 1320].forEach((f, i) => setTimeout(() => this.tone(f, 0.12, 'triangle', 0.13), i * 60)); }
  thud() { this.tone(120, 0.2, 'square', 0.2, 60); this.noise(0.15, 0.2, 500); }
  spotted() { this.tone(220, 0.12, 'square', 0.16, 440); setTimeout(() => this.tone(220, 0.12, 'square', 0.16, 440), 140); }
  caught() {
    [392, 330, 262, 196].forEach((f, i) => setTimeout(() => this.tone(f, 0.3, 'triangle', 0.18), i * 180));
    this.noise(0.4, 0.15, 600);
  }
  escaped() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => setTimeout(() => this.tone(f, 0.28, 'triangle', 0.16), i * 130));
  }
  click() { this.tone(700, 0.05, 'square', 0.08); }

  startMusic() {
    this.ensure();
    if (!this.ctx || this.musicTimer) return;
    // Lazy autumn pluck: a looping pentatonic walk, quiet under the action.
    const notes = [262, 294, 330, 392, 440, 392, 330, 294];
    this.musicTimer = setInterval(() => {
      if (this.muted) return;
      const n = notes[this.musicStep % notes.length];
      this.tone(n, 0.22, 'triangle', 0.045);
      if (this.musicStep % 4 === 2) this.tone(n / 2, 0.3, 'sine', 0.05);
      this.musicStep++;
    }, 240);
  }

  stopMusic() {
    if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
  }
}
