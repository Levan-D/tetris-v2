import { useGameStore } from '../../store/gameStore'
import { useSettingsStore, type GameMode } from '../../store/settingsStore'
import { hasSavedGame } from '../../store/persistence'
import { Button } from '../buttons'
import HowToPlay from './HowToPlay'
import LeaderboardsModal from './LeaderboardsModal'
import MenuBackground from './MenuBackground'
import ModeOption from './ModeOption'
import SettingsModal from './SettingsModal'

const MODES: { id: GameMode; label: string; desc: string }[] = [
  { id: 'marathon', label: 'MARATHON', desc: 'CLASSIC ENDLESS' },
  { id: 'sprint', label: 'SPRINT', desc: '40 LINES FAST' },
  { id: 'ultra', label: 'ULTRA', desc: '2 MIN SCORE RUSH' },
  { id: 'survival', label: 'SURVIVAL', desc: 'OUTLAST RISING JUNK' },
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
    <div className="absolute inset-0 z-50 bg-shell rounded-game-lg overflow-hidden">
      <MenuBackground />
      <div className="absolute inset-0 flex flex-col items-center justify-start gap-sm pt-lg">
      <h1 className="text-game-xl tracking-wider text-action">
        TETRIS
      </h1>

      <div className="flex flex-col gap-xxs w-menu-col">
        {MODES.map(m => (
          <ModeOption
            key={m.id}
            label={m.label}
            desc={m.desc}
            active={mode === m.id}
            onClick={() => setMode(m.id)}
          />
        ))}
      </div>

      <div className="flex flex-col items-stretch w-menu-col">
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
          <LeaderboardsModal />
          <SettingsModal />
          <HowToPlay />
        </div>
      </div>
      </div>
    </div>
  )
}
