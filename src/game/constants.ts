/** Board is 10 columns wide. */
export const WIDTH = 10

/** 20 visible rows. */
export const VISIBLE_CELLS = WIDTH * 20

/**
 * Total cells = 20 visible rows + 1 hidden "floor" row. The floor row is never
 * rendered; it exists only so collision checks have something solid to land on.
 */
export const CELL_COUNT = WIDTH * 21

/** Sentinel stored in the hidden floor cells — blocks movement, never drawn. */
export const FLOOR = 'floor'

/** One pastel colour per tetromino, indexed by shape. */
export const COLORS = ['#9ADCFF', '#FFF89A', '#FFBF86', '#FF8AAE', '#C1F4C5']

const w = WIDTH

/**
 * The five tetrominoes this game uses — L, Z, T, O, I (no J or S, faithful to
 * the original). Each shape has four rotation states; each state lists the four
 * cell offsets from the piece's anchor position.
 */
export const TETROMINOES: number[][][] = [
  // L
  [
    [1, w + 1, w * 2 + 1, 2],
    [w, w + 1, w + 2, w * 2 + 2],
    [1, w + 1, w * 2 + 1, w * 2],
    [w, w * 2, w * 2 + 1, w * 2 + 2],
  ],
  // Z
  [
    [0, w, w + 1, w * 2 + 1],
    [w + 1, w + 2, w * 2, w * 2 + 1],
    [0, w, w + 1, w * 2 + 1],
    [w + 1, w + 2, w * 2, w * 2 + 1],
  ],
  // T
  [
    [1, w, w + 1, w + 2],
    [1, w + 1, w + 2, w * 2 + 1],
    [w, w + 1, w + 2, w * 2 + 1],
    [1, w, w + 1, w * 2 + 1],
  ],
  // O
  [
    [0, 1, w, w + 1],
    [0, 1, w, w + 1],
    [0, 1, w, w + 1],
    [0, 1, w, w + 1],
  ],
  // I
  [
    [1, w + 1, w * 2 + 1, w * 3 + 1],
    [w, w + 1, w + 2, w + 3],
    [1, w + 1, w * 2 + 1, w * 3 + 1],
    [w, w + 1, w + 2, w + 3],
  ],
]

/** Width of the 4x4 "up next" preview grid. */
export const PREVIEW_WIDTH = 4

const d = PREVIEW_WIDTH

/** Cell offsets for drawing each shape in the preview panel, indexed by shape. */
export const UP_NEXT: number[][] = [
  [1, d + 1, d * 2 + 1, 2], // L
  [0, d, d + 1, d * 2 + 1], // Z
  [1, d, d + 1, d + 2], // T
  [0, 1, d, d + 1], // O
  [1, d + 1, d * 2 + 1, d * 3 + 1], // I
]

/** Snarky game-over messages, picked at random. Original spelling preserved. */
export const REMARKS = [
  "EEESH, IS THAT ALL YOU CAN DO?",
  "MAYBE YOU SHOULD TRY AN EASIER GAME?",
  "MY CODE CAN'T HANDLE SUCH INSOLENCE",
  "I THINK YOU NEED TO TAKE A 10 MIN BREAK",
  "YOU SULLY MY CODE WITH SUCH DREADFUL PLAYS",
  "PUNY MORTAL, YOU FAIL TO AMUSE ME",
  "CRY TO YOUR MOMMY WITH SUCH PATHETIC SCORE",
  "EVEN A NOCTURAL VERMIN WITH ZERO OPPOSABLE THUMBS CAN OUTPLAY YOU",
  "WE ALL MAKE CHOICES IN LIFE, YOU`VE SEEM TO HAVE MADE ALL THE BAD ONES",
  "BELIEVING YOU ARE GOOD AT GAMES DOES NOT MEAN YOU ARE",
  "DON`T WISH FOR THE GAME TO BE EASIER, WISH THAT YOU WERE BETTER",
  "TRUST ME, JUST GIVE UP",
  "AAAAAAAAAAAAHHHRHGHHHGH, YOU`VE JUST BORED ME TO DEATH",
]
