import { CELL_COUNT, COLORS, TETROMINOES, VISIBLE_CELLS, WIDTH, FLOOR } from './constants'
import type { ActivePiece, Cell, Special } from './types'

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

export function randomSpecials(): Special[] {
  const specials: Special[] = [null, null, null, null]
  const roll = Math.random()
  if (roll < 0.08) {
    specials[Math.floor(Math.random() * 4)] = 'bomb'
  } else if (roll < 0.14) {
    specials[Math.floor(Math.random() * 4)] = 'lightning'
  }
  return specials
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

export function clearScore(lines: number): number {
  switch (lines) {
    case 1: return 100
    case 2: return 300
    case 3: return 500
    case 4: return 800
    default: return 0
  }
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

const STORAGE_KEY = 'tetrisScores'

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

export function saveScore(score: number): number[] {
  const top = [...loadScores(), score].sort((a, b) => b - a).slice(0, 5)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(top))
  return top
}
