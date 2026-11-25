// Lightning Kitchen — deterministic states for screenshots (?shot=start|play|end&seed=1).
// Each shot freezes the game so the captured frame is stable and reproducible.
import { RECIPES } from './config.js';
import { createState, spawnCustomer } from './state.js';
import { mulberry32, pick } from './random.js';

export function applyShot(state, name, seed) {
  const rng = mulberry32(seed * 7919 + 13);
  if (name === 'start') {
    state.phase = 'title';
    state.frozen = true;
    return;
  }
  if (name === 'play') {
    // A busy mid-game: three orders waiting, a burger half-built on the plate,
    // noodles on the stove, chopped lettuce in hand — kitchen, order board,
    // ingredients on the counter, one dish mid-assembly, timers, plate.
    const fresh = createState(seed);
    Object.assign(state, fresh);
    state.phase = 'playing';
    state.frozen = true;
    state.score = 1250;
    state.coins = 320;
    state.served = 8;
    state.combo = 3;
    state.bestCombo = 4;
    state.level = 2;
    state.hearts = 3;
    state.plate = ['bun', 'patty'];
    state.hand = { id: 'lettuce', prepared: true };
    state.burners[0] = { item: 'noodle', progress: 1.7, total: 2.8, done: false, burnt: false };
    state.burners[1] = { item: null, progress: 0, total: 0, done: false, burnt: false };
    const burger = RECIPES.find((r) => r.id === 'burger');
    const noodle = RECIPES.find((r) => r.id === 'noodle');
    const salad = RECIPES.find((r) => r.id === 'salad');
    const c1 = spawnCustomer(state, burger);
    const c2 = spawnCustomer(state, noodle);
    const c3 = spawnCustomer(state, salad);
    c1.patience = c1.maxPatience * 0.72;
    c2.patience = c2.maxPatience * 0.45;
    c3.patience = c3.maxPatience * 0.88;
    state.mouse = { x: 700, y: 380 };
    return;
  }
  if (name === 'end') {
    const fresh = createState(seed);
    Object.assign(state, fresh);
    state.phase = 'over';
    state.frozen = true;
    state.score = 1840;
    state.coins = 1840;
    state.served = 14;
    state.combo = 0;
    state.bestCombo = 5;
    state.level = 3;
    state.hearts = 0;
    return;
  }
  state.phase = 'title';
  state.frozen = true;
}

export function shotFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const shot = params.get('shot');
  const seed = Number(params.get('seed') || '1') || 1;
  return shot ? { shot, seed } : null;
}
