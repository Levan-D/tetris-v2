import { useState } from "react"
import { formatTime, MODE_RULES } from "../../game/logic"
import { loadModeScores, loadModeTimes } from "../../store/persistence"
import type { GameMode } from "../../store/settingsStore"
import Modal from "../Modal"
import { Button } from "../buttons"
import Leaderboard from "../game/Leaderboard"

const MODES: { id: GameMode; label: string }[] = [
  { id: "marathon", label: "MARATHON" },
  { id: "sprint", label: "SPRINT" },
  { id: "ultra", label: "ULTRA" },
  { id: "survival", label: "SURVIVAL" },
]

function entriesFor(mode: GameMode): string[] {
  if (MODE_RULES[mode].metric === "time") {
    const times = loadModeTimes(mode)
    return Array.from({ length: 5 }, (_, i) =>
      i < times.length ? formatTime(times[i]) : "—",
    )
  }
  const scores = loadModeScores(mode)
  return Array.from({ length: 5 }, (_, i) => String(scores[i] ?? 0))
}

export default function LeaderboardsModal() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="tertiary" onClick={() => setOpen(true)}>
        LEADERBOARDS
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="LEADERBOARDS"
        footer={
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => setOpen(false)}
          >
            CLOSE
          </Button>
        }
      >
        {MODES.map((m) => (
          <Leaderboard
            key={m.id}
            title={`${m.label} · ${MODE_RULES[m.id].metric === "time" ? "TIME" : "SCORE"}`}
            entries={entriesFor(m.id)}
          />
        ))}
      </Modal>
    </>
  )
}
