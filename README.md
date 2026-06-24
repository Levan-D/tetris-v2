# Tetris: The Revenge of the Tetro

![Tetris Game Screenshot](./screenshot.png)

A faithful rebuild of the classic vanilla-JS Tetris game in a modern front-end
stack. Same gameplay, scoring, difficulty ramp, leaderboard and snarky game-over
messages — now built with components and typed state.

## Tech stack

- **React 19** + **TypeScript** (strict)
- **Vite** for dev/build
- **Tailwind CSS v4** for styling
- **Zustand** for game state

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server (http://localhost:5173)
npm run build    # type-check and build for production
npm run preview  # preview the production build
```

## How to play

Use the arrow keys:

- **←** move left
- **→** move right
- **↓** soft drop
- **↑** rotate

Clear full rows to score. The board speeds up as your score climbs. Your top 5
scores are saved in the browser via `localStorage`.

## Project structure

```
src/
  game/
    constants.ts   # board size, tetrominoes, colours, scoring tables, remarks
    types.ts       # shared types
    logic.ts       # pure helpers (collision, line scoring, wall-kick, storage)
  store/
    gameStore.ts   # Zustand store — all game state and actions
  hooks/
    useGameLoop.ts # the automatic drop timer
    useKeyboard.ts # arrow-key controls
  components/
    Board.tsx
    NextPiece.tsx
    Scoreboard.tsx
    GameOverMenu.tsx
  App.tsx
  main.tsx
  index.css        # Tailwind import + font setup
```

## Notes

- This is the original game's **5-piece** set (L, Z, T, O, I) — no J or S — kept
  faithful to the source.
- **Audio was intentionally left out** of this rebuild (the original referenced
  `music/` and `sounds/` folders that were not part of the repo). To add it back,
  drop the mp3s into a `public/` subfolder and wire up `new Audio(...)` playback,
  e.g. in the store's `start`/`tick` actions.

## Credits

Rebuilt from the original vanilla JS/HTML/CSS version by
[Levan-D](https://github.com/Levan-D/tetris).
