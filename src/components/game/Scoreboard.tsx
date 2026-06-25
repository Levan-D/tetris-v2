import { useEffect } from 'react'
import { NOTE_COLORS } from '../../game/constants'
import { formatTime, SPRINT_LINES, ULTRA_MS } from '../../game/logic'
import { useGameStore } from '../../store/gameStore'
import { useConfirm } from '../../hooks/useConfirm'
import { Button } from '../buttons'

function Stats() {
  const mode = useGameStore((s) => s.currentMode)
  const score = useGameStore((s) => s.score)
  const level = useGameStore((s) => s.level)
  const linesCleared = useGameStore((s) => s.linesCleared)
  const elapsedMs = useGameStore((s) => s.elapsedMs)

  const scoreText = `SCORE:${String(score).padStart(2, '0')}`
  // First row is the prominent stat; time-ranked modes drop SCORE entirely
  const rows =
    mode === 'sprint' ? [`TIME:${formatTime(elapsedMs)}`, `LINES:${linesCleared}/${SPRINT_LINES}`] :
    mode === 'survival' ? [`TIME:${formatTime(elapsedMs)}`] :
    mode === 'ultra' ? [scoreText, `TIME:${formatTime(ULTRA_MS - elapsedMs)}`] :
    [scoreText, `LVL:${level}`]

  return (
    <>
      {rows.map((r, i) => (
        <div key={i} className={i === 0 ? 'text-ink mt-lg text-game-lg' : 'text-dim mt-sm text-game-md'}>
          {r}
        </div>
      ))}
    </>
  )
}

export default function Scoreboard() {
  const isPlaying = useGameStore((s) => s.isPlaying)
  const isPaused = useGameStore((s) => s.isPaused)
  const hasPlayed = useGameStore((s) => s.hasPlayed)
  const start = useGameStore((s) => s.start)
  const togglePause = useGameStore((s) => s.togglePause)
  const goToMenu = useGameStore((s) => s.goToMenu)

  const { confirming: confirmRestart, trigger: handleRestart, reset } = useConfirm(start)

  useEffect(() => {
    if (!isPlaying) reset()
  }, [isPlaying, reset])

  return (
    <>
      <Stats />

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
            style={confirmRestart ? { color: NOTE_COLORS.danger } : undefined}
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
