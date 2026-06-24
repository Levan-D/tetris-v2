/** A board cell: a CSS colour string when filled, or `null` when empty. */
export type Cell = string | null

/** The piece currently falling, described by shape, rotation state and anchor. */
export interface ActivePiece {
  /** Index into `TETROMINOES` / `COLORS`. */
  shape: number
  /** Which of the four rotation states is active (0–3). */
  rotation: number
  /** Anchor cell index on the flat board array. */
  position: number
}
