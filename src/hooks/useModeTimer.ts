import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

const TICK_MS = 200

/**
 * Drives the elapsed-time clock for timed modes (Sprint/Ultra/Survival).
 * Accumulates real elapsed time while playing and unpaused; the store decides
 * what to do with it (Ultra countdown end, Survival garbage + speed-up).
 */
export function useModeTimer(): void {
  const isPlaying = useGameStore((s) => s.isPlaying)
  const isPaused = useGameStore((s) => s.isPaused)

  useEffect(() => {
    if (!isPlaying || isPaused) return
    let last = performance.now()
    const id = setInterval(() => {
      const now = performance.now()
      const dt = now - last
      last = now
      useGameStore.getState().tickTimer(dt)
    }, TICK_MS)
    return () => clearInterval(id)
  }, [isPlaying, isPaused])
}
