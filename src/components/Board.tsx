import { COLORS, VISIBLE_CELLS } from '../game/constants'
import { cellsFor } from '../game/logic'
import { useGameStore } from '../store/gameStore'

const filledStyle = (color: string) => ({
  backgroundColor: color,
  border: 'calc(var(--cell) * 0.04) solid #393e46',
  borderRadius: 'calc(var(--cell) * 0.2)',
  boxSizing: 'border-box' as const,
})

export default function Board() {
  const grid = useGameStore((s) => s.grid)
  const active = useGameStore((s) => s.active)
  const isPlaying = useGameStore((s) => s.isPlaying)

  const activeCells = new Set(isPlaying ? cellsFor(active) : [])

  return (
    <div
      className="overflow-hidden bg-[#393e46]"
      style={{
        borderRadius: 'calc(var(--cell) * 0.6)',
        border: 'calc(var(--cell) * 0.15) solid #101216',
      }}
    >
      <div
        className="flex flex-wrap content-start"
        style={{
          width: 'calc(var(--cell) * 10)',
          height: 'calc(var(--cell) * 20)',
        }}
      >
        {Array.from({ length: VISIBLE_CELLS }, (_, i) => {
          const color = activeCells.has(i) ? COLORS[active.shape] : grid[i]
          return (
            <div
              key={i}
              style={{
                width: 'var(--cell)',
                height: 'var(--cell)',
                ...(color ? filledStyle(color) : {}),
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
