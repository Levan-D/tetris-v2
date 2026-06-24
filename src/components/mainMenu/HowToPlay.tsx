import { useState } from 'react'
import Modal from '../Modal'
import { Button } from '../buttons'

const CONTROLS = [
  { key: '← → / A D', val: 'Move' },
  { key: '↑ / W', val: 'Rotate' },
  { key: '↓ / S', val: 'Soft drop' },
  { key: 'Space', val: 'Hard drop' },
  { key: 'Shift/C', val: 'Hold piece' },
  { key: 'P', val: 'Pause' },
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
  { key: 'Mono color line', val: '+200' },
  { key: 'Combo (consecutive)', val: '+50/chain' },
  { key: 'Back-to-back Tetris', val: '+400' },
  { key: 'Perfect clear', val: '+1000' },
  { key: 'Bomb row clear', val: '+50' },
  { key: 'Lightning col clear', val: '+50' },
]

const MECHANICS = [
  'Ghost shows landing position',
  'Hold swaps piece — once per drop',
  'Can\'t hold the same shape already held',
  '7-bag: all pieces appear before repeating',
  'Each piece gets a random color',
  'Red cells are bombs — clear the row',
  'Yellow cells are lightning — clear the column',
  'Lock delay lets you slide pieces before locking',
  'Speed increases with score',
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
          className="flex w-full justify-between text-dim text-game-xs px-xs"
          style={{ lineHeight: 'var(--text-lg)' }}
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
        footer={<Button variant="secondary" size="sm" className="w-full" onClick={() => setOpen(false)}>CLOSE</Button>}
      >
        <Table title="CONTROLS" rows={CONTROLS} />
        <Table title="SCORING" rows={SCORING} />
        <Table title="T-SPIN" rows={TSPIN} sub />
        <Table title="BONUSES" rows={BONUSES} sub />
        <div className="w-full">
          <div className="text-ink text-game-md mb-xs">MECHANICS</div>
          {MECHANICS.map((m) => (
            <div
              key={m}
              className="w-full text-dim text-game-xs px-xs"
              style={{ lineHeight: 'var(--text-lg)' }}
            >
              {m}
            </div>
          ))}
        </div>
      </Modal>
    </>
  )
}
