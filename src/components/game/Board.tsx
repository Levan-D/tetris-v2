import { COLORS, GARBAGE, GARBAGE_COLOR, VISIBLE_CELLS, WIDTH } from '../../game/constants'
import type { Special } from '../../game/types'
import { cellsFor, ghostPosition } from '../../game/logic'
import { getPowerup } from '../../game/powerups'
import { useGameStore } from '../../store/gameStore'
import { useSettingsStore } from '../../store/settingsStore'
import Notifications from './Notifications'
import Pip from './Pip'

function cellColor(colorIndex: number, special: Special): string {
  return special ? getPowerup(special).color : COLORS[colorIndex]
}

export default function Board() {
  const grid = useGameStore((s) => s.grid)
  const active = useGameStore((s) => s.active)
  const activeColor = useGameStore((s) => s.activeColor)
  const isPlaying = useGameStore((s) => s.isPlaying)
  const isPaused = useGameStore((s) => s.isPaused)
  const clearingRows = useGameStore((s) => s.clearingRows)
  const clearingCells = useGameStore((s) => s.clearingCells)
  const clearingColor = useGameStore((s) => s.clearingColor)
  const ghostEnabled = useSettingsStore((s) => s.ghostEnabled)

  const clearingRowSet = new Set(clearingRows)
  const clearingCellSet = new Set(clearingCells)

  const activeCellMap = new Map<number, { color: string; special: Special }>()
  if (isPlaying) {
    cellsFor(active).forEach((cellIdx, j) => {
      activeCellMap.set(cellIdx, {
        color: cellColor(activeColor, active.specials[j]),
        special: active.specials[j],
      })
    })
  }

  const ghostCellMap = new Map<number, string>()
  if (isPlaying && !isPaused && ghostEnabled) {
    const gPos = ghostPosition(grid, active)
    if (gPos !== active.position) {
      cellsFor({ ...active, position: gPos }).forEach((cellIdx, j) => {
        ghostCellMap.set(cellIdx, cellColor(activeColor, active.specials[j]))
      })
    }
  }

  return (
    <div className="relative overflow-hidden bg-surface rounded-game-md border-game border-frame">
      <div className="flex flex-wrap content-start w-board-w h-board-h">
        {Array.from({ length: VISIBLE_CELLS }, (_, i) => {
          const rowStart = Math.floor(i / WIDTH) * WIDTH
          const isClearingCell = clearingRowSet.has(rowStart)
          const activeInfo = activeCellMap.get(i)
          const ghostColor = !activeInfo ? ghostCellMap.get(i) : undefined

          if (isClearingCell) {
            return <div key={i} className="w-cell h-cell rounded-game-sm bg-white animate-line-clear" />
          }

          if (clearingCellSet.has(i)) {
            return (
              <div
                key={i}
                className="w-cell h-cell rounded-game-sm animate-special-clear"
                style={{ '--flash-color': clearingColor } as React.CSSProperties}
              />
            )
          }

          if (activeInfo) {
            if (activeInfo.special) {
              const def = getPowerup(activeInfo.special)
              return (
                <div
                  key={i}
                  className="w-cell h-cell rounded-game-sm border-thin border-surface flex items-center justify-center"
                  style={{ backgroundColor: activeInfo.color }}
                >
                  <Pip kind={def.pip} color={def.pipColor} text={def.pipText} />
                </div>
              )
            }
            return (
              <div
                key={i}
                className="w-cell h-cell rounded-game-sm border-thin border-surface"
                style={{ backgroundColor: activeInfo.color }}
              />
            )
          }

          if (ghostColor) {
            return (
              <div
                key={i}
                className="w-cell h-cell rounded-game-sm border-thin border-surface opacity-25"
                style={{ backgroundColor: ghostColor }}
              />
            )
          }

          if (grid[i]) {
            return (
              <div
                key={i}
                className="w-cell h-cell rounded-game-sm border-thin border-surface"
                style={{ backgroundColor: grid[i] === GARBAGE ? GARBAGE_COLOR : grid[i]! }}
              />
            )
          }

          return <div key={i} className="w-cell h-cell" />
        })}
      </div>

      <Notifications />

      {isPaused && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-black/60 text-game-xl cursor-pointer"
          onClick={() => useGameStore.getState().togglePause()}
        >
          <span className="text-ink">PAUSED</span>
        </div>
      )}
    </div>
  )
}
