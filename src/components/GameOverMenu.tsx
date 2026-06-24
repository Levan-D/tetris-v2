import { useGameStore } from '../store/gameStore'
import Button from './Button'
import Modal from './Modal'

export default function GameOverMenu() {
  const isPlaying = useGameStore((s) => s.isPlaying)
  const hasPlayed = useGameStore((s) => s.hasPlayed)
  const score = useGameStore((s) => s.score)
  const leaderboard = useGameStore((s) => s.leaderboard)
  const remark = useGameStore((s) => s.remark)
  const start = useGameStore((s) => s.start)

  return (
    <Modal open={!isPlaying && hasPlayed}>
      <div className="text-game-lg mb-md">
        YOUR SCORE: {score}
      </div>

      <div className="text-dim text-game-lg mb-xs">
        LEADERBOARDS:
      </div>

      <div className="flex w-full justify-center px-sm">
        <div>
          {leaderboard.map((value, i) => (
            <div key={i} className="text-dim text-game-sm mb-xs">
              {i + 1} . . . . . . . . . {value ?? 0}
            </div>
          ))}
        </div>
      </div>

      <div className="text-game-lg mt-sm mb-xs">
        GAME OVER
      </div>

      <div
        className="text-center text-dim text-game-xs px-xs"
        style={{ lineHeight: 'var(--text-lg)' }}
      >
        {remark}
      </div>

      <div className="mt-md">
        <Button onClick={start}>PLAY AGAIN</Button>
      </div>
    </Modal>
  )
}
