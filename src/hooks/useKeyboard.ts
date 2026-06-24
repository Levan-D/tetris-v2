import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

const DAS = 170
const ARR = 50

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
      else if (key === 'ArrowDown') s.tick()
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

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault()
          startDAS(e.key)
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
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        if (heldKey === e.key) {
          clearTimers()
          heldKey = null
        }
      }

      const s = useGameStore.getState()
      if (!s.isPlaying || s.isPaused) return
      if (e.key === 'ArrowUp') {
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
