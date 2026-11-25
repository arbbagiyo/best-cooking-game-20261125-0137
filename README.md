# Lightning Kitchen — Make the best cooking game

[![make.fun](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/arbbagiyo/best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/arbbagiyo/best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)

**Lightning Kitchen** is a fast kitchen-dash cooking game that runs
offline in a desktop browser from the static files under `game/`.

Customers arrive with orders — Lightning Burger, Fresh Salad, Fried Noodles,
Tomato Omelet, Egg Sandwich. Take ingredients from the bins, chop lettuce and
tomato on the chopping board, cook patty and noodles on the stove (don't let
them burn!), build the dish on the plate, and click the customer to serve
before their patience runs out.
Serving fast earns bonus coins, consecutive serves build a combo, and every five
served dishes levels the kitchen up with new recipes and faster customers. Three
walk-outs and the kitchen closes.

## Play

```sh
node serve.ts
# open http://localhost:8080
```

Mouse: click bins, chopping board, burners, plate, trash, and customers.
Keyboard: `1-6` ingredients · `C` chop · `S` cook · `D` take from stove ·
`F` plate · `T` trash · `Space` serve · `P` pause · `M` mute · `Enter` start.

Sounds are synthesized with WebAudio — no audio assets. All art is drawn in code.

## Layout

- `game/index.html` — page and canvas
- `game/src/config.js` — sizes, layout, ingredients, recipes, levels
- `game/src/random.js` — seeded RNG for reproducible screenshots
- `game/src/audio.js` — WebAudio sound effects
- `game/src/state.js` — game state, rules, and player actions
- `game/src/input.js` — mouse and keyboard input
- `game/src/render.js` — all canvas drawing
- `game/src/shots.js` — deterministic screenshot states (`?shot=start|play|end`)
- `game/src/main.js` — boot and game loop
- `main.ts` — entry program: copies `game/` and `screenshots/` to `/output` and
  writes `/output/dossier.json`
- `serve.ts` — local static server for play-testing
- `shots.json` — the three screenshots and their URLs

## License

MIT — see [LICENSE](LICENSE).
