# Tetris: The Revenge of the Tetro

![Tetris Game Screenshot](./screenshot.png)

A modern, arcade-flavored Tetris built with a component-driven, fully-typed
front-end stack. Standard Tetris feel — 7-bag, ghost, hold, lock delay, wall
kicks, T-spins, combos — plus four game modes, a config-driven power-up system,
sound, particles, and per-mode leaderboards.

**Play it:** https://levan-d.github.io/tetris-v2/

## Tech stack

- **React 19** + **TypeScript** (strict)
- **Vite 8** for dev/build
- **Tailwind CSS v4** (design tokens via `@theme`, cell-relative sizing)
- **Zustand 5** for game + settings state
- **Web Audio API** for procedural SFX, **canvas-confetti** for particles

## Getting started

```bash
npm install      # install dependencies
npm run dev      # dev server (http://localhost:5173)
npm run build    # type-check + production build
npm run preview  # preview the production build
```

## How to play

| Action     | Keys                 |
| ---------- | -------------------- |
| Move       | `←` `→` / `A` `D`    |
| Rotate     | `↑` / `W`            |
| Soft drop  | `↓` / `S`            |
| Hard drop  | `Space`              |
| Hold piece | `Shift` / `C`        |
| Pause      | `P` (or click board) |

Mechanics: ghost preview, hold (once per drop), 7-bag randomizer, ~200ms lock
delay with move-resets, wall kicks, T-spins, combos, back-to-back, mono-color
line bonus, and perfect-clear bonus. The game auto-pauses when you switch tabs.

## Game modes

- **Marathon** — endless; level and speed ramp with your score.
- **Sprint** — clear 40 lines as fast as you can (ranked by time).
- **Ultra** — rack up the highest score in 2 minutes.
- **Survival** — garbage rows rise from the bottom and speed up; outlast them
  (ranked by time survived).

Each mode keeps its own top-5 leaderboard (score- or time-based) in
`localStorage`. Refreshing mid-game resumes the saved run (paused).

## Power-ups

A piece can spawn carrying a power-up that triggers when it locks. They're
defined as a single config registry — change a spawn weight or add a new
power-up by editing one entry in [`src/game/powerups.ts`](src/game/powerups.ts):

| Power-up       | Effect                                              |
| -------------- | --------------------------------------------------- |
| Bomb           | Clears its row; only what's above drops down a line |
| Lightning      | Clears its column                                   |
| Laser          | Clears its row **and** column (rarer)               |
| Gravity well   | Compacts the whole board — every cell falls         |
| 2× / 4× / 8×   | Clears its row and multiplies the score (rarer)     |

Each registry entry declares its `weight`, colors, pip marker, label, sound,
particles, score, and a `resolve(cell)` returning the grid transform — so
spawning, rendering, scoring, and effects all flow from the config. Power-ups
can be toggled off entirely in Settings.

## Project structure

```
src/
  game/
    constants.ts     # board size, tetrominoes, colors, tokens
    types.ts         # shared types (Cell, PowerupId, ActivePiece)
    logic.ts         # pure helpers (collision, rotation, scoring, modes, grid ops)
    powerups.ts      # the power-up registry (weights + visuals + effects)
  store/
    gameStore.ts     # Zustand store — all game state and actions
    settingsStore.ts # persisted settings (sound, fx, ghost, power-ups, volume)
    persistence.ts   # per-mode saves + leaderboards (validated, versioned)
  audio/sounds.ts    # Web Audio synth SFX
  effects/particles.ts # canvas-confetti bursts
  hooks/             # game loop, keyboard, mode timer, auto-pause, confirm
  components/
    buttons/         # Button (variants/sizes), TogglePill
    game/            # Board, pieces, Scoreboard, Pip, Notifications, GameOver…
    mainMenu/        # MainMenu, mode options, Settings, Leaderboards, animated bg
    Modal.tsx        # portaled modal (header / scrollable body / footer)
  App.tsx
  index.css          # Tailwind theme tokens, utilities, keyframes
```

## Deployment

Pushing to `main` triggers
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds and
publishes to GitHub Pages. One-time setup: repo **Settings → Pages → Source:
GitHub Actions**. The Vite `base` is set to `/tetris-v2/` for production.

## Credits

Reimagined from the original vanilla JS/HTML/CSS version by
[Levan-D](https://github.com/Levan-D/tetris).
