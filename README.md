# Lemmings 3D Clone

A 3D remake of the classic **Lemmings** (inspired by the 2006 PSP edition), built with
React Native, Expo and react-three-fiber. Guide lemmings across hazard-filled levels by
assigning skills and saving enough of them to reach the exit.

## Tech Stack

- **Expo SDK 52** / **React Native 0.76**
- **expo-router** – file-based navigation
- **react-three-fiber** + **three.js** – 3D rendering
- **Zustand** for state, plus a small **ECS** (`ecs/`) that runs the lemming simulation
- **TypeScript** (strict mode)

## Getting Started

```bash
npm install

# Expo dev server (pick a target in the CLI)
npm start

# Run directly in the browser
npm run web
```

## Production Build (Web)

```bash
npx expo export -p web    # outputs a static site to dist/
# then serve it with any static server, e.g.:
python3 -m http.server --directory dist 8080
```

`dist/` is git-ignored — rebuild it from source with the command above.

## Project Structure

```
app/            Expo Router screens (menu, level-select, play, editor, settings, ...)
components/     3D canvas, HUD, skill panel, minimap, particle effects
ecs/            Entity store + lemming state machine (the simulation core)
src/stores/     Zustand stores (game, progress, sound, assets, scene)
src/levels/     Level definitions (FUN / TRICKY / TAXING / MAYHEM)
src/terrain/    Destructible-terrain grid + helpers
src/types/      Shared TypeScript types
```

## Gameplay

- 4 difficulty categories with 30 levels each
- 8 assignable skills: Climber, Floater, Bomber, Blocker, Builder, Basher, Miner, Digger
- Destructible terrain with water and lava hazards
- Release-rate control, nuke, pause, and a live minimap
- Progress (stars / completion) persisted via AsyncStorage (web: localStorage)

## Status

- TypeScript compiles with **zero errors** (`npx tsc --noEmit`).
- The **web export builds and serves** (`npx expo export -p web`, verified returning HTTP 200).
- The game flow is implemented in code: menu → level select → play (3D scene, skill
  assignment, win/lose) → progress saved.
- Audio currently uses silent placeholders; drop real files into `assets/audio/` to enable sound.

---

Built with React Native, Expo and Claude.
