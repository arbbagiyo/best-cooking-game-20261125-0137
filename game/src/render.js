// Lightning Kitchen — every pixel the game shows. Canvas 2D, all art drawn in code.
import { COLORS, INGREDIENTS, INGREDIENT_ORDER, LAYOUT, RULES, VIEW } from './config.js';
import { ticketRect, binRect, burnerRect } from './input.js';

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'left', weight = 'bold') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px Arial, Helvetica, sans-serif`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

// --- food icons (drawn, never images) ---

export function drawFoodIcon(ctx, id, cx, cy, size, prepared = true) {
  const s = size;
  ctx.save();
  ctx.translate(cx, cy);
  if (id === 'bun') {
    ctx.fillStyle = '#e8a34c';
    roundRect(ctx, -s * 0.48, -s * 0.28, s * 0.96, s * 0.62, s * 0.28);
    ctx.fill();
    ctx.fillStyle = '#c47f2d';
    roundRect(ctx, -s * 0.48, s * 0.18, s * 0.96, s * 0.16, s * 0.06);
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    for (const [dx, dy] of [[-0.25, -0.14], [0, -0.2], [0.25, -0.14], [-0.12, -0.05], [0.14, -0.05]]) {
      ctx.beginPath();
      ctx.arc(dx * s, dy * s, s * 0.045, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'patty') {
    ctx.fillStyle = prepared ? '#6d4423' : '#a06a3e';
    roundRect(ctx, -s * 0.5, -s * 0.22, s, s * 0.44, s * 0.2);
    ctx.fill();
    if (prepared) {
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = s * 0.05;
      for (const dx of [-0.28, 0, 0.28]) {
        ctx.beginPath();
        ctx.moveTo(dx * s, -s * 0.18);
        ctx.lineTo(dx * s, s * 0.18);
        ctx.stroke();
      }
    }
  } else if (id === 'lettuce') {
    ctx.fillStyle = prepared ? '#81c784' : '#43a047';
    ctx.beginPath();
    for (let i = 0; i < 7; i++) {
      const a = (i / 7) * Math.PI * 2;
      const r = s * (prepared ? 0.34 : 0.44);
      const px = Math.cos(a) * r;
      const py = Math.sin(a) * r * 0.75;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2e7d32';
    ctx.lineWidth = s * 0.04;
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.2);
    ctx.lineTo(0, s * 0.2);
    ctx.stroke();
  } else if (id === 'tomato') {
    if (prepared) {
      ctx.fillStyle = '#ef5350';
      for (const dx of [-0.22, 0.22]) {
        ctx.beginPath();
        ctx.arc(dx * s, 0, s * 0.26, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#ffcdd2';
      for (const dx of [-0.22, 0.22]) {
        ctx.beginPath();
        ctx.arc(dx * s, 0, s * 0.13, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#e53935';
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.44, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#43a047';
      ctx.beginPath();
      ctx.arc(0, -s * 0.4, s * 0.12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff8a80';
      ctx.beginPath();
      ctx.arc(-s * 0.15, -s * 0.15, s * 0.1, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'noodle') {
    ctx.strokeStyle = prepared ? '#ffb300' : '#ffca28';
    ctx.lineWidth = s * 0.09;
    ctx.lineCap = 'round';
    ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const y = (i - 1) * s * 0.22;
      ctx.moveTo(-s * 0.4, y);
      ctx.bezierCurveTo(-s * 0.15, y - s * 0.14, s * 0.15, y + s * 0.14, s * 0.4, y);
    }
    ctx.stroke();
    if (prepared) {
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = s * 0.05;
      for (const dx of [-0.2, 0.05, 0.28]) {
        ctx.beginPath();
        ctx.moveTo(dx * s, -s * 0.3);
        ctx.quadraticCurveTo(dx * s + s * 0.08, -s * 0.55, dx * s, -s * 0.72);
        ctx.stroke();
      }
    }
  } else if (id === 'egg') {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.48, s * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.arc(s * 0.08, 0, s * 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffca28';
    ctx.beginPath();
    ctx.arc(s * 0.05, -s * 0.03, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function drawCustomerFace(ctx, face, cx, cy, r, bob) {
  const y = cy + Math.sin(bob) * 2;
  ctx.fillStyle = face.shirt;
  roundRect(ctx, cx - r * 0.9, y + r * 0.55, r * 1.8, r * 0.9, r * 0.3);
  ctx.fill();
  ctx.fillStyle = face.skin;
  ctx.beginPath();
  ctx.arc(cx, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = face.hair;
  ctx.beginPath();
  ctx.arc(cx, y - r * 0.25, r * 0.92, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#3e2723';
  ctx.beginPath();
  ctx.arc(cx - r * 0.32, y - r * 0.05, r * 0.09, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.32, y - r * 0.05, r * 0.09, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#3e2723';
  ctx.lineWidth = r * 0.08;
  ctx.beginPath();
  ctx.arc(cx, y + r * 0.15, r * 0.4, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
}

function drawHeart(ctx, cx, cy, size, filled) {
  ctx.fillStyle = filled ? '#e53935' : '#bcaaa4';
  ctx.beginPath();
  ctx.moveTo(cx, cy + size * 0.35);
  ctx.bezierCurveTo(cx - size * 0.6, cy - size * 0.1, cx - size * 0.35, cy - size * 0.55, cx, cy - size * 0.15);
  ctx.bezierCurveTo(cx + size * 0.35, cy - size * 0.55, cx + size * 0.6, cy - size * 0.1, cx, cy + size * 0.35);
  ctx.fill();
}

// --- screens ---

export function draw(state, ctx) {
  ctx.clearRect(0, 0, VIEW.w, VIEW.h);
  drawKitchen(state, ctx);
  if (state.phase === 'title') drawTitle(state, ctx);
  else if (state.phase === 'paused') drawPaused(state, ctx);
  else if (state.phase === 'over') drawGameOver(state, ctx);
  drawToast(state, ctx);
}

function drawKitchen(state, ctx) {
  // wall + floor
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, VIEW.w, 452);
  ctx.fillStyle = COLORS.wallTrim;
  ctx.fillRect(0, 448, VIEW.w, 6);
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 454, VIEW.w, 186);
  ctx.fillStyle = COLORS.floorDark;
  for (let x = 0; x < VIEW.w; x += 128) {
    ctx.fillRect(x, 520, 4, 120);
  }
  // decorative dining tables in the footer
  for (const tx of [120, 900]) {
    ctx.fillStyle = '#fffdf5';
    roundRect(ctx, tx - 70, 560, 140, 14, 7);
    ctx.fill();
    ctx.fillStyle = '#8a5a33';
    ctx.fillRect(tx - 6, 574, 12, 50);
  }
  ctx.fillStyle = 'rgba(62,39,35,0.55)';
  text(ctx, 'LEVEL ' + state.level, 512, 500, 22, 'rgba(62,39,35,0.75)', 'center');
  const levelProgress = ((state.served % RULES.servesPerLevel) / RULES.servesPerLevel) * 220;
  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  roundRect(ctx, 402, 516, 220, 14, 7);
  ctx.fill();
  ctx.fillStyle = COLORS.gold;
  roundRect(ctx, 402, 516, Math.max(14, levelProgress), 14, 7);
  ctx.fill();
  text(ctx, `${state.served % RULES.servesPerLevel}/${RULES.servesPerLevel} dishes to level ${Math.min(RULES.maxLevel, state.level + 1)}`, 512, 552, 15, 'rgba(255,255,255,0.9)', 'center');
  text(ctx, 'Take ingredients → chop on the board / stove → build on the plate → click a customer to serve', 512, 600, 15, 'rgba(255,255,255,0.85)', 'center');
  text(ctx, 'Keys: 1-6 ingredients · C chop · S cook · D take · F plate · T trash · Space serve · P pause · M sound', 512, 624, 13, 'rgba(255,255,255,0.7)', 'center');

  drawTopBar(state, ctx);
  drawTickets(state, ctx);
  drawStations(state, ctx);
  drawPrep(state, ctx);
}

function drawTopBar(state, ctx) {
  ctx.fillStyle = '#5d4037';
  ctx.fillRect(0, 0, VIEW.w, 56);
  text(ctx, '🍳 LIGHTNING KITCHEN', 16, 30, 20, '#ffecb3');
  text(ctx, `SCORE ${state.score}`, 300, 30, 20, '#ffffff');
  text(ctx, `🪙 ${state.coins}`, 470, 30, 20, COLORS.gold);
  text(ctx, `🍽️ ${state.served} served`, 600, 30, 18, '#ffffff');
  for (let i = 0; i < RULES.maxHearts; i++) {
    drawHeart(ctx, 770 + i * 30, 28, 22, i < state.hearts);
  }
  // mute + pause buttons
  ctx.fillStyle = '#8d6e63';
  roundRect(ctx, 856, 8, 76, 40, 8);
  ctx.fill();
  roundRect(ctx, 940, 8, 76, 40, 8);
  ctx.fill();
  text(ctx, sfxMutedLabel(state), 894, 30, 22, '#ffffff', 'center');
  text(ctx, state.phase === 'paused' ? '▶ RESUME' : '⏸ PAUSE', 978, 30, 14, '#ffffff', 'center');
}

function sfxMutedLabel(state) {
  return state.sfxMuted ? '🔇' : '🔊';
}

function drawTickets(state, ctx) {
  for (let i = 0; i < RULES.maxCustomers; i++) {
    const r = ticketRect(i);
    const c = state.customers[i];
    ctx.save();
    if (state.shake > 0 && state.shakeTicket === i) {
      ctx.translate(Math.sin(state.time * 60) * 5, 0);
    }
    ctx.fillStyle = c ? COLORS.paper : 'rgba(255,253,245,0.45)';
    roundRect(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.strokeStyle = c ? '#d7ccc8' : '#e0d6cf';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (!c) {
      text(ctx, '— empty —', r.x + r.w / 2, r.y + r.h / 2, 16, '#bcaaa4', 'center');
      ctx.restore();
      continue;
    }
    const frac = Math.max(0, c.patience / c.maxPatience);
    drawCustomerFace(ctx, c.face, r.x + 52, r.y + 44, 30, c.bob + state.time * 2);
    text(ctx, c.recipe.name, r.x + 96, r.y + 24, 19, COLORS.ink);
    // recipe icons
    c.recipe.items.forEach((id, k) => {
      drawFoodIcon(ctx, id, r.x + 112 + k * 40, r.y + 56, 30, true);
    });
    text(ctx, `${c.recipe.coins} coins`, r.x + 96, r.y + 88, 15, '#8d6e63');
    // patience bar
    ctx.fillStyle = '#e0d6cf';
    roundRect(ctx, r.x + 16, r.y + r.h - 18, r.w - 32, 10, 5);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? COLORS.green : frac > 0.25 ? COLORS.amber : COLORS.red;
    roundRect(ctx, r.x + 16, r.y + r.h - 18, (r.w - 32) * frac, 10, 5);
    ctx.fill();
    text(ctx, `${Math.ceil(c.patience)} sec`, r.x + r.w - 16, r.y + 22, 14, frac > 0.25 ? '#8d6e63' : COLORS.red, 'right');
    ctx.restore();
  }
}

function drawStations(state, ctx) {
  text(ctx, 'INGREDIENTS', 16, 188, 12, '#8d6e63');
  INGREDIENT_ORDER.forEach((id, i) => {
    const r = binRect(i);
    const ing = INGREDIENTS[id];
    const held = state.hand && state.hand.id === id;
    ctx.fillStyle = held ? '#ffe082' : '#fffdf5';
    roundRect(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.strokeStyle = held ? COLORS.amber : '#d7ccc8';
    ctx.lineWidth = held ? 3 : 2;
    ctx.stroke();
    drawFoodIcon(ctx, id, r.x + r.w / 2, r.y + 42, 52, ing.needs === null);
    text(ctx, ing.name, r.x + r.w / 2, r.y + 82, 14, COLORS.ink, 'center');
    text(ctx, ing.key, r.x + 10, r.y + 14, 12, '#bcaaa4');
    if (ing.needs === 'chop') text(ctx, '✂️ chop', r.x + r.w / 2, r.y + 96, 10, '#8d6e63', 'center');
    if (ing.needs === 'cook') text(ctx, '🔥 cook', r.x + r.w / 2, r.y + 96, 10, '#8d6e63', 'center');
  });

  // chopping board
  const b = LAYOUT.board;
  ctx.fillStyle = '#d7a86a';
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#a67c52';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, '🔪 CHOPPING BOARD', b.x + b.w / 2, b.y + 16, 12, '#5d4037', 'center');
  if (state.chopping) {
    drawFoodIcon(ctx, state.chopping.id, b.x + b.w / 2, b.y + 52, 44, false);
    const frac = state.chopping.progress / state.chopping.total;
    ctx.fillStyle = '#e0d6cf';
    roundRect(ctx, b.x + 16, b.y + 84, b.w - 32, 10, 5);
    ctx.fill();
    ctx.fillStyle = COLORS.green;
    roundRect(ctx, b.x + 16, b.y + 84, (b.w - 32) * frac, 10, 5);
    ctx.fill();
  } else {
    text(ctx, 'click: chop (C)', b.x + b.w / 2, b.y + 56, 12, '#5d4037', 'center');
  }

  // stove
  const s = LAYOUT.stove;
  ctx.fillStyle = '#37474f';
  roundRect(ctx, s.x, s.y, s.w, s.h, 12);
  ctx.fill();
  text(ctx, '🔥 STOVE', s.x + s.w / 2, s.y + 14, 12, '#eceff1', 'center');
  state.burners.forEach((burner, i) => {
    const r = burnerRect(i);
    ctx.fillStyle = burner.burnt ? '#212121' : burner.done ? '#ff7043' : '#546e7a';
    ctx.beginPath();
    ctx.arc(r.x + r.w / 2, r.y + r.h / 2 + 6, 30, 0, Math.PI * 2);
    ctx.fill();
    if (burner.item) {
      drawFoodIcon(ctx, burner.item, r.x + r.w / 2, r.y + r.h / 2 + 6, 44, burner.done);
      if (!burner.done && !burner.burnt) {
        const frac = burner.progress / burner.total;
        ctx.strokeStyle = COLORS.gold;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(r.x + r.w / 2, r.y + r.h / 2 + 6, 38, -Math.PI / 2, -Math.PI / 2 + frac * Math.PI * 2);
        ctx.stroke();
      }
      if (burner.done) {
        text(ctx, 'READY!', r.x + r.w / 2, r.y + 12, 13, '#ffcc80', 'center');
      }
      if (burner.burnt) {
        text(ctx, 'BURNT', r.x + r.w / 2, r.y + 12, 12, '#ef5350', 'center');
      }
    } else {
      text(ctx, 'burner ' + (i + 1), r.x + r.w / 2, r.y + r.h / 2 + 6, 12, '#b0bec5', 'center');
    }
  });
}

function drawPrep(state, ctx) {
  // plate
  const p = LAYOUT.plate;
  ctx.fillStyle = '#fffdf5';
  roundRect(ctx, p.x, p.y, p.w, p.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#d7ccc8';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, '🍽️ PLATE  (click / F)', p.x + 16, p.y + 20, 14, COLORS.ink);
  ctx.fillStyle = '#eceff1';
  ctx.beginPath();
  ctx.ellipse(p.x + 110, p.y + 72, 86, 34, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#b0bec5';
  ctx.stroke();
  state.plate.forEach((id, i) => {
    drawFoodIcon(ctx, id, p.x + 56 + i * 62, p.y + 72, 46, true);
  });
  if (!state.plate.length) {
    text(ctx, 'empty plate', p.x + 230, p.y + 72, 14, '#bcaaa4', 'center');
  } else {
    const matched = state.customers.some((c) => {
      const a = [...state.plate].sort().join(',');
      const b = [...c.recipe.items].sort().join(',');
      return a === b;
    });
    text(ctx, matched ? '✅ match! click a customer' : 'build to match the order', p.x + 230, p.y + 72, 13, matched ? COLORS.green : '#8d6e63', 'center');
  }

  // hand slot
  const h = LAYOUT.hand;
  ctx.fillStyle = '#fff3e0';
  roundRect(ctx, h.x, h.y, h.w, h.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#ffcc80';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, '✋ HAND', h.x + h.w / 2, h.y + 20, 13, COLORS.ink, 'center');
  if (state.hand) {
    drawFoodIcon(ctx, state.hand.id, h.x + h.w / 2, h.y + 62, 52, state.hand.prepared);
    const ing = INGREDIENTS[state.hand.id];
    text(ctx, state.hand.prepared ? ing.name + ' ✓' : ing.name + ' (raw)', h.x + h.w / 2, h.y + 102, 12, COLORS.ink, 'center');
  } else {
    text(ctx, 'empty', h.x + h.w / 2, h.y + 62, 14, '#bcaaa4', 'center');
  }

  // trash
  const t = LAYOUT.trash;
  ctx.fillStyle = '#efebe9';
  roundRect(ctx, t.x, t.y, t.w, t.h, 12);
  ctx.fill();
  ctx.strokeStyle = '#bcaaa4';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, '🗑️', t.x + t.w / 2, t.y + 48, 34, COLORS.ink, 'center');
  text(ctx, 'TRASH (T)', t.x + t.w / 2, t.y + 92, 12, COLORS.ink, 'center');

  // combo panel
  const c = LAYOUT.combo;
  ctx.fillStyle = state.combo >= 3 ? '#fff3e0' : '#f5f5f5';
  roundRect(ctx, c.x, c.y, c.w, c.h, 12);
  ctx.fill();
  ctx.strokeStyle = state.combo >= 3 ? COLORS.amber : '#d7ccc8';
  ctx.lineWidth = 2;
  ctx.stroke();
  text(ctx, '🔥 COMBO', c.x + 16, c.y + 22, 14, COLORS.ink);
  text(ctx, 'x' + state.combo, c.x + 16, c.y + 62, 34, state.combo >= 3 ? '#e65100' : COLORS.ink);
  text(ctx, `best x${state.bestCombo} · +2 coins/combo`, c.x + 16, c.y + 96, 13, '#8d6e63');
  text(ctx, 'Serve fast = bonus!', c.x + c.w - 16, c.y + 22, 12, '#8d6e63', 'right');

  // held item follows the mouse
  if (state.hand && state.mouse) {
    ctx.globalAlpha = 0.9;
    drawFoodIcon(ctx, state.hand.id, state.mouse.x, state.mouse.y - 24, 40, state.hand.prepared);
    ctx.globalAlpha = 1;
  }
}

function overlay(ctx, alpha) {
  ctx.fillStyle = `rgba(38, 24, 16, ${alpha})`;
  ctx.fillRect(0, 0, VIEW.w, VIEW.h);
}

function bigButton(ctx, x, y, w, h, label, sub) {
  ctx.fillStyle = COLORS.amber;
  roundRect(ctx, x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = '#e65100';
  ctx.lineWidth = 3;
  ctx.stroke();
  text(ctx, label, x + w / 2, y + h / 2 - (sub ? 10 : 0), 24, '#ffffff', 'center');
  if (sub) text(ctx, sub, x + w / 2, y + h / 2 + 18, 13, '#fff3e0', 'center');
}

function drawTitle(state, ctx) {
  overlay(ctx, 0.55);
  ctx.fillStyle = COLORS.paper;
  roundRect(ctx, 212, 70, 600, 500, 20);
  ctx.fill();
  text(ctx, '🍳', 512, 130, 56, COLORS.ink, 'center');
  text(ctx, 'LIGHTNING KITCHEN', 512, 180, 44, COLORS.ink, 'center');
  text(ctx, 'Cook fast, serve on time!', 512, 222, 18, '#8d6e63', 'center');
  const lines = [
    '1  Take ingredients from the rack (click / keys 1-6)',
    '2  Chop lettuce & tomato on the board (C)',
    '3  Cook patty & noodles on the stove (S) — don\'t let them burn!',
    '4  Build on the plate (F), then click a customer to serve',
    'A customer who runs out of patience leaves and costs you a heart.',
  ];
  lines.forEach((line, i) => {
    text(ctx, line, 512, 268 + i * 28, 16, COLORS.ink, 'center');
  });
  bigButton(ctx, 362, 480, 300, 64, '▶  START COOKING', 'or press Enter');
}

function drawPaused(state, ctx) {
  overlay(ctx, 0.55);
  ctx.fillStyle = COLORS.paper;
  roundRect(ctx, 312, 200, 400, 280, 20);
  ctx.fill();
  text(ctx, '⏸ PAUSED', 512, 250, 36, COLORS.ink, 'center');
  text(ctx, `Score ${state.score} · ${state.served} dishes served`, 512, 296, 16, '#8d6e63', 'center');
  bigButton(ctx, 362, 330, 300, 56, '▶  RESUME', null);
  ctx.fillStyle = '#8d6e63';
  roundRect(ctx, 362, 400, 300, 56, 14);
  ctx.fill();
  text(ctx, '↻  RESTART', 512, 428, 20, '#ffffff', 'center');
}

function drawGameOver(state, ctx) {
  overlay(ctx, 0.6);
  ctx.fillStyle = COLORS.paper;
  roundRect(ctx, 262, 110, 500, 400, 20);
  ctx.fill();
  text(ctx, '😢', 512, 160, 48, COLORS.ink, 'center');
  text(ctx, 'KITCHEN CLOSED!', 512, 208, 38, COLORS.ink, 'center');
  text(ctx, 'All the customers left…', 512, 246, 17, '#8d6e63', 'center');
  text(ctx, `FINAL SCORE  ${state.score}`, 512, 300, 26, '#e65100', 'center');
  text(ctx, `🪙 ${state.coins} coins  ·  🍽️ ${state.served} dishes  ·  🔥 best combo x${state.bestCombo}`, 512, 340, 16, COLORS.ink, 'center');
  text(ctx, `Reached level ${state.level}`, 512, 372, 16, '#8d6e63', 'center');
  bigButton(ctx, 362, 470, 300, 64, '↻  COOK AGAIN', 'or press Enter');
}

function drawToast(state, ctx) {
  if (!state.message || state.time > state.message.until) return;
  const alpha = Math.min(1, (state.message.until - state.time) / 0.4);
  ctx.globalAlpha = alpha;
  const w = ctx.measureText(state.message.text).width + 40;
  ctx.fillStyle = '#3e2723';
  roundRect(ctx, 512 - w / 2, 186, w, 40, 20);
  ctx.fill();
  ctx.fillStyle = '#ffecb3';
  ctx.font = 'bold 17px Arial, Helvetica, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(state.message.text, 512, 207);
  ctx.globalAlpha = 1;
}
