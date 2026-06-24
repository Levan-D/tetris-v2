import { COLORS } from '../game/constants'
import { useGameStore } from '../store/gameStore'
import PiecePreview from './PiecePreview'

export default function NextPiece() {
  const nextShape = useGameStore((s) => s.nextShape)
  const nextSpecials = useGameStore((s) => s.nextSpecials)
  const nextColor = useGameStore((s) => s.nextColor)

  return (
    <PiecePreview
      label="NEXT"
      shape={nextShape}
      color={COLORS[nextColor]}
      specials={nextSpecials}
    />
  )
}
