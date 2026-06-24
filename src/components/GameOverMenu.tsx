import { useGameStore } from '../store/gameStore'

export default function GameOverMenu() {
  const isPlaying = useGameStore((s) => s.isPlaying)
  const hasPlayed = useGameStore((s) => s.hasPlayed)
  const score = useGameStore((s) => s.score)
  const leaderboard = useGameStore((s) => s.leaderboard)
  const remark = useGameStore((s) => s.remark)

  if (isPlaying || !hasPlayed) return null

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div
        className="flex flex-col items-center bg-[#222831] text-white"
        style={{
          width: 'calc(var(--cell) * 12)',
          padding: 'calc(var(--cell) * 1.5) calc(var(--cell) * 1)',
          borderRadius: 'calc(var(--cell) * 0.6)',
          border: 'calc(var(--cell) * 0.15) solid #101216',
        }}
      >
        <div
          style={{
            fontSize: 'calc(var(--cell) * 0.75)',
            marginBottom: 'calc(var(--cell) * 1.2)',
          }}
        >
          YOUR SCORE: {score}
        </div>

        <div
          className="text-[#BABEC4]"
          style={{
            fontSize: 'calc(var(--cell) * 0.75)',
            marginBottom: 'calc(var(--cell) * 0.6)',
          }}
        >
          LEADERBOARDS:
        </div>

        <div
          className="w-full"
          style={{ padding: '0 calc(var(--cell) * 1)' }}
        >
          {leaderboard.map((value, i) => (
            <div
              key={i}
              className="text-[#BABEC4]"
              style={{
                fontSize: 'calc(var(--cell) * 0.42)',
                marginBottom: 'calc(var(--cell) * 0.5)',
              }}
            >
              {i + 1} . . . . . . . . . {value ?? 0}
            </div>
          ))}
        </div>

        <div
          style={{
            fontSize: 'calc(var(--cell) * 0.75)',
            marginTop: 'calc(var(--cell) * 1)',
            marginBottom: 'calc(var(--cell) * 0.8)',
          }}
        >
          GAME OVER
        </div>

        <div
          className="text-center text-[#BABEC4]"
          style={{
            fontSize: 'calc(var(--cell) * 0.38)',
            lineHeight: 'calc(var(--cell) * 0.85)',
            padding: '0 calc(var(--cell) * 0.4)',
          }}
        >
          {remark}
        </div>
      </div>
    </div>
  )
}
