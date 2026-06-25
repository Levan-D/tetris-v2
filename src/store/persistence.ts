import { CELL_COUNT } from '../game/constants'
import type { GameMode } from './settingsStore'

const GAME_PREFIX = 'tetris-game-'
const SCORE_PREFIX = 'tetris-scores-'
const TIME_PREFIX = 'tetris-times-'

/** Bump when the saved-game shape changes so old saves are discarded. */
const SCHEMA_VERSION = 2

export function saveGameSnapshot(mode: GameMode, data: object) {
  localStorage.setItem(GAME_PREFIX + mode, JSON.stringify({ v: SCHEMA_VERSION, data }))
}

/** Sanity-check a restored snapshot so a corrupt/old save can't crash the board. */
function isValidSnapshot(data: unknown): data is Record<string, unknown> {
  if (!data || typeof data !== 'object') return false
  const d = data as Record<string, unknown>
  if (!Array.isArray(d.grid) || d.grid.length !== CELL_COUNT) return false
  if (!Array.isArray(d.bag)) return false
  if (typeof d.score !== 'number' || typeof d.level !== 'number') return false
  const a = d.active as Record<string, unknown> | undefined
  if (!a || typeof a.position !== 'number' || typeof a.shape !== 'number' || typeof a.rotation !== 'number' || !Array.isArray(a.specials)) {
    return false
  }
  return true
}

export function loadGameSnapshot(mode: GameMode): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(GAME_PREFIX + mode)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { v?: number; data?: unknown }
    if (parsed?.v !== SCHEMA_VERSION || !isValidSnapshot(parsed.data)) {
      clearGameSnapshot(mode)
      return null
    }
    return parsed.data
  } catch {
    clearGameSnapshot(mode)
    return null
  }
}

export function hasSavedGame(mode: GameMode): boolean {
  return loadGameSnapshot(mode) !== null
}

export function clearGameSnapshot(mode: GameMode) {
  localStorage.removeItem(GAME_PREFIX + mode)
}

export function loadModeScores(mode: GameMode): number[] {
  try {
    const raw = localStorage.getItem(SCORE_PREFIX + mode)
    if (!raw) return [0, 0, 0, 0, 0]
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) return parsed.slice(0, 5).map(Number)
    return [0, 0, 0, 0, 0]
  } catch {
    return [0, 0, 0, 0, 0]
  }
}

export function saveModeScore(score: number, mode: GameMode): number[] {
  const top = [...loadModeScores(mode), score].sort((a, b) => b - a).slice(0, 5)
  localStorage.setItem(SCORE_PREFIX + mode, JSON.stringify(top))
  return top
}

/** Time-based leaderboards (Sprint = fastest, Survival = longest). Variable length 0-5. */
export function loadModeTimes(mode: GameMode): number[] {
  try {
    const raw = localStorage.getItem(TIME_PREFIX + mode)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? parsed.slice(0, 5).map(Number) : []
  } catch {
    return []
  }
}

export function saveModeTime(ms: number, mode: GameMode, better: 'high' | 'low'): number[] {
  const all = [...loadModeTimes(mode), ms]
  all.sort((a, b) => (better === 'low' ? a - b : b - a))
  const top = all.slice(0, 5)
  localStorage.setItem(TIME_PREFIX + mode, JSON.stringify(top))
  return top
}
