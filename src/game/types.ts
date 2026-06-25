export type Cell = string | null

/** Every power-up a piece-cell can carry. See game/powerups.ts for the registry. */
export type PowerupId =
  | 'bomb'
  | 'lightning'
  | 'laser'
  | 'gravity'
  | 'mult2'
  | 'mult4'
  | 'mult8'

export type Special = PowerupId | null

export interface ActivePiece {
  shape: number
  rotation: number
  position: number
  specials: Special[]
}
