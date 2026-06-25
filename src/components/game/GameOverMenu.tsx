import { formatTime, MODE_RULES } from '../../game/logic'
import { useGameStore } from '../../store/gameStore'
import { Button } from '../buttons'
import Modal from '../Modal'
import Leaderboard from './Leaderboard'

export default function GameOverMenu() {
  const isPlaying = useGameStore((s) => s.isPlaying)
  const hasPlayed = useGameStore((s) => s.hasPlayed)
  const showMenu = useGameStore((s) => s.showMenu)
  const score = useGameStore((s) => s.score)
  const leaderboard = useGameStore((s) => s.leaderboard)
  const remark = useGameStore((s) => s.remark)
  const mode = useGameStore((s) => s.currentMode)
  const elapsedMs = useGameStore((s) => s.elapsedMs)
  const endReason = useGameStore((s) => s.endReason)
  const start = useGameStore((s) => s.start)
  const goToMenu = useGameStore((s) => s.goToMenu)

  const timed = MODE_RULES[mode].metric === 'time'

  const heading =
    endReason === 'cleared' ? 'COMPLETE!' :
    endReason === 'timeup' ? "TIME'S UP" :
    'GAME OVER'

  // Headline stat for this run
  const result =
    mode === 'survival' ? `SURVIVED ${formatTime(elapsedMs)}` :
    mode === 'sprint' && endReason === 'cleared' ? `TIME ${formatTime(elapsedMs)}` :
    `SCORE ${score}`

  // Leaderboard rows: times for timed modes, scores otherwise
  const entries = timed
    ? Array.from({ length: 5 }, (_, i) => (i < leaderboard.length ? formatTime(leaderboard[i]) : '—'))
    : leaderboard.map((v) => String(v ?? 0))

  return (
    <Modal
      open={!isPlaying && hasPlayed && !showMenu}
      title={heading}
      footer={
        <>
          <Button variant="primary" size="sm" className="w-full" onClick={start}>PLAY AGAIN</Button>
          <Button variant="secondary" size="sm" className="w-full" onClick={goToMenu}>MENU</Button>
        </>
      }
    >
      <div className="text-game-lg">{result}</div>

      <Leaderboard title={timed ? 'BEST TIMES' : 'LEADERBOARDS'} entries={entries} />

      {remark && (
        <div className="text-center text-dim text-game-xs px-xs leading-game">
          {remark}
        </div>
      )}
    </Modal>
  )
}
