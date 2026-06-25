import { useState } from "react"
import { useSettingsStore } from "../../store/settingsStore"
import { sounds } from "../../audio/sounds"
import Modal from "../Modal"
import { Button, TogglePill } from "../buttons"

function SettingRow({
  title,
  desc,
  on,
  onToggle,
}: {
  title: string
  desc: string
  on: boolean
  onToggle: () => void
}) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-sm">
        <div className="flex flex-col">
          <span className="text-ink text-game-sm">{title}</span>
          <span className="text-dim text-game-xs opacity-70">{desc}</span>
        </div>
        <TogglePill label={on ? "ON" : "OFF"} on={on} onClick={onToggle} />
      </div>
    </div>
  )
}

export default function SettingsModal() {
  const [open, setOpen] = useState(false)
  const {
    soundEnabled,
    toggleSound,
    volume,
    setVolume,
    particlesEnabled,
    toggleParticles,
    ghostEnabled,
    toggleGhost,
    powerupsEnabled,
    togglePowerups,
  } = useSettingsStore()

  return (
    <>
      <Button variant="tertiary" onClick={() => setOpen(true)}>
        SETTINGS
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="SETTINGS"
        footer={
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => setOpen(false)}
          >
            DONE
          </Button>
        }
      >
        <div
          className={`w-full transition-opacity ${soundEnabled ? "" : "opacity-35 pointer-events-none"}`}
        >
          <span className="text-ink text-game-sm">VOLUME</span>
          <div className="flex items-center gap-sm mt-xs">
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(volume * 100)}
              onChange={(e) => setVolume(Number(e.target.value) / 100)}
              onMouseUp={() => soundEnabled && sounds.lock()}
              className="flex-1 cursor-pointer accent-ink"
            />
            <span className="text-dim text-game-xs w-num text-right">
              {Math.round(volume * 100)}
            </span>
          </div>
        </div>

        <SettingRow
          title="SOUND EFFECTS"
          desc="Drops, clears, specials"
          on={soundEnabled}
          onToggle={toggleSound}
        />

        <SettingRow
          title="PARTICLES"
          desc="Confetti bursts on clears"
          on={particlesEnabled}
          onToggle={toggleParticles}
        />

        <SettingRow
          title="GHOST PIECE"
          desc="Shows where the piece lands"
          on={ghostEnabled}
          onToggle={toggleGhost}
        />

        <SettingRow
          title="POWER-UPS"
          desc="Bomb & lightning pieces"
          on={powerupsEnabled}
          onToggle={togglePowerups}
        />
      </Modal>
    </>
  )
}
