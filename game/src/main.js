// Lightning Kitchen — boot and game loop. Wires state, input, sound and rendering.
import { VIEW } from './config.js';
import { Sfx } from './audio.js';
import { createState, update } from './state.js';
import { attachInput } from './input.js';
import { draw } from './render.js';
import { applyShot, shotFromUrl } from './shots.js';

const canvas = document.getElementById('game');
canvas.width = VIEW.w;
canvas.height = VIEW.h;
const ctx = canvas.getContext('2d');

const sfx = new Sfx();
const state = createState(1);
state.mouse = { x: 512, y: 320 };
// Exposed for play-testing and debugging from the browser console.
window.__game = { state, sfx };

const shot = shotFromUrl();
if (shot) {
  applyShot(state, shot.shot, shot.seed);
  // Frozen shots still render once; the loop keeps painting the same frame.
  draw(state, ctx);
}

attachInput(canvas, state, sfx);

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(state, dt, sfx);
  draw(state, ctx);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
