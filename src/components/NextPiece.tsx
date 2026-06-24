import { COLORS, PREVIEW_WIDTH, UP_NEXT } from '../game/constants'
import { useGameStore } from '../store/gameStore'

export default function NextPiece() {
  const nextShape = useGameStore((s) => s.nextShape)
  const cells = new Set(UP_NEXT[nextShape])

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
          width: 'calc(var(--cell) * 6.67)',
          height: 'calc(var(--cell) * 6.67)',
        }}
      >
        {Array.from({ length: PREVIEW_WIDTH * PREVIEW_WIDTH }, (_, i) => (
          <div
            key={i}
            style={{
              width: 'calc(var(--cell) * 1.667)',
              height: 'calc(var(--cell) * 1.667)',
              ...(cells.has(i)
                ? {
                    backgroundColor: COLORS[nextShape],
                    border: 'calc(var(--cell) * 0.04) solid #393e46',
                    borderRadius: 'calc(var(--cell) * 0.2)',
                    boxSizing: 'border-box' as const,
                  }
                : {}),
            }}
          />
        ))}
      </div>
    </div>
  )
}
