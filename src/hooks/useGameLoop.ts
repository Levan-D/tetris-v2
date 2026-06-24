import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

export function useGameLoop(): void {
  const isPlaying = useGameStore((s) => s.isPlaying)
  const isPaused = useGameStore((s) => s.isPaused)
  const isClearing = useGameStore((s) => s.isClearing)
  const gameClock = useGameStore((s) => s.gameClock)

  useEffect(() => {
    if (!isPlaying || isPaused || isClearing) return
    const id = setInterval(() => useGameStore.getState().tick(), gameClock)
    return () => clearInterval(id)
  }, [isPlaying, isPaused, isClearing, gameClock])
}
