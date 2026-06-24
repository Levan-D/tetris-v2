import { useGameStore } from '../../store/gameStore'
import { useSettingsStore, type GameMode } from '../../store/settingsStore'
import { hasSavedGame } from '../../store/persistence'
import { Button } from '../buttons'
import HowToPlay from './HowToPlay'
import SettingsModal from './SettingsModal'

const MODES: { id: GameMode; label: string; desc: string }[] = [
  { id: 'marathon', label: 'MARATHON', desc: 'CLASSIC ENDLESS' },
  { id: 'sprint', label: 'SPRINT', desc: '40 LINES FAST' },
  { id: 'ultra', label: 'ULTRA', desc: '2 MIN SCORE RUSH' },
]

export default function MainMenu() {
  const showMenu = useGameStore(s => s.showMenu)
  const start = useGameStore(s => s.start)
  const continueGame = useGameStore(s => s.continueGame)
  const mode = useSettingsStore(s => s.mode)
  const setMode = useSettingsStore(s => s.setMode)

  if (!showMenu) return null

  const saved = hasSavedGame(mode)

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-start gap-sm pt-lg bg-shell rounded-game-lg">
      <h1
        className="text-game-xl tracking-wider"
        style={{ color: 'var(--color-action)' }}
      >
        TETRIS
      </h1>

      <div className="flex flex-col gap-xxs" style={{ width: 'calc(var(--spacing-cell) * 12)' }}>
        {MODES.map(m => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className="px-sm py-xs rounded-game-md text-left transition-colors"
            style={{
              backgroundColor: mode === m.id ? 'var(--color-action)' : 'var(--color-surface)',
              color: mode === m.id ? 'white' : 'var(--color-dim)',
            }}
          >
            <div className="text-game-sm tracking-wide">{m.label}</div>
            <div className="text-game-xs" style={{ opacity: 0.6 }}>{m.desc}</div>
          </button>
        ))}
      </div>

      <div className="flex flex-col items-stretch" style={{ width: 'calc(var(--spacing-cell) * 12)' }}>
        <div className="flex flex-col items-stretch gap-xxs">
          {saved ? (
            <div className="flex gap-xxs">
              <Button variant="primary" size="sm" onClick={continueGame} className="flex-1">CONTINUE</Button>
              <Button variant="secondary" size="sm" onClick={start} className="flex-1">NEW GAME</Button>
            </div>
          ) : (
            <Button variant="primary" size="sm" onClick={start} className="w-full">PLAY</Button>
          )}
        </div>
        <div className="flex flex-col items-stretch gap-xs mt-sm">
          <SettingsModal />
          <HowToPlay />
        </div>
      </div>
    </div>
  )
}
