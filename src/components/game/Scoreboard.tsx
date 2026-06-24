import { useCallback, useEffect, useRef, useState } from 'react'
import { useGameStore } from '../../store/gameStore'
import { Button } from '../buttons'

const CONFIRM_TIMEOUT = 2000

export default function Scoreboard() {
  const score = useGameStore((s) => s.score)
  const level = useGameStore((s) => s.level)
  const isPlaying = useGameStore((s) => s.isPlaying)
  const isPaused = useGameStore((s) => s.isPaused)
  const hasPlayed = useGameStore((s) => s.hasPlayed)
  const start = useGameStore((s) => s.start)
  const togglePause = useGameStore((s) => s.togglePause)
  const goToMenu = useGameStore((s) => s.goToMenu)

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
          <Button size="md" onClick={togglePause} className="w-full">
            {isPaused ? 'PLAY' : 'PAUSE'}
          </Button>
        ) : (
          <Button onClick={start} className="w-full">
            {hasPlayed ? 'AGAIN' : 'START'}
          </Button>
        )}
      </div>

      {isPlaying && (
        <div className="flex flex-col items-center w-full gap-xxs mt-xs">
          <Button
            variant="tertiary"
            onClick={handleRestart}
            className={`w-full text-center ${confirmRestart ? 'animate-pulse' : ''}`}
            style={confirmRestart ? { color: '#f87171' } : undefined}
          >
            {confirmRestart ? 'CONFIRM?' : 'RESTART'}
          </Button>
          <Button variant="tertiary" onClick={goToMenu} className="w-full text-center">
            MENU
          </Button>
        </div>
      )}
    </>
  )
}
