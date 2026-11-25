// Lightning Kitchen — sound effects synthesized with WebAudio. No audio assets.
export class Sfx {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      this.ctx = new AudioContext();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return true;
  }

  tone(freq, dur, type = 'square', vol = 0.12, when = 0, slideTo = null) {
    if (this.muted || !this.ensure()) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  click() { this.tone(660, 0.06, 'square', 0.06); }
  pick() { this.tone(520, 0.07, 'triangle', 0.1); this.tone(780, 0.06, 'triangle', 0.08, 0.05); }
  chop() { this.tone(180, 0.08, 'sawtooth', 0.1, 0, 90); this.tone(140, 0.08, 'sawtooth', 0.08, 0.12, 70); }
  sizzle() { this.tone(2400, 0.25, 'sine', 0.03, 0, 1800); }
  ready() { this.tone(880, 0.12, 'sine', 0.1); this.tone(1174, 0.16, 'sine', 0.1, 0.1); }
  plate() { this.tone(440, 0.08, 'triangle', 0.1); this.tone(587, 0.1, 'triangle', 0.1, 0.07); }
  coin() { this.tone(987, 0.09, 'square', 0.09); this.tone(1318, 0.22, 'square', 0.09, 0.08); }
  error() { this.tone(160, 0.18, 'sawtooth', 0.1, 0, 110); }
  walkout() { this.tone(392, 0.14, 'triangle', 0.1, 0, 196); this.tone(311, 0.2, 'triangle', 0.1, 0.14, 155); }
  levelup() { [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.14, 'square', 0.09, i * 0.09)); }
  gameover() { [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.11, i * 0.16)); }
  start() { [262, 392, 523].forEach((f, i) => this.tone(f, 0.12, 'square', 0.09, i * 0.08)); }
}
