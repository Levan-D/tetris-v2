import type { GameMode } from './settingsStore'

const GAME_PREFIX = 'tetris-game-'
const SCORE_PREFIX = 'tetris-scores-'

export function saveGameSnapshot(mode: GameMode, data: object) {
  localStorage.setItem(GAME_PREFIX + mode, JSON.stringify(data))
}

export function loadGameSnapshot(mode: GameMode): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem(GAME_PREFIX + mode)
    if (!raw) return null
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return null
  }
}

export function hasSavedGame(mode: GameMode): boolean {
  return localStorage.getItem(GAME_PREFIX + mode) !== null
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
