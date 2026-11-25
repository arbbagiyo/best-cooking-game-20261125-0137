// Lightning Kitchen — configuration: canvas size, layout, ingredients, recipes, levels.
// One job only: the numbers and names every other module reads.
export const VIEW = { w: 1024, h: 640 };

export const COLORS = {
  wall: '#fff3d6',
  wallTrim: '#ffd98a',
  floor: '#c98f5f',
  floorDark: '#b57a4e',
  counter: '#8a5a33',
  counterTop: '#a06a3e',
  steel: '#cfd8dc',
  steelDark: '#90a4ae',
  ink: '#3e2723',
  paper: '#fffdf5',
  red: '#e53935',
  green: '#43a047',
  amber: '#fb8c00',
  gold: '#ffc107',
  cream: '#fff8e1',
};

// Layout rectangles shared by render (drawing) and input (hit-testing).
export const LAYOUT = {
  topBar: { x: 0, y: 0, w: 1024, h: 56 },
  tickets: { y: 64, h: 116, w: 320, x: [16, 352, 688] },
  stations: { y: 196, h: 104 },
  bins: { x: 16, w: 98, gap: 10, h: 104 },
  board: { x: 668, w: 150, y: 196, h: 104 },
  stove: { x: 832, w: 176, y: 196, h: 104 },
  prep: { y: 316, h: 120 },
  plate: { x: 16, w: 380, y: 316, h: 120 },
  hand: { x: 412, w: 140, y: 316, h: 120 },
  trash: { x: 568, w: 120, y: 316, h: 120 },
  combo: { x: 704, w: 304, y: 316, h: 120 },
  footer: { y: 452, h: 188 },
};

// Ingredients. needs: null = ready to plate, 'chop' = needs the chopping board,
// 'cook' = needs a stove burner. cookTime seconds; burnAfter = extra seconds
// past done before the item burns.
export const INGREDIENTS = {
  bun: { name: 'Bread', key: '1', needs: null, color: '#e8a34c', dark: '#b97a2e' },
  patty: { name: 'Patty', key: '2', needs: 'cook', cookTime: 3.4, color: '#8d5a2b', dark: '#5d3a17' },
  lettuce: { name: 'Lettuce', key: '3', needs: 'chop', chopTime: 1.6, color: '#66bb6a', dark: '#2e7d32' },
  tomato: { name: 'Tomato', key: '4', needs: 'chop', chopTime: 1.6, color: '#ef5350', dark: '#b71c1c' },
  noodle: { name: 'Noodles', key: '5', needs: 'cook', cookTime: 2.8, color: '#ffca28', dark: '#c17900' },
  egg: { name: 'Egg', key: '6', needs: null, color: '#fffde7', dark: '#f9a825' },
};

export const INGREDIENT_ORDER = ['bun', 'patty', 'lettuce', 'tomato', 'noodle', 'egg'];

// Recipes. items are ingredient ids; a plate must hold exactly that multiset.
export const RECIPES = [
  { id: 'burger', name: 'Lightning Burger', items: ['bun', 'patty', 'lettuce'], coins: 30, level: 1 },
  { id: 'salad', name: 'Fresh Salad', items: ['lettuce', 'tomato'], coins: 20, level: 1 },
  { id: 'noodle', name: 'Fried Noodles', items: ['noodle', 'egg'], coins: 25, level: 2 },
  { id: 'omelette', name: 'Tomato Omelet', items: ['egg', 'tomato'], coins: 25, level: 3 },
  { id: 'sandwich', name: 'Egg Sandwich', items: ['bun', 'tomato', 'egg'], coins: 35, level: 4 },
];

export function recipesForLevel(level) {
  return RECIPES.filter((r) => r.level <= level);
}

export const RULES = {
  maxHearts: 3,
  maxCustomers: 3,
  servesPerLevel: 5,
  maxLevel: 6,
  patienceBase: 26, // seconds at level 1
  patiencePerLevel: 1.4,
  patienceMin: 13,
  spawnBase: 9, // seconds between arrivals at level 1
  spawnPerLevel: 0.8,
  spawnMin: 4.2,
  burnWindow: 0.4, // fraction of cookTime past done before burning
  plateMax: 4,
};
