import {
  BOMB_COLOR,
  COLORS,
  LIGHTNING_COLOR,
  PREVIEW_WIDTH,
  UP_NEXT,
} from "../../game/constants"
import type { Special } from "../../game/types"

interface PiecePreviewProps {
  label: string
  shape: number | null
  color?: string
  specials?: Special[]
  dimmed?: boolean
}

export default function PiecePreview({
  label,
  shape,
  color,
  specials,
  dimmed,
}: PiecePreviewProps) {
  const displayColor = color ?? (shape !== null ? COLORS[shape] : undefined)

  const cellMap = new Map<number, { color: string; special: Special }>()
  if (shape !== null && displayColor) {
    UP_NEXT[shape].forEach((pos, j) => {
      const sp = specials?.[j] ?? null
      const c =
        sp === "bomb"
          ? BOMB_COLOR
          : sp === "lightning"
            ? LIGHTNING_COLOR
            : displayColor
      cellMap.set(pos, { color: c, special: sp })
    })
  }

  return (
    <div
      className={`bg-surface-2 rounded-game-lg p-xxs transition-opacity ${dimmed ? "opacity-35" : ""}`}
    >
      <div className="text-dim  text-center text-game-sm mb-xxs">
        {label}
      </div>
      <div className="overflow-hidden bg-surface rounded-game-md border-thin border-frame">
        <div className="flex flex-wrap content-start w-preview h-preview">
          {Array.from({ length: PREVIEW_WIDTH * PREVIEW_WIDTH }, (_, i) => {
            const info = cellMap.get(i)

            if (!info)
              return <div key={i} className="w-preview-cell h-preview-cell" />

            if (info.special) {
              return (
                <div
                  key={i}
                  className="w-preview-cell h-preview-cell rounded-game-sm border-thin border-surface flex items-center justify-center"
                  style={{ backgroundColor: info.color }}
                >
                  <div
                    style={{
                      width: info.special === "bomb" ? "40%" : "15%",
                      height: info.special === "bomb" ? "40%" : "65%",
                      backgroundColor:
                        info.special === "bomb" ? "#fecaca" : "#fef9c3",
                      borderRadius:
                        info.special === "bomb"
                          ? "50%"
                          : "var(--radius-game-sm)",
                    }}
                  />
                </div>
              )
            }

            return (
              <div
                key={i}
                className="w-preview-cell h-preview-cell rounded-game-sm border-thin border-surface"
                style={{ backgroundColor: info.color }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
