import { BOMB_COLOR, COLORS, LIGHTNING_COLOR, VISIBLE_CELLS, WIDTH } from '../../game/constants'
import type { Special } from '../../game/types'
import { cellsFor, ghostPosition } from '../../game/logic'
import { useGameStore } from '../../store/gameStore'
import { useSettingsStore } from '../../store/settingsStore'

function specialColor(colorIndex: number, special: Special): string {
  if (special === 'bomb') return BOMB_COLOR
  if (special === 'lightning') return LIGHTNING_COLOR
  return COLORS[colorIndex]
}

export default function Board() {
  const grid = useGameStore((s) => s.grid)
  const active = useGameStore((s) => s.active)
  const activeColor = useGameStore((s) => s.activeColor)
  const isPlaying = useGameStore((s) => s.isPlaying)
  const isPaused = useGameStore((s) => s.isPaused)
  const clearingRows = useGameStore((s) => s.clearingRows)
  const clearingBombCells = useGameStore((s) => s.clearingBombCells)
  const clearingLightningCells = useGameStore((s) => s.clearingLightningCells)
  const notifications = useGameStore((s) => s.notifications)
  const ghostEnabled = useSettingsStore((s) => s.ghostEnabled)

  const clearingRowSet = new Set(clearingRows)
  const bombClearSet = new Set(clearingBombCells)
  const lightningClearSet = new Set(clearingLightningCells)

  const activeCellMap = new Map<number, { color: string; special: Special }>()
  if (isPlaying) {
    cellsFor(active).forEach((cellIdx, j) => {
      activeCellMap.set(cellIdx, {
        color: specialColor(activeColor, active.specials[j]),
        special: active.specials[j],
      })
    })
  }

  const ghostCellMap = new Map<number, string>()
  if (isPlaying && !isPaused && ghostEnabled) {
    const gPos = ghostPosition(grid, active)
    if (gPos !== active.position) {
      cellsFor({ ...active, position: gPos }).forEach((cellIdx, j) => {
        ghostCellMap.set(cellIdx, specialColor(activeColor, active.specials[j]))
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

          if (bombClearSet.has(i)) {
            return <div key={i} className="w-cell h-cell rounded-game-sm animate-bomb-clear" />
          }

          if (lightningClearSet.has(i)) {
            return <div key={i} className="w-cell h-cell rounded-game-sm animate-lightning-clear" />
          }

          if (activeInfo) {
            if (activeInfo.special) {
              return (
                <div
                  key={i}
                  className="w-cell h-cell rounded-game-sm border-thin border-surface flex items-center justify-center"
                  style={{ backgroundColor: activeInfo.color }}
                >
                  <div style={{
                    width: activeInfo.special === 'bomb' ? '40%' : '15%',
                    height: activeInfo.special === 'bomb' ? '40%' : '65%',
                    backgroundColor: activeInfo.special === 'bomb' ? '#fecaca' : '#fef9c3',
                    borderRadius: activeInfo.special === 'bomb' ? '50%' : 'var(--radius-game-sm)',
                  }} />
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
                style={{ backgroundColor: grid[i]! }}
              />
            )
          }

          return <div key={i} className="w-cell h-cell" />
        })}
      </div>

      {notifications.length > 0 && (
        <div className="pointer-events-none absolute inset-0">
          {notifications.map((n, i) => (
            <div
              key={n.id}
              className="absolute left-1/2 whitespace-nowrap text-game-md animate-bonus-popup"
              style={{
                top: `calc(35% + ${i * 1.8} * var(--spacing-cell))`,
                color: n.color,
                textShadow: '0 0 calc(var(--spacing-cell) * 0.4) rgba(0,0,0,0.9)',
              }}
            >
              {n.text}
            </div>
          ))}
        </div>
      )}

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
