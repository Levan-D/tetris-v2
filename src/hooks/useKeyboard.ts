import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

const DAS = 170
const ARR = 50

// WASD maps onto the same actions as the arrow keys
const WASD_MAP: Record<string, string> = {
  a: 'ArrowLeft',
  d: 'ArrowRight',
  s: 'ArrowDown',
  w: 'ArrowUp',
}

function normalizeKey(key: string): string {
  return WASD_MAP[key.toLowerCase()] ?? key
}

export function useKeyboard(): void {
  useEffect(() => {
    let dasTimer: ReturnType<typeof setTimeout> | null = null
    let arrInterval: ReturnType<typeof setInterval> | null = null
    let heldKey: string | null = null

    const clearTimers = () => {
      if (dasTimer) { clearTimeout(dasTimer); dasTimer = null }
      if (arrInterval) { clearInterval(arrInterval); arrInterval = null }
    }

    const execMove = (key: string) => {
      const s = useGameStore.getState()
      if (!s.isPlaying || s.isPaused || s.isHardDropping) return
      if (key === 'ArrowLeft') s.moveLeft()
      else if (key === 'ArrowRight') s.moveRight()
      else if (key === 'ArrowDown') s.softDrop()
    }

    const startDAS = (key: string) => {
      clearTimers()
      heldKey = key
      execMove(key)
      dasTimer = setTimeout(() => {
        arrInterval = setInterval(() => execMove(key), ARR)
      }, DAS)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return

      const s = useGameStore.getState()

      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault()
        s.togglePause()
        return
      }

      if (!s.isPlaying || s.isPaused) return

      const key = normalizeKey(e.key)

      switch (key) {
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          startDAS(key)
          break
        case ' ':
          e.preventDefault()
          s.hardDrop()
          break
        case 'Shift':
        case 'c':
        case 'C':
          e.preventDefault()
          s.hold()
          break
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      const key = normalizeKey(e.key)

      if (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowDown') {
        if (heldKey === key) {
          clearTimers()
          heldKey = null
        }
      }

      const s = useGameStore.getState()
      if (!s.isPlaying || s.isPaused) return
      if (key === 'ArrowUp') {
        e.preventDefault()
        s.rotate()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      clearTimers()
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])
}
