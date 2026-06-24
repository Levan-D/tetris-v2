export type Cell = string | null

export type Special = 'bomb' | 'lightning' | null

export interface ActivePiece {
  shape: number
  rotation: number
  position: number
  specials: Special[]
}
