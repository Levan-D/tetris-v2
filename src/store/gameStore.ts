import { create } from 'zustand'
import { persist } from 'zustand/middleware'
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
  kickIntoBounds,
  levelFor,
  loadScores,
  randomColorIndex,
  randomSpecials,
  saveScore,
  shuffledBag,
} from '../game/logic'

const CLEAR_DELAY = 250
const NOTIF_DURATION = 1500
const SAME_COLOR_BONUS = 200
const COMBO_BONUS = 50
const PERFECT_CLEAR_BONUS = 1000
const BOMB_POINTS = 50
const LIGHTNING_POINTS = 50

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

  start: () => void
  tick: () => void
  moveLeft: () => void
  moveRight: () => void
  rotate: () => void
  hardDrop: () => void
  togglePause: () => void
  hold: () => void
  notify: (text: string, color: string) => void
}

let notifCounter = 0

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

export const useGameStore = create<GameStore>()(persist((set, get) => {
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
    leaderboard: loadScores(),
    remark: null,
    notifications: [],

    notify(text: string, color: string) {
      const id = ++notifCounter
      set(s => ({ notifications: [...s.notifications, { id, text, color }] }))
      setTimeout(() => {
        set(s => ({ notifications: s.notifications.filter(n => n.id !== id) }))
      }, NOTIF_DURATION)
    },

    start() {
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
      })
    },

    tick() {
      const { isPlaying, isPaused, isClearing, grid, active, activeColor, nextShape, nextSpecials, nextColor } = get()
      if (!isPlaying || isPaused || isClearing) return

      const dropped: ActivePiece = { ...active, position: active.position + WIDTH }
      if (!collides(grid, dropped)) {
        set({ active: dropped })
        return
      }

      const grid2 = grid.slice()
      const cells = cellsFor(active)
      const lockColor = COLORS[activeColor]
      for (const cellIdx of cells) {
        grid2[cellIdx] = lockColor
      }

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
        }
        if (active.specials[j] === 'lightning') {
          const col = cellIdx % WIDTH
          for (let r = 0; r < VISIBLE_CELLS; r += WIDTH) lightningCells.push(r + col)
          specialScore += LIGHTNING_POINTS
          pendingNotifs.push({ text: 'ZAP!', color: LIGHTNING_COLOR })
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

          let score = s.score + specialScore + linePoints
          const combo = anythingCleared ? s.comboCount + 1 : 0

          for (const n of pendingNotifs) s.notify(n.text, n.color)

          if (linesCleared > 0) {
            const labels = ['', 'SINGLE', 'DOUBLE', 'TRIPLE', 'TETRIS!']
            s.notify(labels[linesCleared], '#f8fafc')
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

          const next = spawn(nextShape, nextSpecials)
          if (collides(gridFinal, next)) {
            set({
              grid: gridFinal, score, level, gameClock,
              isPlaying: false, isClearing: false, clearingRows: [],
              clearingBombCells: [], clearingLightningCells: [],
              leaderboard: saveScore(score),
              remark: REMARKS[Math.floor(Math.random() * REMARKS.length)],
              comboCount: 0,
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
          })
        }

        if (linesCleared > 0) {
          set({ grid: g, clearingRows: fullRows, isClearing: true })
          setTimeout(() => {
            const s = get()
            if (!s.isPlaying) return
            const sameColorCount = countSameColorRows(s.grid, fullRows)
            const grid3 = removeFullRows(s.grid)
            finishLock(grid3, clearScore(linesCleared), sameColorCount)
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
      const { isPlaying, isPaused, isHardDropping, isClearing, grid, active } = get()
      if (!isPlaying || isPaused || isHardDropping || isClearing) return
      const atLeftEdge = cellsFor(active).some((i) => i % WIDTH === 0)
      if (atLeftEdge) return
      const moved: ActivePiece = { ...active, position: active.position - 1 }
      if (!collides(grid, moved)) set({ active: moved })
    },

    moveRight() {
      const { isPlaying, isPaused, isHardDropping, isClearing, grid, active } = get()
      if (!isPlaying || isPaused || isHardDropping || isClearing) return
      const atRightEdge = cellsFor(active).some((i) => i % WIDTH === WIDTH - 1)
      if (atRightEdge) return
      const moved: ActivePiece = { ...active, position: active.position + 1 }
      if (!collides(grid, moved)) set({ active: moved })
    },

    rotate() {
      const { isPlaying, isPaused, isHardDropping, isClearing, active, grid } = get()
      if (!isPlaying || isPaused || isHardDropping || isClearing) return
      const rotation = (active.rotation + 1) % TETROMINOES[active.shape].length
      const offsets = TETROMINOES[active.shape][rotation]
      const position = kickIntoBounds(offsets, active.position)
      const rotated: ActivePiece = { ...active, rotation, position }
      if (!collides(grid, rotated)) set({ active: rotated })
    },

    hardDrop() {
      const { isPlaying, isPaused, isHardDropping, isClearing } = get()
      if (!isPlaying || isPaused || isHardDropping || isClearing) return
      set({ isHardDropping: true })

      const animate = () => {
        const { active, grid, isPlaying: still } = get()
        if (!still) return
        const next: ActivePiece = { ...active, position: active.position + WIDTH }
        if (collides(grid, next)) {
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
        })
      } else {
        set({
          heldShape: active.shape,
          heldSpecials: active.specials,
          heldColor: activeColor,
          active: spawn(heldShape, heldSpecials),
          activeColor: heldColor,
          hasSwapped: true,
        })
      }
    },
  }
}, {
  name: 'tetris-session',
  partialize: ({ isHardDropping, isClearing, clearingRows, clearingBombCells, clearingLightningCells, notifications, ...rest }) => ({
    ...rest,
    isPaused: true,
  }),
}))
