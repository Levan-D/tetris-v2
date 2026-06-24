import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

/**
 * Drives the automatic drop. Re-subscribes whenever the game starts/stops or the
 * speed changes (the difficulty ramp updates `gameClock`).
 */
export function useGameLoop(): void {
  const isPlaying = useGameStore((s) => s.isPlaying)
  const gameClock = useGameStore((s) => s.gameClock)

  useEffect(() => {
    if (!isPlaying) return
    const id = setInterval(() => useGameStore.getState().tick(), gameClock)
    return () => clearInterval(id)
  }, [isPlaying, gameClock])
}
