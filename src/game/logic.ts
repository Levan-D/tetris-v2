import { CELL_COUNT, COLORS, GARBAGE, TETROMINOES, VISIBLE_CELLS, WIDTH, FLOOR } from './constants'
import type { ActivePiece, Cell } from './types'
import type { GameMode } from '../store/settingsStore'

export function emptyGrid(): Cell[] {
  const grid: Cell[] = new Array(CELL_COUNT).fill(null)
  for (let i = VISIBLE_CELLS; i < CELL_COUNT; i++) grid[i] = FLOOR
  return grid
}

export function shuffledBag(): number[] {
  const bag = [0, 1, 2, 3, 4, 5, 6]
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]]
  }
  return bag
}

export function drawFromBag(bag: number[]): { shape: number; newBag: number[] } {
  const b = bag.length > 0 ? bag : shuffledBag()
  return { shape: b[b.length - 1], newBag: b.slice(0, -1) }
}

export function randomColorIndex(): number {
  return Math.floor(Math.random() * COLORS.length)
}

export function cellsFor(piece: ActivePiece): number[] {
  return TETROMINOES[piece.shape][piece.rotation].map((offset) => piece.position + offset)
}

export function collides(grid: Cell[], piece: ActivePiece): boolean {
  return cellsFor(piece).some((i) => i < 0 || i >= CELL_COUNT || grid[i] !== null)
}

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

/** All scoring values in one place. */
export const SCORE = {
  SAME_COLOR_BONUS: 200,
  COMBO_BONUS: 50,
  PERFECT_CLEAR: 1000,
  BOMB: 50,
  LIGHTNING: 50,
  /** T-spin payout indexed by lines cleared (0..3). */
  TSPIN: [400, 800, 1200, 1600],
  SOFT_DROP_PER_CELL: 1,
  HARD_DROP_PER_CELL: 2,
}

// --- game modes -------------------------------------------------------------

/** Sprint: clear this many lines as fast as possible. */
export const SPRINT_LINES = 40
/** Ultra: score as high as possible within this window. */
export const ULTRA_MS = 120000

/** How each mode is scored on its leaderboard. */
export const MODE_RULES: Record<GameMode, { metric: 'score' | 'time'; better: 'high' | 'low' }> = {
  marathon: { metric: 'score', better: 'high' },
  sprint: { metric: 'time', better: 'low' },
  ultra: { metric: 'score', better: 'high' },
  survival: { metric: 'time', better: 'high' },
}

/** Format milliseconds as m:ss. */
export function formatTime(ms: number): string {
  const t = Math.max(0, Math.floor(ms / 1000))
  return `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}`
}

/** Survival: ms between garbage rows, shrinking as the run goes on. */
export function survivalInterval(elapsedMs: number): number {
  return Math.max(1500, 5000 - Math.floor(elapsedMs / 20000) * 700)
}

/** Survival: gravity (ms per drop), speeding up over time. */
export function survivalClock(elapsedMs: number): number {
  return Math.max(120, 800 - Math.floor(elapsedMs / 15000) * 100)
}

/** A single garbage row: solid except for 1-4 random holes. */
function garbageRow(): Cell[] {
  const row: Cell[] = new Array(WIDTH).fill(GARBAGE)
  const holes = 1 + Math.floor(Math.random() * 4) // 1..4
  const cols = Array.from({ length: WIDTH }, (_, i) => i)
  for (let i = cols.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cols[i], cols[j]] = [cols[j], cols[i]]
  }
  for (let k = 0; k < holes; k++) row[cols[k]] = null
  return row
}

/**
 * Pushes one garbage row in at the bottom of the visible field, shifting the
 * stack up by a row (the top row is pushed off).
 */
export function addGarbageRow(grid: Cell[]): Cell[] {
  const row = garbageRow()
  const visible = grid.slice(0, VISIBLE_CELLS)
  const floor = grid.slice(VISIBLE_CELLS)
  const shifted = [...visible.slice(WIDTH), ...row]
  return [...shifted, ...floor]
}

export function clearScore(lines: number): number {
  switch (lines) {
    case 1: return 100
    case 2: return 300
    case 3: return 500
    case 4: return 800
    default: return 0
  }
}

/** Indices of every full row in the visible grid. */
export function findFullRows(grid: Cell[]): number[] {
  const rows: number[] = []
  for (let row = 0; row < VISIBLE_CELLS; row += WIDTH) {
    let full = true
    for (let c = 0; c < WIDTH; c++) {
      if (grid[row + c] === null) { full = false; break }
    }
    if (full) rows.push(row)
  }
  return rows
}

/** Returns a new grid with all full rows removed and empty rows pushed in on top. */
export function removeFullRows(grid: Cell[]): Cell[] {
  const g = grid.slice()
  for (let row = 0; row < VISIBLE_CELLS; row += WIDTH) {
    let full = true
    for (let c = 0; c < WIDTH; c++) {
      if (g[row + c] === null) { full = false; break }
    }
    if (full) {
      g.splice(row, WIDTH)
      g.unshift(...new Array<Cell>(WIDTH).fill(null))
    }
  }
  return g
}

/** Removes specific visible rows (by rowStart index), dropping everything above. */
export function removeRows(grid: Cell[], rowStarts: number[]): Cell[] {
  const g = grid.slice()
  for (const row of [...new Set(rowStarts)].sort((a, b) => b - a)) {
    g.splice(row, WIDTH)
    g.unshift(...new Array<Cell>(WIDTH).fill(null))
  }
  return g
}

/** Sets the given visible cells to empty (no collapse). */
export function clearCells(grid: Cell[], cells: number[]): Cell[] {
  const g = grid.slice()
  for (const i of cells) if (i >= 0 && i < VISIBLE_CELLS) g[i] = null
  return g
}

/** How many of the given full rows are a single color (mono-color bonus). */
export function countSameColorRows(grid: Cell[], fullRows: number[]): number {
  let count = 0
  for (const row of fullRows) {
    const color = grid[row]
    let same = true
    for (let c = 1; c < WIDTH; c++) {
      if (grid[row + c] !== color) { same = false; break }
    }
    if (same) count++
  }
  return count
}

export function clockFor(score: number): number {
  if (score >= 3000) return 150
  if (score >= 2200) return 200
  if (score >= 1600) return 300
  if (score >= 1100) return 400
  if (score >= 800) return 500
  if (score >= 500) return 600
  if (score >= 300) return 700
  if (score >= 150) return 800
  if (score >= 50) return 900
  return 1000
}

export function isTSpin(grid: Cell[], piece: ActivePiece): boolean {
  if (piece.shape !== 2) return false
  const center = piece.position + WIDTH + 1
  const corners = [
    center - WIDTH - 1, center - WIDTH + 1,
    center + WIDTH - 1, center + WIDTH + 1,
  ]
  return corners.filter(c => c < 0 || c >= CELL_COUNT || grid[c] !== null).length >= 3
}

export function applyGravity(grid: Cell[]): Cell[] {
  const g = grid.slice()
  const rows = VISIBLE_CELLS / WIDTH
  for (let col = 0; col < WIDTH; col++) {
    const cells: Cell[] = []
    for (let r = 0; r < rows; r++) {
      const val = g[r * WIDTH + col]
      if (val !== null) cells.push(val)
    }
    const emptyCount = rows - cells.length
    for (let r = 0; r < rows; r++) {
      g[r * WIDTH + col] = r < emptyCount ? null : cells[r - emptyCount]
    }
  }
  return g
}

export function ghostPosition(grid: Cell[], piece: ActivePiece): number {
  let pos = piece.position
  while (!collides(grid, { ...piece, position: pos + WIDTH })) {
    pos += WIDTH
  }
  return pos
}

export function levelFor(score: number): number {
  if (score >= 3000) return 10
  if (score >= 2200) return 9
  if (score >= 1600) return 8
  if (score >= 1100) return 7
  if (score >= 800) return 6
  if (score >= 500) return 5
  if (score >= 300) return 4
  if (score >= 150) return 3
  if (score >= 50) return 2
  return 1
}

