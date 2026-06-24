import { COLORS } from '../../game/constants'
import { useGameStore } from '../../store/gameStore'
import PiecePreview from './PiecePreview'

export default function HoldPiece() {
  const heldShape = useGameStore((s) => s.heldShape)
  const heldSpecials = useGameStore((s) => s.heldSpecials)
  const heldColor = useGameStore((s) => s.heldColor)
  const hasSwapped = useGameStore((s) => s.hasSwapped)
  const activeShape = useGameStore((s) => s.active.shape)
  const locked = heldShape !== null && (hasSwapped || activeShape === heldShape)

  return (
    <PiecePreview
      label="HOLD"
      shape={heldShape}
      color={heldShape !== null ? COLORS[heldColor] : undefined}
      specials={heldSpecials}
      dimmed={locked}
    />
  )
}
