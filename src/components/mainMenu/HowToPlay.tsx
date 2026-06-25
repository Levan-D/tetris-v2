import { useState } from 'react'
import Modal from '../Modal'
import { Button } from '../buttons'

const CONTROLS = [
  { key: '← → / A D', val: 'Move' },
  { key: '↑ / W', val: 'Rotate' },
  { key: '↓ / S', val: 'Soft drop' },
  { key: 'Space', val: 'Hard drop' },
  { key: 'Shift / C', val: 'Hold piece' },
  { key: 'P', val: 'Pause' },
  { key: 'Click board', val: 'Resume' },
]

const MODES_INFO = [
  { key: 'Marathon', val: 'Endless' },
  { key: 'Sprint', val: '40 lines, fastest' },
  { key: 'Ultra', val: '2 min, top score' },
  { key: 'Survival', val: 'Outlast rising junk' },
]

const SCORING = [
  { key: '1 line', val: '100' },
  { key: '2 lines', val: '300' },
  { key: '3 lines', val: '500' },
  { key: '4 lines (Tetris)', val: '800' },
  { key: 'Soft drop', val: '1/cell' },
  { key: 'Hard drop', val: '2/cell' },
]

const TSPIN = [
  { key: 'T-Spin', val: '400' },
  { key: 'T-Spin Single', val: '800' },
  { key: 'T-Spin Double', val: '1200' },
  { key: 'T-Spin Triple', val: '1600' },
]

const BONUSES = [
  { key: 'Mono-color line', val: '+200/row' },
  { key: 'Combo (consecutive)', val: '+50/chain' },
  { key: 'Back-to-back', val: '+50%' },
  { key: 'Perfect clear', val: '+1000' },
  { key: 'Bomb row clear', val: '+50' },
  { key: 'Lightning col clear', val: '+50' },
]

const MECHANICS = [
  'Ghost shows where the piece will land (toggle in settings)',
  'Hold swaps the current piece — once per drop',
  'Can\'t re-hold the same shape',
  '7-bag: every piece appears before any repeats',
  'Each piece gets a random color',
  'Red cells are bombs — clear their whole row',
  'Yellow cells are lightning — clear their whole column',
  'After a bomb/lightning, blocks fall to fill the gaps',
  'T-spin: rotate a T into a tight slot (3+ corners filled)',
  'Back-to-back: chain Tetrises / T-spins for a +50% bonus',
  'Pieces kick off the walls when you rotate',
  'Lock delay: a short grace period to slide before locking',
  'Speed ramps up as your score climbs',
  'The game auto-pauses when you switch tabs',
]

function Table({ title, rows, sub }: { title: string; rows: { key: string; val: string }[]; sub?: boolean }) {
  return (
    <div className="w-full">
      <div className={`mb-xs ${sub ? 'text-dim text-game-sm' : 'text-ink text-game-md'}`}>
        {title}
      </div>
      {rows.map((r) => (
        <div
          key={r.key}
          className="flex w-full justify-between text-dim text-game-xs px-xs leading-game"
        >
          <span>{r.key}</span>
          <span>{r.val}</span>
        </div>
      ))}
    </div>
  )
}

export default function HowToPlay() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="tertiary" onClick={() => setOpen(true)}>
        HOW TO PLAY
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        width="var(--spacing-modal-lg)"
        title="HOW TO PLAY"
        footer={<Button variant="primary" size="sm" className="w-full" onClick={() => setOpen(false)}>CLOSE</Button>}
      >
        <Table title="CONTROLS" rows={CONTROLS} />
        <Table title="MODES" rows={MODES_INFO} />
        <Table title="SCORING" rows={SCORING} />
        <Table title="T-SPIN" rows={TSPIN} sub />
        <Table title="BONUSES" rows={BONUSES} sub />
        <div className="w-full">
          <div className="text-ink text-game-md mb-xs">MECHANICS</div>
          {MECHANICS.map((m) => (
            <div key={m} className="w-full text-dim text-game-xs px-xs leading-game">
              {m}
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}
