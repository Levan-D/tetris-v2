import { VISIBLE_CELLS, WIDTH } from './constants'
import type { Cell, PowerupId, Special } from './types'
import { applyGravity, clearCells, removeRows } from './logic'
import { sounds } from '../audio/sounds'
import { bombParticles, lightningParticles, tSpinParticles } from '../effects/particles'

export type PipKind = 'circle' | 'bar' | 'plus' | 'arrow' | 'text'

/** What happens to the board when a piece carrying a power-up locks. */
export interface PowerupResult {
  /** Visible cells to flash before the effect resolves. */
  cells: number[]
  /** Produces the post-effect grid (clears + any collapse). */
  transform: (grid: Cell[]) => Cell[]
  /** Score multiplier applied to this lock's line clear (1 = none). */
  multiplier: number
}

/**
 * A power-up "plugin". Add a new power-up by adding an entry to POWERUPS and an
 * id to PowerupId — everything else (spawning, visuals, scoring, effect) is
 * driven from here.
 */
export interface PowerupDef {
  id: PowerupId
  /** Relative spawn weight (higher = more common). */
  weight: number
  /** Cell fill color while the piece carries it. */
  color: string
  /** Flash color during the clear animation. */
  flashColor: string
  /** Marker drawn on the cell. */
  pip: PipKind
  pipColor: string
  pipText?: string
  /** Floating notification on trigger. */
  label: string
  noteColor: string
  /** Flat points awarded on trigger. */
  score: number
  sound: () => void
  particles: () => void
  /** Compute the board effect given the carrying cell's index. */
  resolve: (cellIndex: number) => PowerupResult
}

/** Chance any given spawned piece carries a power-up at all. */
export const POWERUP_SPAWN_CHANCE = 0.16

const rowOf = (i: number) => Math.floor(i / WIDTH) * WIDTH
const rowCells = (i: number) => {
  const start = rowOf(i)
  const out: number[] = []
  for (let c = 0; c < WIDTH; c++) out.push(start + c)
  return out
}
const colCells = (i: number) => {
  const col = i % WIDTH
  const out: number[] = []
  for (let r = 0; r < VISIBLE_CELLS; r += WIDTH) out.push(r + col)
  return out
}

export const POWERUPS: Record<PowerupId, PowerupDef> = {
  // Clears its row; only what's above that row drops down a line.
  bomb: {
    id: 'bomb', weight: 100,
    color: '#ef4444', flashColor: '#ef4444', pip: 'circle', pipColor: '#fecaca',
    label: 'BOOM!', noteColor: '#ef4444', score: 50,
    sound: () => sounds.bomb(), particles: () => bombParticles(),
    resolve: (i) => ({ cells: rowCells(i), transform: (g) => removeRows(g, [rowOf(i)]), multiplier: 1 }),
  },
  // Clears its column; nothing collapses.
  lightning: {
    id: 'lightning', weight: 90,
    color: '#eab308', flashColor: '#eab308', pip: 'bar', pipColor: '#fef9c3',
    label: 'ZAP!', noteColor: '#eab308', score: 50,
    sound: () => sounds.lightning(), particles: () => lightningParticles(),
    resolve: (i) => {
      const cells = colCells(i)
      return { cells, transform: (g) => clearCells(g, cells), multiplier: 1 }
    },
  },
  // Bomb + lightning: clears row AND column. Rarer.
  laser: {
    id: 'laser', weight: 30,
    color: '#22d3ee', flashColor: '#22d3ee', pip: 'plus', pipColor: '#cffafe',
    label: 'LASER!', noteColor: '#22d3ee', score: 120,
    sound: () => { sounds.bomb(); sounds.lightning() },
    particles: () => { bombParticles(); lightningParticles() },
    resolve: (i) => {
      const col = colCells(i)
      return {
        cells: [...new Set([...rowCells(i), ...col])],
        transform: (g) => removeRows(clearCells(g, col), [rowOf(i)]),
        multiplier: 1,
      }
    },
  },
  // Compacts the whole board — every floating cell falls.
  gravity: {
    id: 'gravity', weight: 45,
    color: '#818cf8', flashColor: '#818cf8', pip: 'arrow', pipColor: '#e0e7ff',
    label: 'DROP!', noteColor: '#818cf8', score: 40,
    sound: () => sounds.drop(), particles: () => bombParticles(),
    resolve: () => ({ cells: [], transform: (g) => applyGravity(g), multiplier: 1 }),
  },
  // Multipliers — clear their row AND multiply that clear's score. Rarer and rarer.
  mult2: {
    id: 'mult2', weight: 45,
    color: '#34d399', flashColor: '#34d399', pip: 'text', pipColor: '#ffffff', pipText: '2',
    label: 'x2!', noteColor: '#34d399', score: 50,
    sound: () => sounds.levelUp(), particles: () => tSpinParticles(),
    resolve: (i) => ({ cells: rowCells(i), transform: (g) => removeRows(g, [rowOf(i)]), multiplier: 2 }),
  },
  mult4: {
    id: 'mult4', weight: 16,
    color: '#fbbf24', flashColor: '#fbbf24', pip: 'text', pipColor: '#ffffff', pipText: '4',
    label: 'x4!', noteColor: '#fbbf24', score: 50,
    sound: () => sounds.levelUp(), particles: () => tSpinParticles(),
    resolve: (i) => ({ cells: rowCells(i), transform: (g) => removeRows(g, [rowOf(i)]), multiplier: 4 }),
  },
  mult8: {
    id: 'mult8', weight: 5,
    color: '#fb7185', flashColor: '#fb7185', pip: 'text', pipColor: '#ffffff', pipText: '8',
    label: 'x8!', noteColor: '#fb7185', score: 50,
    sound: () => sounds.levelUp(), particles: () => tSpinParticles(),
    resolve: (i) => ({ cells: rowCells(i), transform: (g) => removeRows(g, [rowOf(i)]), multiplier: 8 }),
  },
}

export function getPowerup(id: PowerupId): PowerupDef {
  return POWERUPS[id]
}

const DEFS = Object.values(POWERUPS)
const TOTAL_WEIGHT = DEFS.reduce((s, d) => s + d.weight, 0)

function weightedPick(): PowerupId {
  let r = Math.random() * TOTAL_WEIGHT
  for (const d of DEFS) {
    r -= d.weight
    if (r < 0) return d.id
  }
  return DEFS[0].id
}

/** Roll a piece's specials: at most one power-up, on a random cell. */
export function rollPowerups(): Special[] {
  const specials: Special[] = [null, null, null, null]
  if (Math.random() < POWERUP_SPAWN_CHANCE) {
    specials[Math.floor(Math.random() * 4)] = weightedPick()
  }
  return specials
}
