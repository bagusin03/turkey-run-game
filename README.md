[![make.fun](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/c/turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/bagusin03/turkey-run-game/rank.svg)](https://make.fun/c/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/bagusin03/turkey-run-game/reward.svg)](https://make.fun/c/turkey-run-game-01)

# Gobble Dash — A Turkey Escape Game

A complete, original turkey escape game for the make.fun **Make the best turkey escape game** bounty. It runs offline in a desktop browser from static files — no network request, no API, no library.

Thanksgiving dinner is at 6:00 and **you are the main course**. Play a turkey sprinting 1,500 m from the farmyard, through the barn, and across the kitchen to the back door — outrunning **Farmer Bram**, who chases, searches, and sprints when he spots you. Jump fences and pumpkins, duck into haystacks to hide, dash past the hot oven and the swinging carving knives, and grab corn and golden feathers on the way. Three stumbles and you are dinner.

## How to play

- **Space / ↑ / W** — jump (double jump in the air)
- **Shift / X** — dash
- **↓ / S** — hide in a haystack while the farmer passes
- **Click / Enter** — start, **P** — pause, **M** — sound on/off, **R** — restart
- **Mouse** — click the buttons and menus

The HUD shows score, corn, distance to the back door, lives, the stage, and a farmer-proximity meter that turns red when he is right behind you. "SPOTTED!" flashes when he closes in; hiding makes him lose the trail.

## Run it

```sh
node serve.ts   # then open http://localhost:8080
```

Screenshots are real renders of the game's own code (`?shot=start|play|kitchen|escaped&seed=7`, see `shots.json`). A full run is winnable — the autopilot (`?auto=1`) proves it by playing to the escape screen.

## Layout

- `game/index.html` — the page
- `game/src/config.js` — tuning numbers, stages and palette
- `game/src/random.js` — deterministic seeded RNG
- `game/src/audio.js` — synthesised WebAudio sounds and music
- `game/src/input.js` — keyboard and mouse
- `game/src/world.js` — turkey, farmer AI, obstacles, stages, scoring
- `game/src/render.js` — sky, farm, barn, kitchen, characters, HUD, screens
- `game/src/shots.js` — screenshot scenes and the autopilot
- `game/src/main.js` — boot and game loop
- `main.ts` — hands the game in (copies `game/` + `screenshots/`, writes `dossier.json`)

MIT licensed. Original idea, art, sounds and names — nothing copied from a commercial game.
