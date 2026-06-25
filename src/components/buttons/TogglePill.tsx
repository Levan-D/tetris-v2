interface TogglePillProps {
  label: string
  on: boolean
  onClick: () => void
}

export default function TogglePill({ label, on, onClick }: TogglePillProps) {
  return (
    <button
      onClick={onClick}
      className={`px-sm py-xxs rounded-game-md text-game-xs transition-colors ${
        on ? 'bg-action text-ink' : 'bg-surface text-dim'
      }`}
    >
      {label}
    </button>
  )
}
