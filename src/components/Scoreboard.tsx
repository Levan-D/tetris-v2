import { useGameStore } from '../store/gameStore'

export default function Scoreboard() {
  const score = useGameStore((s) => s.score)
  const isPlaying = useGameStore((s) => s.isPlaying)
  const hasPlayed = useGameStore((s) => s.hasPlayed)
  const start = useGameStore((s) => s.start)

  const label = hasPlayed && !isPlaying ? 'AGAIN' : 'START'

  return (
    <>
      <div
        className="text-white"
        style={{
          marginTop: 'calc(var(--cell) * 1.8)',
          fontSize: 'calc(var(--cell) * 0.85)',
        }}
      >
        SCORE:<span>{String(score).padStart(2, '0')}</span>
      </div>

      <button
        type="button"
        onClick={start}
        disabled={isPlaying}
        className="border-black bg-[#00ADB5] text-[#EEEEEE] transition-colors hover:bg-[#009BA3] active:bg-[#01868D] disabled:cursor-not-allowed disabled:opacity-60"
        style={{
          marginTop: 'calc(var(--cell) * 1.8)',
          height: 'calc(var(--cell) * 2.5)',
          width: 'calc(var(--cell) * 6.67)',
          borderRadius: 'calc(var(--cell) * 0.6)',
          borderWidth: 'calc(var(--cell) * 0.15)',
          fontSize: 'calc(var(--cell) * 0.85)',
        }}
      >
        {label}
      </button>
    </>
  )
}
