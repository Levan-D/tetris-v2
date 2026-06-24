import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameStore } from '../store/gameStore'
import Button from './Button'

const CONFIRM_TIMEOUT = 2000

export default function Scoreboard() {
  const score = useGameStore((s) => s.score)
  const level = useGameStore((s) => s.level)
  const isPlaying = useGameStore((s) => s.isPlaying)
  const isPaused = useGameStore((s) => s.isPaused)
  const hasPlayed = useGameStore((s) => s.hasPlayed)
  const start = useGameStore((s) => s.start)
  const togglePause = useGameStore((s) => s.togglePause)

  const [confirmRestart, setConfirmRestart] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  useEffect(() => {
    if (!isPlaying) setConfirmRestart(false)
  }, [isPlaying])

  const handleRestart = useCallback(() => {
    if (confirmRestart) {
      if (timerRef.current) clearTimeout(timerRef.current)
      setConfirmRestart(false)
      start()
    } else {
      setConfirmRestart(true)
      timerRef.current = setTimeout(() => setConfirmRestart(false), CONFIRM_TIMEOUT)
    }
  }, [confirmRestart, start])

  return (
    <>
      <div className="text-ink mt-lg text-game-lg">
        SCORE:{String(score).padStart(2, '0')}
      </div>

      <div className="text-dim mt-sm text-game-md">
        LVL:{level}
      </div>

      <div className="mt-lg w-full">
        {isPlaying ? (
          <div className="flex gap-xxs">
            <button
              type="button"
              onClick={togglePause}
              className="cursor-pointer flex-1 bg-action text-ink border-game border-frame rounded-game-lg h-btn-h text-game-md px-xs transition-colors hover:bg-action-hover active:bg-action-press"
            >
              {isPaused ? 'PLAY' : 'PAUSE'}
            </button>
            <button
              type="button"
              onClick={handleRestart}
              className={`cursor-pointer border-game border-frame rounded-game-lg h-btn-h w-btn-h flex items-center justify-center transition-colors ${
                confirmRestart
                  ? 'bg-red-500 text-ink animate-pulse'
                  : 'bg-surface text-dim hover:text-ink'
              }`}
              title={confirmRestart ? 'Click again to restart' : 'Restart'}
            >
              <svg viewBox="0 0 24 24" className="h-1/2 w-1/2" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 4v6h6" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
            </button>
          </div>
        ) : (
          <Button onClick={start} className="w-full">
            {hasPlayed ? 'AGAIN' : 'START'}
          </Button>
        )}
      </div>
    </>
  )
}
