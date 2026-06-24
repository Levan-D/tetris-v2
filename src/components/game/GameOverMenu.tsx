import { useGameStore } from '../../store/gameStore'
import { Button } from '../buttons'
import Modal from '../Modal'

export default function GameOverMenu() {
  const isPlaying = useGameStore((s) => s.isPlaying)
  const hasPlayed = useGameStore((s) => s.hasPlayed)
  const showMenu = useGameStore((s) => s.showMenu)
  const score = useGameStore((s) => s.score)
  const leaderboard = useGameStore((s) => s.leaderboard)
  const remark = useGameStore((s) => s.remark)
  const start = useGameStore((s) => s.start)
  const goToMenu = useGameStore((s) => s.goToMenu)

  return (
    <Modal
      open={!isPlaying && hasPlayed && !showMenu}
      title="GAME OVER"
      footer={
        <>
          <Button variant="primary" size="sm" className="w-full" onClick={start}>PLAY AGAIN</Button>
          <Button variant="secondary" size="sm" className="w-full" onClick={goToMenu}>MENU</Button>
        </>
      }
    >
      <div className="text-game-lg">
        YOUR SCORE: {score}
      </div>

      <div className="w-full flex flex-col items-center">
        <div className="text-dim text-game-lg mb-xs">
          LEADERBOARDS:
        </div>
        <div>
          {leaderboard.map((value, i) => (
            <div key={i} className="text-dim text-game-sm">
              {i + 1} . . . . . . . . . {value ?? 0}
            </div>
          ))}
        </div>
      </div>

      <div
        className="text-center text-dim text-game-xs px-xs"
        style={{ lineHeight: 'var(--text-lg)' }}
      >
        {remark}
      </div>
    </Modal>
  )
}
