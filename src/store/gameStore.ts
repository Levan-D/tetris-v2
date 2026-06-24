import { create } from 'zustand'
import { BOMB_COLOR, COLORS, LIGHTNING_COLOR, REMARKS, TETROMINOES, VISIBLE_CELLS, WIDTH } from '../game/constants'
import type { ActivePiece, Cell, Special } from '../game/types'
import {
  applyGravity,
  cellsFor,
  clearScore,
  clockFor,
  collides,
  drawFromBag,
  emptyGrid,
  ghostPosition,
  isTSpin,
  kickIntoBounds,
  levelFor,
  randomColorIndex,
  randomSpecials,
  shuffledBag,
} from '../game/logic'
import { sounds } from '../audio/sounds'
import { bombParticles, lightningParticles, lineClearParticles, tSpinParticles } from '../effects/particles'
import { useSettingsStore } from './settingsStore'
import type { GameMode } from './settingsStore'
import { clearGameSnapshot, loadGameSnapshot, loadModeScores, saveGameSnapshot, saveModeScore } from './persistence'

// Clean up old persist key from previous version
localStorage.removeItem('tetris-session')

const CLEAR_DELAY = 250
const NOTIF_DURATION = 1500
const SAME_COLOR_BONUS = 200
const COMBO_BONUS = 50
const PERFECT_CLEAR_BONUS = 1000
const BOMB_POINTS = 50
const LIGHTNING_POINTS = 50
const LOCK_DELAY = 200
const MAX_LOCK_RESETS = 4
const TSPIN_SCORES = [400, 800, 1200, 1600]

interface Notification {
  id: number
  text: string
  color: string
}

interface GameStore {
  grid: Cell[]
  active: ActivePiece
  activeColor: number
  nextShape: number
  nextSpecials: Special[]
  nextColor: number
  heldShape: number | null
  heldSpecials: Special[]
  heldColor: number
  hasSwapped: boolean
  bag: number[]
  score: number
  level: number
  gameClock: number
  comboCount: number
  lastClearWasTetris: boolean
  isPlaying: boolean
  isPaused: boolean
  isHardDropping: boolean
  isClearing: boolean
  clearingRows: number[]
  clearingBombCells: number[]
  clearingLightningCells: number[]
  hasPlayed: boolean
  leaderboard: number[]
  remark: string | null
  notifications: Notification[]
  lockDeadline: number | null
  lockMoves: number
  lastMoveWasRotation: boolean
  showMenu: boolean
  currentMode: GameMode

  start: () => void
  continueGame: () => void
  tick: () => void
  moveLeft: () => void
  moveRight: () => void
  rotate: () => void
  hardDrop: () => void
  softDrop: () => void
  togglePause: () => void
  hold: () => void
  notify: (text: string, color: string) => void
  goToMenu: () => void
}

let notifCounter = 0

function sfx() { return useSettingsStore.getState().soundEnabled }
function pfx() { return useSettingsStore.getState().particlesEnabled }

function spawn(shape: number, specials: Special[]): ActivePiece {
  return { shape, rotation: 0, position: 4, specials }
}

function findFullRows(grid: Cell[]): number[] {
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

function removeFullRows(grid: Cell[]): Cell[] {
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

function countSameColorRows(grid: Cell[], fullRows: number[]): number {
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

function initPieces() {
  const bag1 = shuffledBag()
  const d1 = drawFromBag(bag1)
  const d2 = drawFromBag(d1.newBag)
  return {
    bag: d2.newBag,
    active: spawn(d1.shape, [null, null, null, null]),
    activeColor: randomColorIndex(),
    nextShape: d2.shape,
    nextSpecials: randomSpecials(),
    nextColor: randomColorIndex(),
  }
}

function extractSaveData(s: GameStore) {
  return {
    grid: s.grid, active: s.active, activeColor: s.activeColor,
    nextShape: s.nextShape, nextSpecials: s.nextSpecials, nextColor: s.nextColor,
    heldShape: s.heldShape, heldSpecials: s.heldSpecials, heldColor: s.heldColor,
    hasSwapped: s.hasSwapped, bag: s.bag,
    score: s.score, level: s.level, gameClock: s.gameClock,
    comboCount: s.comboCount, lastClearWasTetris: s.lastClearWasTetris,
  }
}

export const useGameStore = create<GameStore>()((set, get) => {
  const pieces = initPieces()

  return {
    grid: emptyGrid(),
    ...pieces,
    heldShape: null,
    heldSpecials: [null, null, null, null],
    heldColor: 0,
    hasSwapped: false,
    score: 0,
    level: 1,
    gameClock: 1000,
    comboCount: 0,
    lastClearWasTetris: false,
    isPlaying: false,
    isPaused: false,
    isHardDropping: false,
    isClearing: false,
    clearingRows: [],
    clearingBombCells: [],
    clearingLightningCells: [],
    hasPlayed: false,
    leaderboard: [0, 0, 0, 0, 0],
    remark: null,
    notifications: [],
    lockDeadline: null,
    lockMoves: 0,
    lastMoveWasRotation: false,
    showMenu: true,
    currentMode: 'marathon',

    notify(text: string, color: string) {
      const id = ++notifCounter
      set(s => ({ notifications: [...s.notifications, { id, text, color }] }))
      setTimeout(() => {
        set(s => ({ notifications: s.notifications.filter(n => n.id !== id) }))
      }, NOTIF_DURATION)
    },

    goToMenu() {
      const s = get()
      if (s.isPlaying) {
        saveGameSnapshot(s.currentMode, extractSaveData(s))
      }
      set({ showMenu: true, isPlaying: false, isPaused: false })
    },

    start() {
      const mode = useSettingsStore.getState().mode
      clearGameSnapshot(mode)
      const p = initPieces()
      set({
        grid: emptyGrid(),
        ...p,
        heldShape: null,
        heldSpecials: [null, null, null, null],
        heldColor: 0,
        hasSwapped: false,
        score: 0,
        level: 1,
        gameClock: 1000,
        comboCount: 0,
        lastClearWasTetris: false,
        isPlaying: true,
        isPaused: false,
        isHardDropping: false,
        isClearing: false,
        clearingRows: [],
        clearingBombCells: [],
        clearingLightningCells: [],
        hasPlayed: true,
        remark: null,
        notifications: [],
        lockDeadline: null,
        lockMoves: 0,
        lastMoveWasRotation: false,
        showMenu: false,
        currentMode: mode,
        leaderboard: loadModeScores(mode),
      })
    },

    continueGame() {
      const mode = useSettingsStore.getState().mode
      const saved = loadGameSnapshot(mode)
      if (!saved) return
      set({
        ...saved,
        isPlaying: true,
        isPaused: true,
        isHardDropping: false,
        isClearing: false,
        clearingRows: [],
        clearingBombCells: [],
        clearingLightningCells: [],
        hasPlayed: true,
        remark: null,
        notifications: [],
        lockDeadline: null,
        lockMoves: 0,
        lastMoveWasRotation: false,
        showMenu: false,
        currentMode: mode,
        leaderboard: loadModeScores(mode),
      })
    },

    tick() {
      const { isPlaying, isPaused, isClearing, grid, active, activeColor, nextShape, nextSpecials, nextColor, lockDeadline, lastMoveWasRotation, currentMode } = get()
      if (!isPlaying || isPaused || isClearing) return

      const dropped: ActivePiece = { ...active, position: active.position + WIDTH }
      if (!collides(grid, dropped)) {
        set({ active: dropped, lockDeadline: null, lockMoves: 0 })
        return
      }

      const now = Date.now()
      if (lockDeadline === null) {
        set({ lockDeadline: now + LOCK_DELAY })
        setTimeout(() => get().tick(), LOCK_DELAY + 10)
        return
      }
      if (now < lockDeadline) return

      // Lock the piece
      const grid2 = grid.slice()
      const cells = cellsFor(active)
      const lockColor = COLORS[activeColor]
      for (const cellIdx of cells) grid2[cellIdx] = lockColor

      if (sfx()) sounds.lock()

      const wasTSpin = lastMoveWasRotation && isTSpin(grid2, active)

      let specialScore = 0
      const pendingNotifs: Array<{ text: string; color: string }> = []
      const bombCells: number[] = []
      const lightningCells: number[] = []

      cells.forEach((cellIdx, j) => {
        if (active.specials[j] === 'bomb') {
          const rowStart = Math.floor(cellIdx / WIDTH) * WIDTH
          for (let c = 0; c < WIDTH; c++) {
            if (rowStart + c < VISIBLE_CELLS) bombCells.push(rowStart + c)
          }
          specialScore += BOMB_POINTS
          pendingNotifs.push({ text: 'BOOM!', color: BOMB_COLOR })
          if (sfx()) sounds.bomb()
          if (pfx()) bombParticles()
        }
        if (active.specials[j] === 'lightning') {
          const col = cellIdx % WIDTH
          for (let r = 0; r < VISIBLE_CELLS; r += WIDTH) lightningCells.push(r + col)
          specialScore += LIGHTNING_POINTS
          pendingNotifs.push({ text: 'ZAP!', color: LIGHTNING_COLOR })
          if (sfx()) sounds.lightning()
          if (pfx()) lightningParticles()
        }
      })

      const hasSpecials = bombCells.length > 0 || lightningCells.length > 0

      const processLines = (g: Cell[], hadSpecials: boolean) => {
        const fullRows = findFullRows(g)
        const linesCleared = fullRows.length
        const anythingCleared = hadSpecials || linesCleared > 0

        const finishLock = (gridFinal: Cell[], linePoints: number, sameColorCount: number) => {
          const s = get()
          if (!s.isPlaying) return

          const oldLevel = s.level
          let score = s.score + specialScore + linePoints
          const combo = anythingCleared ? s.comboCount + 1 : 0

          for (const n of pendingNotifs) s.notify(n.text, n.color)

          if (wasTSpin) {
            const tScore = TSPIN_SCORES[Math.min(linesCleared, 3)]
            score += tScore
            const suffix = linesCleared > 0 ? ` ${['', 'SINGLE', 'DOUBLE', 'TRIPLE'][linesCleared]}` : ''
            s.notify(`T-SPIN${suffix}!`, '#a78bfa')
            if (sfx()) sounds.tspin()
            if (pfx()) tSpinParticles()
          } else if (linesCleared > 0) {
            const labels = ['', 'SINGLE', 'DOUBLE', 'TRIPLE', 'TETRIS!']
            s.notify(labels[linesCleared], '#f8fafc')
            if (sfx()) sounds.clear(linesCleared)
            if (pfx()) lineClearParticles(linesCleared)
          }

          if (sameColorCount > 0) {
            score += sameColorCount * SAME_COLOR_BONUS
            s.notify(`MONO +${sameColorCount * SAME_COLOR_BONUS}`, '#fcd34d')
          }

          if (combo > 1) {
            const bonus = (combo - 1) * COMBO_BONUS
            score += bonus
            s.notify(`COMBO x${combo}`, '#6ee7b7')
          }

          const isTetris = linesCleared === 4
          if (isTetris && s.lastClearWasTetris) {
            const bonus = Math.floor(clearScore(4) * 0.5)
            score += bonus
            s.notify('BACK-TO-BACK', '#c4b5fd')
          }

          const isPerfect = gridFinal.slice(0, VISIBLE_CELLS).every(c => c === null)
          if (isPerfect && anythingCleared) {
            score += PERFECT_CLEAR_BONUS
            s.notify('PERFECT CLEAR!', '#fcd34d')
          }

          const gameClock = clockFor(score)
          const level = levelFor(score)
          const { shape: newNext, newBag } = drawFromBag(s.bag)

          if (level > oldLevel && sfx()) sounds.levelUp()

          const next = spawn(nextShape, nextSpecials)
          if (collides(gridFinal, next)) {
            clearGameSnapshot(currentMode)
            set({
              grid: gridFinal, score, level, gameClock,
              isPlaying: false, isClearing: false, clearingRows: [],
              clearingBombCells: [], clearingLightningCells: [],
              leaderboard: saveModeScore(score, currentMode),
              remark: REMARKS[Math.floor(Math.random() * REMARKS.length)],
              comboCount: 0,
              lockDeadline: null, lockMoves: 0, lastMoveWasRotation: false,
            })
            return
          }

          set({
            grid: gridFinal, score, level, gameClock,
            bag: newBag,
            active: next,
            activeColor: nextColor,
            nextShape: newNext,
            nextSpecials: randomSpecials(),
            nextColor: randomColorIndex(),
            isClearing: false, clearingRows: [],
            clearingBombCells: [], clearingLightningCells: [],
            hasSwapped: false,
            comboCount: combo,
            lastClearWasTetris: anythingCleared ? linesCleared === 4 : s.lastClearWasTetris,
            lockDeadline: null, lockMoves: 0, lastMoveWasRotation: false,
          })
        }

        if (linesCleared > 0) {
          set({ grid: g, clearingRows: fullRows, isClearing: true })
          setTimeout(() => {
            const s = get()
            if (!s.isPlaying) return
            const sameColorCount = countSameColorRows(s.grid, fullRows)
            const grid3 = removeFullRows(s.grid)
            finishLock(grid3, wasTSpin ? 0 : clearScore(linesCleared), sameColorCount)
          }, CLEAR_DELAY)
          return
        }

        finishLock(g, 0, 0)
      }

      if (hasSpecials) {
        set({ grid: grid2, clearingBombCells: bombCells, clearingLightningCells: lightningCells, isClearing: true })
        setTimeout(() => {
          const s = get()
          if (!s.isPlaying) return
          const g = s.grid.slice()
          for (const idx of bombCells) if (idx < VISIBLE_CELLS) g[idx] = null
          for (const idx of lightningCells) if (idx < VISIBLE_CELLS) g[idx] = null
          set({ clearingBombCells: [], clearingLightningCells: [] })
          processLines(applyGravity(g), true)
        }, CLEAR_DELAY)
        return
      }

      processLines(grid2, false)
    },

    moveLeft() {
      const { isPlaying, isPaused, isHardDropping, isClearing, grid, active, lockDeadline, lockMoves } = get()
      if (!isPlaying || isPaused || isHardDropping || isClearing) return
      const atLeftEdge = cellsFor(active).some((i) => i % WIDTH === 0)
      if (atLeftEdge) return
      const moved: ActivePiece = { ...active, position: active.position - 1 }
      if (collides(grid, moved)) return
      if (sfx()) sounds.move()
      const grounded = collides(grid, { ...moved, position: moved.position + WIDTH })
      if (grounded && lockDeadline !== null && lockMoves < MAX_LOCK_RESETS) {
        set({ active: moved, lockDeadline: Date.now() + LOCK_DELAY, lockMoves: lockMoves + 1, lastMoveWasRotation: false })
        setTimeout(() => get().tick(), LOCK_DELAY + 10)
      } else if (!grounded) {
        set({ active: moved, lockDeadline: null, lastMoveWasRotation: false })
      } else {
        set({ active: moved, lastMoveWasRotation: false })
      }
    },

    moveRight() {
      const { isPlaying, isPaused, isHardDropping, isClearing, grid, active, lockDeadline, lockMoves } = get()
      if (!isPlaying || isPaused || isHardDropping || isClearing) return
      const atRightEdge = cellsFor(active).some((i) => i % WIDTH === WIDTH - 1)
      if (atRightEdge) return
      const moved: ActivePiece = { ...active, position: active.position + 1 }
      if (collides(grid, moved)) return
      if (sfx()) sounds.move()
      const grounded = collides(grid, { ...moved, position: moved.position + WIDTH })
      if (grounded && lockDeadline !== null && lockMoves < MAX_LOCK_RESETS) {
        set({ active: moved, lockDeadline: Date.now() + LOCK_DELAY, lockMoves: lockMoves + 1, lastMoveWasRotation: false })
        setTimeout(() => get().tick(), LOCK_DELAY + 10)
      } else if (!grounded) {
        set({ active: moved, lockDeadline: null, lastMoveWasRotation: false })
      } else {
        set({ active: moved, lastMoveWasRotation: false })
      }
    },

    rotate() {
      const { isPlaying, isPaused, isHardDropping, isClearing, active, grid, lockDeadline, lockMoves } = get()
      if (!isPlaying || isPaused || isHardDropping || isClearing) return
      const rotation = (active.rotation + 1) % TETROMINOES[active.shape].length
      const offsets = TETROMINOES[active.shape][rotation]
      const position = kickIntoBounds(offsets, active.position)
      const rotated: ActivePiece = { ...active, rotation, position }
      if (collides(grid, rotated)) return
      if (sfx()) sounds.rotate()
      const grounded = collides(grid, { ...rotated, position: rotated.position + WIDTH })
      if (grounded && lockDeadline !== null && lockMoves < MAX_LOCK_RESETS) {
        set({ active: rotated, lockDeadline: Date.now() + LOCK_DELAY, lockMoves: lockMoves + 1, lastMoveWasRotation: true })
        setTimeout(() => get().tick(), LOCK_DELAY + 10)
      } else if (!grounded) {
        set({ active: rotated, lockDeadline: null, lastMoveWasRotation: true })
      } else {
        set({ active: rotated, lastMoveWasRotation: true })
      }
    },

    softDrop() {
      const { isPlaying, isPaused, isHardDropping, isClearing, grid, active } = get()
      if (!isPlaying || isPaused || isHardDropping || isClearing) return
      const dropped: ActivePiece = { ...active, position: active.position + WIDTH }
      if (!collides(grid, dropped)) {
        set(s => ({ active: dropped, score: s.score + 1, lockDeadline: null, lockMoves: 0, lastMoveWasRotation: false }))
      }
    },

    hardDrop() {
      const { isPlaying, isPaused, isHardDropping, isClearing, active, grid } = get()
      if (!isPlaying || isPaused || isHardDropping || isClearing) return

      const landingPos = ghostPosition(grid, active)
      const dropDist = (landingPos - active.position) / WIDTH

      set({ isHardDropping: true })
      if (sfx()) sounds.drop()

      const animate = () => {
        const { active: cur, grid: g, isPlaying: still } = get()
        if (!still) return
        const next: ActivePiece = { ...cur, position: cur.position + WIDTH }
        if (collides(g, next)) {
          set(s => ({ score: s.score + dropDist * 2, lockDeadline: 1 }))
          get().tick()
          set({ isHardDropping: false })
          return
        }
        set({ active: next })
        requestAnimationFrame(animate)
      }
      animate()
    },

    togglePause() {
      const { isPlaying } = get()
      if (!isPlaying) return
      set((s) => ({ isPaused: !s.isPaused }))
    },

    hold() {
      const { isPlaying, isPaused, isHardDropping, isClearing, hasSwapped, active, activeColor, heldShape, heldSpecials, heldColor, nextShape, nextSpecials, nextColor, bag } = get()
      if (!isPlaying || isPaused || isHardDropping || isClearing || hasSwapped) return
      if (heldShape !== null && active.shape === heldShape) return

      if (heldShape === null) {
        const { shape: newNext, newBag } = drawFromBag(bag)
        set({
          bag: newBag,
          heldShape: active.shape,
          heldSpecials: active.specials,
          heldColor: activeColor,
          active: spawn(nextShape, nextSpecials),
          activeColor: nextColor,
          nextShape: newNext,
          nextSpecials: randomSpecials(),
          nextColor: randomColorIndex(),
          hasSwapped: true,
          lockDeadline: null, lockMoves: 0, lastMoveWasRotation: false,
        })
      } else {
        set({
          heldShape: active.shape,
          heldSpecials: active.specials,
          heldColor: activeColor,
          active: spawn(heldShape, heldSpecials),
          activeColor: heldColor,
          hasSwapped: true,
          lockDeadline: null, lockMoves: 0, lastMoveWasRotation: false,
        })
      }
    },
  }
})

// Auto-save game state per mode
useGameStore.subscribe((state) => {
  if (state.isPlaying && !state.showMenu && !state.isClearing && !state.isHardDropping) {
    saveGameSnapshot(state.currentMode, extractSaveData(state))
  }
})
