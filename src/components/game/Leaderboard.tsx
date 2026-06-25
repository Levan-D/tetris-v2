interface LeaderboardProps {
  title: string
  entries: string[]
}

export default function Leaderboard({ title, entries }: LeaderboardProps) {
  return (
    <div className="w-full flex flex-col items-center">
      <div className="text-ink text-game-md mb-xs">{title}</div>
      <div>
        {entries.map((entry, i) => (
          <div key={i} className="text-dim text-game-sm">
            {i + 1} . . . . . . . . . {entry}
          </div>
        ))}
      </div>
    </div>
  )
}
