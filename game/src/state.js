// Lightning Kitchen — game state and every action the player can take.
// No drawing here, no input here: pure rules.
import { INGREDIENTS, RECIPES, RULES, recipesForLevel } from './config.js';
import { mulberry32, pick } from './random.js';

let nextCustomerId = 1;

export function createState(seed = 1) {
  return {
    phase: 'title', // title | playing | paused | over
    seed,
    rng: mulberry32(seed),
    time: 0,
    score: 0,
    coins: 0,
    served: 0,
    combo: 0,
    bestCombo: 0,
    hearts: RULES.maxHearts,
    level: 1,
    customers: [],
    hand: null, // { id, prepared } — one held item, or null
    plate: [], // prepared ingredient ids on the plate
    chopping: null, // { id, progress, total }
    burners: [
      { item: null, progress: 0, total: 0, done: false, burnt: false },
      { item: null, progress: 0, total: 0, done: false, burnt: false },
    ],
    spawnTimer: 2.5,
    shake: 0, // ticket shake timer for a wrong serve
    shakeTicket: -1,
    message: null, // { text, until } floating feedback
    frozen: false, // screenshot mode: render only, no updates
    sfxMuted: false, // mirrored from the Sfx instance for the top bar
  };
}

export function patienceForLevel(level) {
  return Math.max(RULES.patienceMin, RULES.patienceBase - (level - 1) * RULES.patiencePerLevel);
}

export function spawnIntervalForLevel(level) {
  return Math.max(RULES.spawnMin, RULES.spawnBase - (level - 1) * RULES.spawnPerLevel);
}

const FACES = [
  { skin: '#ffcc9e', hair: '#4e342e', shirt: '#ef5350' },
  { skin: '#f1c27d', hair: '#1a1a1a', shirt: '#42a5f5' },
  { skin: '#e0ac69', hair: '#6d4c41', shirt: '#66bb6a' },
  { skin: '#ffdbac', hair: '#ff8f00', shirt: '#ab47bc' },
  { skin: '#c68642', hair: '#212121', shirt: '#26a69a' },
  { skin: '#ffcc9e', hair: '#5d4037', shirt: '#ffa726' },
];

export function spawnCustomer(state, recipe = null) {
  if (state.customers.length >= RULES.maxCustomers) return null;
  const pool = recipesForLevel(state.level);
  const chosen = recipe || pick(state.rng, pool);
  const patience = patienceForLevel(state.level);
  const customer = {
    id: nextCustomerId++,
    recipe: chosen,
    patience,
    maxPatience: patience,
    face: pick(state.rng, FACES),
    bob: state.rng() * Math.PI * 2,
  };
  state.customers.push(customer);
  return customer;
}

export function startGame(state) {
  const fresh = createState(state.seed);
  fresh.phase = 'playing';
  Object.assign(state, fresh);
  spawnCustomer(state);
  state.spawnTimer = spawnIntervalForLevel(1);
}

function sameMultiset(a, b) {
  if (a.length !== b.length) return false;
  const count = {};
  for (const x of a) count[x] = (count[x] || 0) + 1;
  for (const x of b) {
    if (!count[x]) return false;
    count[x] -= 1;
  }
  return true;
}

export function flashMessage(state, text, seconds = 1.4) {
  state.message = { text, until: state.time + seconds };
}

// --- player actions (called from input) ---

export function takeIngredient(state, id) {
  if (state.phase !== 'playing' || state.hand || state.chopping) return false;
  if (!INGREDIENTS[id]) return false;
  state.hand = { id, prepared: INGREDIENTS[id].needs === null };
  return true;
}

export function startChop(state) {
  if (state.phase !== 'playing' || !state.hand || state.chopping) return false;
  const ing = INGREDIENTS[state.hand.id];
  if (ing.needs !== 'chop' || state.hand.prepared) return false;
  state.chopping = { id: state.hand.id, progress: 0, total: ing.chopTime };
  state.hand = null;
  return true;
}

export function startCook(state, burnerIndex) {
  if (state.phase !== 'playing' || !state.hand) return false;
  const ing = INGREDIENTS[state.hand.id];
  if (ing.needs !== 'cook' || state.hand.prepared) return false;
  const burner = state.burners[burnerIndex];
  if (!burner || burner.item) return false;
  burner.item = state.hand.id;
  burner.progress = 0;
  burner.total = ing.cookTime;
  burner.done = false;
  burner.burnt = false;
  state.hand = null;
  return true;
}

export function takeFromBurner(state, burnerIndex) {
  if (state.phase !== 'playing' || state.hand) return false;
  const burner = state.burners[burnerIndex];
  if (!burner || !burner.item) return false;
  if (burner.burnt) {
    burner.item = null;
    burner.progress = 0;
    burner.done = false;
    burner.burnt = false;
    return 'burnt';
  }
  if (!burner.done) return false;
  state.hand = { id: burner.item, prepared: true };
  burner.item = null;
  burner.progress = 0;
  burner.done = false;
  return 'ok';
}

export function addToPlate(state) {
  if (state.phase !== 'playing' || !state.hand || !state.hand.prepared) return false;
  if (state.plate.length >= RULES.plateMax) return false;
  state.plate.push(state.hand.id);
  state.hand = null;
  return true;
}

export function trashHeld(state) {
  if (state.phase !== 'playing') return false;
  if (state.hand) { state.hand = null; return true; }
  if (state.plate.length) { state.plate = []; return true; }
  return false;
}

export function serveCustomer(state, index, sfx) {
  if (state.phase !== 'playing') return false;
  const customer = state.customers[index];
  if (!customer) return false;
  if (!sameMultiset(state.plate, customer.recipe.items)) {
    state.shake = 0.4;
    state.shakeTicket = index;
    state.combo = 0;
    if (sfx) sfx.error();
    return false;
  }
  const patienceBonus = Math.round((customer.patience / customer.maxPatience) * 10);
  const comboBonus = state.combo * 2;
  const earned = customer.recipe.coins + patienceBonus + comboBonus;
  state.coins += earned;
  state.score += earned;
  state.served += 1;
  state.combo += 1;
  state.bestCombo = Math.max(state.bestCombo, state.combo);
  state.plate = [];
  state.customers.splice(index, 1);
  flashMessage(state, `+${earned} coins! ${customer.recipe.name} served`, 1.4);
  const newLevel = Math.min(RULES.maxLevel, Math.floor(state.served / RULES.servesPerLevel) + 1);
  if (newLevel > state.level) {
    state.level = newLevel;
    flashMessage(state, `LEVEL ${newLevel}! New menu unlocked!`, 2.2);
    if (sfx) sfx.levelup();
  } else if (sfx) {
    sfx.coin();
  }
  return true;
}

export function serveFirstMatch(state, sfx) {
  for (let i = 0; i < state.customers.length; i++) {
    if (sameMultiset(state.plate, state.customers[i].recipe.items)) {
      return serveCustomer(state, i, sfx);
    }
  }
  return false;
}

// --- simulation step ---

export function update(state, dt, sfx) {
  if (state.phase !== 'playing' || state.frozen) return;
  state.time += dt;
  if (state.shake > 0) state.shake -= dt;

  // chopping finishes on its own
  if (state.chopping) {
    state.chopping.progress += dt;
    if (state.chopping.progress >= state.chopping.total) {
      state.hand = { id: state.chopping.id, prepared: true };
      state.chopping = null;
      if (sfx) sfx.ready();
    }
  }

  // burners cook, then burn
  for (const burner of state.burners) {
    if (!burner.item || burner.burnt) continue;
    const wasDone = burner.done;
    burner.progress += dt;
    if (!wasDone && burner.progress >= burner.total) {
      burner.done = true;
      if (sfx) sfx.ready();
    }
    if (burner.progress >= burner.total * (1 + RULES.burnWindow)) {
      burner.burnt = true;
      burner.done = false;
      flashMessage(state, 'Burnt! Take it off the stove.', 1.6);
      if (sfx) sfx.error();
    }
  }

  // new customers arrive
  state.spawnTimer -= dt;
  if (state.spawnTimer <= 0) {
    spawnCustomer(state);
    state.spawnTimer = spawnIntervalForLevel(state.level);
  }

  // patience drains; a walk-out costs a heart and the combo
  for (let i = state.customers.length - 1; i >= 0; i--) {
    const c = state.customers[i];
    c.patience -= dt;
    if (c.patience <= 0) {
      state.customers.splice(i, 1);
      state.hearts -= 1;
      state.combo = 0;
      flashMessage(state, 'Customer left! -1 heart', 1.6);
      if (sfx) sfx.walkout();
      if (state.hearts <= 0) {
        state.phase = 'over';
        if (sfx) sfx.gameover();
      }
    }
  }
}

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}
