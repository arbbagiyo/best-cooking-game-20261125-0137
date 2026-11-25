// Lightning Kitchen — mouse and keyboard input. Hit-tests the layout rects from
// config.js and calls the matching action in state.js.
import { INGREDIENT_ORDER, LAYOUT } from './config.js';
import {
  addToPlate,
  serveCustomer,
  serveFirstMatch,
  startChop,
  startCook,
  startGame,
  takeFromBurner,
  takeIngredient,
  trashHeld,
} from './state.js';

function inside(x, y, r) {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}

export function binRect(i) {
  const b = LAYOUT.bins;
  return { x: b.x + i * (b.w + b.gap), y: LAYOUT.stations.y, w: b.w, h: b.h };
}

export function burnerRect(i) {
  const s = LAYOUT.stove;
  return { x: s.x + 6 + i * 86, y: s.y + 8, w: 80, h: 88 };
}

export function ticketRect(i) {
  const t = LAYOUT.tickets;
  return { x: t.x[i], y: t.y, w: t.w, h: t.h };
}

export function attachInput(canvas, state, sfx) {
  const toGame = (event) => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1024,
      y: ((event.clientY - rect.top) / rect.height) * 640,
    };
  };

  canvas.addEventListener('click', (event) => {
    sfx.ensure();
    const { x, y } = toGame(event);
    handleClick(state, sfx, x, y);
  });

  canvas.addEventListener('mousemove', (event) => {
    const { x, y } = toGame(event);
    state.mouse = { x, y };
  });

  window.addEventListener('keydown', (event) => {
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'm') { sfx.muted = !sfx.muted; state.sfxMuted = sfx.muted; return; }
    if (state.phase === 'title' && (key === 'enter' || key === ' ')) {
      sfx.ensure(); sfx.start(); startGame(state); return;
    }
    if (state.phase === 'over' && (key === 'enter' || key === ' ')) {
      sfx.ensure(); sfx.start(); startGame(state); return;
    }
    if (key === 'escape' || key === 'p') {
      if (state.phase === 'playing') { state.phase = 'paused'; sfx.click(); }
      else if (state.phase === 'paused') { state.phase = 'playing'; sfx.click(); }
      return;
    }
    if (state.phase !== 'playing') return;
    const binIndex = INGREDIENT_ORDER.findIndex((id) => {
      const ing = { bun: '1', patty: '2', lettuce: '3', tomato: '4', noodle: '5', egg: '6' };
      return ing[id] === key;
    });
    if (binIndex >= 0) {
      if (takeIngredient(state, INGREDIENT_ORDER[binIndex])) sfx.pick();
      return;
    }
    if (key === 'c') { if (startChop(state)) sfx.chop(); return; }
    if (key === 's') {
      const free = state.burners.findIndex((b) => !b.item);
      if (free >= 0 && startCook(state, free)) sfx.sizzle();
      return;
    }
    if (key === 'd') {
      const done = state.burners.findIndex((b) => b.item && (b.done || b.burnt));
      if (done >= 0) {
        const res = takeFromBurner(state, done);
        if (res === 'ok') sfx.pick();
        else if (res === 'burnt') sfx.error();
      }
      return;
    }
    if (key === 'f') { if (addToPlate(state)) sfx.plate(); return; }
    if (key === 't') { if (trashHeld(state)) sfx.error(); return; }
    if (key === ' ') {
      if (serveFirstMatch(state, sfx)) sfx.coin();
      else sfx.error();
      event.preventDefault();
    }
  });
}

export function handleClick(state, sfx, x, y) {
  // Top-right buttons (pause / mute) work in any phase.
  if (inside(x, y, { x: 940, y: 8, w: 76, h: 40 })) {
    if (state.phase === 'playing') { state.phase = 'paused'; sfx.click(); }
    else if (state.phase === 'paused') { state.phase = 'playing'; sfx.click(); }
    return;
  }
  if (inside(x, y, { x: 856, y: 8, w: 76, h: 40 })) {
    sfx.muted = !sfx.muted;
    state.sfxMuted = sfx.muted;
    return;
  }

  if (state.phase === 'title') {
    if (inside(x, y, { x: 362, y: 480, w: 300, h: 64 })) {
      sfx.start();
      startGame(state);
    }
    return;
  }
  if (state.phase === 'over') {
    if (inside(x, y, { x: 362, y: 470, w: 300, h: 64 })) {
      sfx.start();
      startGame(state);
    }
    return;
  }
  if (state.phase === 'paused') {
    if (inside(x, y, { x: 362, y: 330, w: 300, h: 56 })) {
      state.phase = 'playing';
      sfx.click();
    }
    if (inside(x, y, { x: 362, y: 400, w: 300, h: 56 })) {
      sfx.start();
      startGame(state);
    }
    return;
  }
  if (state.phase !== 'playing') return;

  // Serve: click a customer ticket.
  for (let i = 0; i < state.customers.length; i++) {
    if (inside(x, y, ticketRect(i))) {
      serveCustomer(state, i, sfx);
      return;
    }
  }
  // Ingredient bins.
  for (let i = 0; i < INGREDIENT_ORDER.length; i++) {
    if (inside(x, y, binRect(i))) {
      if (takeIngredient(state, INGREDIENT_ORDER[i])) sfx.pick();
      else sfx.error();
      return;
    }
  }
  // Chopping board.
  if (inside(x, y, LAYOUT.board)) {
    if (startChop(state)) sfx.chop();
    else sfx.error();
    return;
  }
  // Stove burners: put a raw item on, or pick a finished one up.
  for (let i = 0; i < 2; i++) {
    if (inside(x, y, burnerRect(i))) {
      const burner = state.burners[i];
      if (burner.item) {
        const res = takeFromBurner(state, i);
        if (res === 'ok') sfx.pick();
        else if (res === 'burnt') sfx.error();
        else sfx.error();
      } else if (startCook(state, i)) {
        sfx.sizzle();
      } else {
        sfx.error();
      }
      return;
    }
  }
  // Plate: add the held prepared item.
  if (inside(x, y, LAYOUT.plate)) {
    if (addToPlate(state)) sfx.plate();
    else sfx.error();
    return;
  }
  // Trash: drop the held item or clear the plate.
  if (inside(x, y, LAYOUT.trash)) {
    if (trashHeld(state)) sfx.error();
    return;
  }
}
