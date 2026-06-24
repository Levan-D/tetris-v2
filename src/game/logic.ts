import { CELL_COUNT, TETROMINOES, VISIBLE_CELLS, WIDTH, FLOOR } from './constants'
import type { ActivePiece, Cell } from './types'

/** A fresh board: every visible cell empty, the hidden floor row solid. */
export function emptyGrid(): Cell[] {
  const grid: Cell[] = new Array(CELL_COUNT).fill(null)
  for (let i = VISIBLE_CELLS; i < CELL_COUNT; i++) grid[i] = FLOOR
  return grid
}

/** Pick a random shape index. */
export function randomShape(): number {
  return Math.floor(Math.random() * TETROMINOES.length)
}

/** Absolute cell indices occupied by a piece at its current rotation/position. */
export function cellsFor(piece: ActivePiece): number[] {
  return TETROMINOES[piece.shape][piece.rotation].map((offset) => piece.position + offset)
}

/** True if the piece would overlap a filled cell or fall outside the board. */
export function collides(grid: Cell[], piece: ActivePiece): boolean {
  return cellsFor(piece).some((i) => i < 0 || i >= CELL_COUNT || grid[i] !== null)
}

/**
 * Faithful port of the original wall-kick: when a rotation pushes a piece off the
 * left or right edge, nudge it back onto the board one column at a time. `anchor`
 * stays fixed at the pre-rotation position while `position` is what gets adjusted.
 */
export function kickIntoBounds(offsets: number[], position: number, anchor = position): number {
  if ((anchor + 1) % WIDTH < 4) {
    const atRightEdge = offsets.some((o) => (position + o + 1) % WIDTH === 0)
    if (atRightEdge) return kickIntoBounds(offsets, position + 1, anchor)
  } else if (anchor % WIDTH > 5) {
    const atLeftEdge = offsets.some((o) => (position + o) % WIDTH === 0)
    if (atLeftEdge) return kickIntoBounds(offsets, position - 1, anchor)
  }
  return position
}

/** Points awarded per cleared line — the reward grows as your score climbs. */
export function lineScore(score: number): number {
  if (score >= 700) return 30
  if (score >= 300) return 25
  if (score >= 150) return 20
  if (score >= 90) return 20
  if (score >= 30) return 15
  return 10
}

/** Drop interval (ms) for the current score — lower is faster. */
export function clockFor(score: number): number {
  if (score >= 1000) return 100
  if (score >= 700) return 150
  if (score >= 400) return 200
  if (score >= 300) return 250
  if (score >= 200) return 300
  if (score >= 150) return 400
  if (score >= 90) return 500
  if (score >= 60) return 600
  if (score >= 30) return 800
  return 1000
}

const STORAGE_KEY = 'tetrisScores'

/** Read the top-5 leaderboard from localStorage, defaulting to all zeros. */
export function loadScores(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [0, 0, 0, 0, 0]
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) return parsed.slice(0, 5).map(Number)
    return [0, 0, 0, 0, 0]
  } catch {
    return [0, 0, 0, 0, 0]
  }
}

/** Add a score, keep the top 5, persist, and return the new leaderboard. */
export function saveScore(score: number): number[] {
  const top = [...loadScores(), score].sort((a, b) => b - a).slice(0, 5)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(top))
  return top
}
