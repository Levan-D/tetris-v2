import type { PipKind } from '../../game/powerups'

interface PipProps {
  kind: PipKind
  color: string
  text?: string
}

/** The little marker drawn on a cell that carries a power-up. Scales with the cell. */
export default function Pip({ kind, color, text }: PipProps) {
  switch (kind) {
    case 'circle':
      return <div style={{ width: '40%', height: '40%', backgroundColor: color, borderRadius: '50%' }} />
    case 'bar':
      return <div style={{ width: '15%', height: '65%', backgroundColor: color, borderRadius: 'var(--radius-game-sm)' }} />
    case 'plus':
      return (
        <svg viewBox="0 0 10 10" style={{ width: '62%', height: '62%' }}>
          <rect x="4" y="0" width="2" height="10" fill={color} />
          <rect x="0" y="4" width="10" height="2" fill={color} />
        </svg>
      )
    case 'arrow':
      return (
        <svg viewBox="0 0 10 10" style={{ width: '55%', height: '55%' }}>
          <path d="M1 2 H9 L5 8 Z" fill={color} />
        </svg>
      )
    case 'text':
      return (
        <svg viewBox="0 0 10 10" style={{ width: '80%', height: '80%' }}>
          <text
            x="5"
            y="5"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="8"
            fontWeight="bold"
            fill={color}
          >
            {text}
          </text>
        </svg>
      )
  }
}
