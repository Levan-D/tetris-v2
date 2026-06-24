import { create } from 'zustand'
import { COLORS, REMARKS, TETROMINOES, VISIBLE_CELLS, WIDTH } from '../game/constants'
import type { ActivePiece, Cell } from '../game/types'
import {
  cellsFor,
  clockFor,
  collides,
  emptyGrid,
  kickIntoBounds,
  lineScore,
  loadScores,
  randomShape,
  saveScore,
} from '../game/logic'

interface GameStore {
  /** Flat board array (length CELL_COUNT). Locked cells only — not the active piece. */
  grid: Cell[]
  /** The piece currently falling. */
  active: ActivePiece
  /** Shape index of the piece shown in the "up next" panel. */
  nextShape: number
  score: number
  /** Current drop interval in ms; shrinks as the score grows. */
  gameClock: number
  /** True while a round is in progress. */
  isPlaying: boolean
  /** True once the player has started at least one round (controls the menu). */
  hasPlayed: boolean
  leaderboard: number[]
  /** Snarky message shown on the game-over screen. */
  remark: string | null

  start: () => void
  /** Advance the game one step (a soft/auto drop). */
  tick: () => void
  moveLeft: () => void
  moveRight: () => void
  rotate: () => void
}

/** A freshly spawned piece sits at the top-centre anchor (index 4). */
function spawn(shape: number, rotation: number): ActivePiece {
  return { shape, rotation, position: 4 }
}

export const useGameStore = create<GameStore>((set, get) => ({
  grid: emptyGrid(),
  active: spawn(randomShape(), 0),
  nextShape: randomShape(),
  score: 0,
  gameClock: 1000,
  isPlaying: false,
  hasPlayed: false,
  leaderboard: loadScores(),
  remark: null,

  start() {
    set({
      grid: emptyGrid(),
      active: spawn(randomShape(), 0),
      nextShape: randomShape(),
      score: 0,
      gameClock: 1000,
      isPlaying: true,
      hasPlayed: true,
      remark: null,
    })
  },

  tick() {
    const { isPlaying, grid, active, nextShape } = get()
    if (!isPlaying) return

    // Try to fall one row. If the way is clear, just move.
    const dropped: ActivePiece = { ...active, position: active.position + WIDTH }
    if (!collides(grid, dropped)) {
      set({ active: dropped })
      return
    }

    // Otherwise lock the piece where it is.
    const grid2 = grid.slice()
    for (const i of cellsFor(active)) grid2[i] = COLORS[active.shape]

    // Clear any completed lines and award points for each.
    let score = get().score
    for (let row = 0; row < VISIBLE_CELLS; row += WIDTH) {
      let full = true
      for (let c = 0; c < WIDTH; c++) {
        if (grid2[row + c] === null) {
          full = false
          break
        }
      }
      if (full) {
        score += lineScore(score)
        grid2.splice(row, WIDTH)
        grid2.unshift(...new Array<Cell>(WIDTH).fill(null))
      }
    }

    const gameClock = clockFor(score)

    // Spawn the next piece. Rotation carries over from the last piece — a quirk
    // of the original game, kept on purpose for a faithful port.
    const next = spawn(nextShape, active.rotation)
    if (collides(grid2, next)) {
      set({
        grid: grid2,
        score,
        gameClock,
        isPlaying: false,
        leaderboard: saveScore(score),
        remark: REMARKS[Math.floor(Math.random() * REMARKS.length)],
      })
      return
    }

    set({ grid: grid2, score, gameClock, active: next, nextShape: randomShape() })
  },

  moveLeft() {
    const { isPlaying, grid, active } = get()
    if (!isPlaying) return
    const atLeftEdge = cellsFor(active).some((i) => i % WIDTH === 0)
    if (atLeftEdge) return
    const moved: ActivePiece = { ...active, position: active.position - 1 }
    if (!collides(grid, moved)) set({ active: moved })
  },

  moveRight() {
    const { isPlaying, grid, active } = get()
    if (!isPlaying) return
    const atRightEdge = cellsFor(active).some((i) => i % WIDTH === WIDTH - 1)
    if (atRightEdge) return
    const moved: ActivePiece = { ...active, position: active.position + 1 }
    if (!collides(grid, moved)) set({ active: moved })
  },

  rotate() {
    const { isPlaying, active } = get()
    if (!isPlaying) return
    const rotation = (active.rotation + 1) % TETROMINOES[active.shape].length
    const offsets = TETROMINOES[active.shape][rotation]
    const position = kickIntoBounds(offsets, active.position)
    set({ active: { ...active, rotation, position } })
  },
}))
