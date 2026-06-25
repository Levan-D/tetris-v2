import { create } from 'zustand'
import { COLORS, NOTE_COLORS, REMARKS, TETROMINOES, VISIBLE_CELLS, WIDTH } from '../game/constants'
import type { ActivePiece, Cell, Special } from '../game/types'
import {
  cellsFor,
  clearScore,
  clockFor,
  collides,
  countSameColorRows,
  drawFromBag,
  emptyGrid,
  findFullRows,
  ghostPosition,
  isTSpin,
  addGarbageRow,
  kickIntoBounds,
  levelFor,
  MODE_RULES,
  randomColorIndex,
  removeFullRows,
  SCORE,
  shuffledBag,
  SPRINT_LINES,
  survivalClock,
  survivalInterval,
  ULTRA_MS,
} from '../game/logic'
import { getPowerup, rollPowerups, type PowerupDef, type PowerupResult } from '../game/powerups'
import { sounds } from '../audio/sounds'
import { lineClearParticles, tSpinParticles } from '../effects/particles'
import { useSettingsStore } from './settingsStore'
import type { GameMode } from './settingsStore'
import { clearGameSnapshot, loadGameSnapshot, loadModeScores, loadModeTimes, saveGameSnapshot, saveModeScore, saveModeTime } from './persistence'

// Clean up orphaned keys from earlier versions
localStorage.removeItem('tetris-session')
localStorage.removeItem('tetrisScores')

const CLEAR_DELAY = 250
const NOTIF_DURATION = 1500
const LOCK_DELAY = 200
const MAX_LOCK_RESETS = 4
const SAVE_DEBOUNCE = 300

interface Notification {
  id: number
  text: string
  color: string
}

type EndReason = 'topout' | 'cleared' | 'timeup'

function loadBoard(mode: GameMode): number[] {
  return MODE_RULES[mode].metric === 'time' ? loadModeTimes(mode) : loadModeScores(mode)
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
  lastClearWasDifficult: boolean
  isPlaying: boolean
  isPaused: boolean
  isHardDropping: boolean
  isClearing: boolean
  clearingRows: number[]
  clearingCells: number[]
  clearingColor: string
  hasPlayed: boolean
  leaderboard: number[]
  remark: string | null
  notifications: Notification[]
  lockDeadline: number | null
  lockMoves: number
  lastMoveWasRotation: boolean
  showMenu: boolean
  currentMode: GameMode
  linesCleared: number
  elapsedMs: number
  endReason: EndReason | null
  nextGarbageAt: number

  start: () => void
  continueGame: () => void
  tick: () => void
  tickTimer: (dt: number) => void
  endGame: (reason: EndReason) => void
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

/** Roll a piece's specials, honoring the power-ups setting. */
function rollSpecials(): Special[] {
  return useSettingsStore.getState().powerupsEnabled ? rollPowerups() : [null, null, null, null]
}

// --- single shared lock-delay timer -----------------------------------------
let lockTimer: ReturnType<typeof setTimeout> | null = null
function clearLock() {
  if (lockTimer) { clearTimeout(lockTimer); lockTimer = null }
}
function scheduleLock(tick: () => void) {
  clearLock()
  lockTimer = setTimeout(() => { lockTimer = null; tick() }, LOCK_DELAY + 10)
}

function spawn(shape: number, specials: Special[]): ActivePiece {
  return { shape, rotation: 0, position: 4, specials }
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
    nextSpecials: rollSpecials(),
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
    comboCount: s.comboCount, lastClearWasDifficult: s.lastClearWasDifficult,
    linesCleared: s.linesCleared, elapsedMs: s.elapsedMs,
    nextGarbageAt: s.nextGarbageAt,
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
    lastClearWasDifficult: false,
    isPlaying: false,
    isPaused: false,
    isHardDropping: false,
    isClearing: false,
    clearingRows: [],
    clearingCells: [],
    clearingColor: '',
    hasPlayed: false,
    leaderboard: [0, 0, 0, 0, 0],
    remark: null,
    notifications: [],
    lockDeadline: null,
    lockMoves: 0,
    lastMoveWasRotation: false,
    showMenu: true,
    currentMode: 'marathon',
    linesCleared: 0,
    elapsedMs: 0,
    endReason: null,
    nextGarbageAt: 0,

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
      clearLock()
      set({ showMenu: true, isPlaying: false, isPaused: false })
    },

    start() {
      const mode = useSettingsStore.getState().mode
      clearGameSnapshot(mode)
      clearLock()
      const p = initPieces()
      set({
        grid: mode === 'survival' ? addGarbageRow(emptyGrid()) : emptyGrid(),
        ...p,
        heldShape: null,
        heldSpecials: [null, null, null, null],
        heldColor: 0,
        hasSwapped: false,
        score: 0,
        level: 1,
        gameClock: mode === 'survival' ? survivalClock(0) : 1000,
        comboCount: 0,
        lastClearWasDifficult: false,
        isPlaying: true,
        isPaused: false,
        isHardDropping: false,
        isClearing: false,
        clearingRows: [],
        clearingCells: [],
        clearingColor: '',
        hasPlayed: true,
        remark: null,
        notifications: [],
        lockDeadline: null,
        lockMoves: 0,
        lastMoveWasRotation: false,
        showMenu: false,
        currentMode: mode,
        leaderboard: loadBoard(mode),
        linesCleared: 0,
        elapsedMs: 0,
        endReason: null,
        nextGarbageAt: mode === 'survival' ? survivalInterval(0) : 0,
      })
    },

    continueGame() {
      const mode = useSettingsStore.getState().mode
      const saved = loadGameSnapshot(mode)
      if (!saved) return
      clearLock()
      set({
        ...saved,
        isPlaying: true,
        isPaused: true,
        isHardDropping: false,
        isClearing: false,
        clearingRows: [],
        clearingCells: [],
        clearingColor: '',
        hasPlayed: true,
        remark: null,
        notifications: [],
        lockDeadline: null,
        lockMoves: 0,
        lastMoveWasRotation: false,
        showMenu: false,
        currentMode: mode,
        leaderboard: loadBoard(mode),
        endReason: null,
      })
    },

    endGame(reason: EndReason) {
      const s = get()
      if (!s.isPlaying) return
      clearLock()
      clearGameSnapshot(s.currentMode)
      const rules = MODE_RULES[s.currentMode]
      let leaderboard: number[]
      if (rules.metric === 'time') {
        // record a time only for runs that count: sprint must be completed, survival always
        const record = s.currentMode === 'sprint' ? reason === 'cleared' : true
        leaderboard = record ? saveModeTime(s.elapsedMs, s.currentMode, rules.better) : loadModeTimes(s.currentMode)
      } else {
        leaderboard = saveModeScore(s.score, s.currentMode)
      }
      set({
        isPlaying: false, isPaused: false, isClearing: false, isHardDropping: false,
        clearingRows: [], clearingCells: [], clearingColor: '',
        leaderboard, endReason: reason,
        remark: reason === 'topout' ? REMARKS[Math.floor(Math.random() * REMARKS.length)] : null,
        comboCount: 0, lockDeadline: null, lockMoves: 0, lastMoveWasRotation: false,
      })
    },

    tickTimer(dt: number) {
      const s = get()
      if (!s.isPlaying || s.isPaused) return
      const elapsedMs = s.elapsedMs + dt

      if (s.currentMode === 'ultra') {
        if (elapsedMs >= ULTRA_MS) { set({ elapsedMs: ULTRA_MS }); get().endGame('timeup'); return }
        set({ elapsedMs })
        return
      }

      if (s.currentMode === 'survival') {
        const gc = survivalClock(elapsedMs)
        set(gc !== s.gameClock ? { elapsedMs, gameClock: gc } : { elapsedMs })
        // push in a garbage row when due (never mid-animation)
        if (elapsedMs >= s.nextGarbageAt && !s.isClearing && !s.isHardDropping) {
          const cur = get()
          if (cur.grid.slice(0, WIDTH).some(c => c !== null)) { get().endGame('topout'); return }
          const grid = addGarbageRow(cur.grid)
          let active = cur.active
          let guard = 0
          while (collides(grid, active) && guard < 24) { active = { ...active, position: active.position - WIDTH }; guard++ }
          if (collides(grid, active)) { get().endGame('topout'); return }
          set({ grid, active, nextGarbageAt: elapsedMs + survivalInterval(elapsedMs) })
        }
        return
      }

      set({ elapsedMs })
    },

    tick() {
      const { isPlaying, isPaused, isClearing, isHardDropping, grid, active, activeColor, nextShape, nextSpecials, nextColor, lockDeadline, lastMoveWasRotation, currentMode } = get()
      if (!isPlaying || isPaused || isClearing || isHardDropping) return

      const dropped: ActivePiece = { ...active, position: active.position + WIDTH }
      if (!collides(grid, dropped)) {
        clearLock()
        set({ active: dropped, lockDeadline: null, lockMoves: 0 })
        return
      }

      const now = Date.now()
      if (lockDeadline === null) {
        set({ lockDeadline: now + LOCK_DELAY })
        scheduleLock(get().tick)
        return
      }
      if (now < lockDeadline) return

      // Lock the piece
      clearLock()
      const grid2 = grid.slice()
      const cells = cellsFor(active)
      const lockColor = COLORS[activeColor]
      for (const cellIdx of cells) grid2[cellIdx] = lockColor

      if (sfx()) sounds.lock()

      const wasTSpin = lastMoveWasRotation && isTSpin(grid2, active)

      // A piece carries at most one power-up — find it, then resolve its effect.
      let powerupDef: PowerupDef | null = null
      let powerupCell = -1
      for (let j = 0; j < active.specials.length; j++) {
        if (active.specials[j]) { powerupDef = getPowerup(active.specials[j]!); powerupCell = cells[j] }
      }

      let specialScore = 0
      let multiplier = 1
      let powerupResult: PowerupResult | null = null
      const pendingNotifs: Array<{ text: string; color: string }> = []

      if (powerupDef) {
        powerupResult = powerupDef.resolve(powerupCell)
        specialScore = powerupDef.score
        multiplier = powerupResult.multiplier
        pendingNotifs.push({ text: powerupDef.label, color: powerupDef.noteColor })
        if (sfx()) powerupDef.sound()
        if (pfx()) powerupDef.particles()
      }

      const processLines = (g: Cell[], hadSpecials: boolean) => {
        const fullRows = findFullRows(g)
        const linesCleared = fullRows.length
        const anythingCleared = hadSpecials || linesCleared > 0

        const finishLock = (gridFinal: Cell[], linePoints: number, sameColorCount: number) => {
          const s = get()
          if (!s.isPlaying) return

          const oldLevel = s.level
          let score = s.score + (specialScore + linePoints) * multiplier
          const combo = anythingCleared ? s.comboCount + 1 : 0

          for (const n of pendingNotifs) s.notify(n.text, n.color)

          // A "difficult" clear (Tetris or T-spin with lines) sustains back-to-back
          const isTetris = linesCleared === 4
          const isDifficult = linesCleared > 0 && (isTetris || wasTSpin)

          if (wasTSpin) {
            const tScore = SCORE.TSPIN[Math.min(linesCleared, 3)]
            score += tScore
            const suffix = linesCleared > 0 ? ` ${['', 'SINGLE', 'DOUBLE', 'TRIPLE'][linesCleared]}` : ''
            s.notify(`T-SPIN${suffix}!`, NOTE_COLORS.tspin)
            if (sfx()) sounds.tspin()
            if (pfx()) tSpinParticles()
          } else if (linesCleared > 0) {
            const labels = ['', 'SINGLE', 'DOUBLE', 'TRIPLE', 'TETRIS!']
            s.notify(labels[linesCleared], NOTE_COLORS.line)
            if (sfx()) sounds.clear(linesCleared)
            if (pfx()) lineClearParticles(linesCleared)
          }

          if (sameColorCount > 0) {
            score += sameColorCount * SCORE.SAME_COLOR_BONUS
            s.notify(`MONO +${sameColorCount * SCORE.SAME_COLOR_BONUS}`, NOTE_COLORS.mono)
          }

          if (combo > 1) {
            const bonus = (combo - 1) * SCORE.COMBO_BONUS
            score += bonus
            s.notify(`COMBO x${combo}`, NOTE_COLORS.combo)
          }

          if (isDifficult && s.lastClearWasDifficult) {
            const base = isTetris ? clearScore(4) : SCORE.TSPIN[Math.min(linesCleared, 3)]
            score += Math.floor(base * 0.5)
            s.notify('BACK-TO-BACK', NOTE_COLORS.b2b)
          }

          const isPerfect = gridFinal.slice(0, VISIBLE_CELLS).every(c => c === null)
          if (isPerfect && anythingCleared) {
            score += SCORE.PERFECT_CLEAR
            s.notify('PERFECT CLEAR!', NOTE_COLORS.perfect)
          }

          const level = levelFor(score)
          const gameClock = currentMode === 'survival' ? survivalClock(s.elapsedMs) : clockFor(score)
          const { shape: newNext, newBag } = drawFromBag(s.bag)
          const newLines = s.linesCleared + linesCleared

          if (level > oldLevel && currentMode !== 'survival' && sfx()) sounds.levelUp()

          // Only an actual line clear updates the B2B flag; specials/no-clear preserve it
          const lastClearWasDifficult = linesCleared > 0 ? isDifficult : s.lastClearWasDifficult

          const endState = {
            grid: gridFinal, score, level, gameClock, linesCleared: newLines,
            comboCount: combo, lastClearWasDifficult,
            isClearing: false, clearingRows: [], clearingCells: [], clearingColor: '',
            lockDeadline: null, lockMoves: 0, lastMoveWasRotation: false,
          }

          // Sprint win: cleared the line goal
          if (currentMode === 'sprint' && newLines >= SPRINT_LINES) {
            set(endState)
            get().endGame('cleared')
            return
          }

          const next = spawn(nextShape, nextSpecials)
          if (collides(gridFinal, next)) {
            set({ ...endState, comboCount: 0 })
            get().endGame('topout')
            return
          }

          set({
            ...endState,
            bag: newBag,
            active: next,
            activeColor: nextColor,
            nextShape: newNext,
            nextSpecials: rollSpecials(),
            nextColor: randomColorIndex(),
            hasSwapped: false,
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

      if (powerupDef && powerupResult) {
        const def = powerupDef
        const result = powerupResult
        if (result.cells.length > 0) {
          // bomb / lightning / laser: flash the affected cells, then transform
          set({ grid: grid2, clearingCells: result.cells, clearingColor: def.flashColor, isClearing: true })
          setTimeout(() => {
            const s = get()
            if (!s.isPlaying) return
            set({ clearingCells: [], clearingColor: '' })
            processLines(result.transform(s.grid), true)
          }, CLEAR_DELAY)
          return
        }
        // gravity well / multiplier: no cell flash, apply immediately
        processLines(result.transform(grid2), false)
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
        scheduleLock(get().tick)
      } else if (!grounded) {
        clearLock()
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
        scheduleLock(get().tick)
      } else if (!grounded) {
        clearLock()
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
        scheduleLock(get().tick)
      } else if (!grounded) {
        clearLock()
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
        clearLock()
        set(s => ({ active: dropped, score: s.score + SCORE.SOFT_DROP_PER_CELL, lockDeadline: null, lockMoves: 0, lastMoveWasRotation: false }))
      } else {
        // Already on the floor — engage the lock countdown now instead of waiting for gravity
        get().tick()
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
          // Clear isHardDropping BEFORE locking so tick() (now guarded against it) can run
          set(s => ({ score: s.score + dropDist * SCORE.HARD_DROP_PER_CELL, lockDeadline: 1, isHardDropping: false }))
          get().tick()
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

      clearLock()
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
          nextSpecials: rollSpecials(),
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

// Auto-save game state per mode (debounced to avoid a write storm during DAS)
let saveTimer: ReturnType<typeof setTimeout> | null = null
useGameStore.subscribe(() => {
  if (saveTimer) return
  saveTimer = setTimeout(() => {
    saveTimer = null
    const s = useGameStore.getState()
    if (s.isPlaying && !s.showMenu && !s.isClearing && !s.isHardDropping) {
      saveGameSnapshot(s.currentMode, extractSaveData(s))
    }
  }, SAVE_DEBOUNCE)
})
