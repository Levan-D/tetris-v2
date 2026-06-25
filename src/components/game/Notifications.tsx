import { useGameStore } from '../../store/gameStore'

/** Floating score/event popups, overlaid on the board. */
export default function Notifications() {
  const notifications = useGameStore((s) => s.notifications)
  if (notifications.length === 0) return null

  return (
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
  )
}
