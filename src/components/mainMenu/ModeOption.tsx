interface ModeOptionProps {
  label: string
  desc: string
  active: boolean
  onClick: () => void
}

export default function ModeOption({ label, desc, active, onClick }: ModeOptionProps) {
  return (
    <button
      onClick={onClick}
      className={`px-sm py-xs rounded-game-md text-left transition-colors bg-surface border-thick ${
        active ? 'border-action' : 'border-transparent'
      }`}
    >
      <div className="text-ink text-game-sm tracking-wide">{label}</div>
      <div className="text-dim text-game-xs">{desc}</div>
    </button>
  )
}
