import { useState } from 'react'
import Modal from './Modal'

const CONTROLS = [
  { key: '← →', val: 'Move' },
  { key: '↑', val: 'Rotate' },
  { key: '↓', val: 'Soft drop' },
  { key: 'Space', val: 'Hard drop' },
  { key: 'Shift/C', val: 'Hold piece' },
  { key: 'P', val: 'Pause' },
]

const SCORING = [
  { key: '1 line', val: '100' },
  { key: '2 lines', val: '300' },
  { key: '3 lines', val: '500' },
  { key: '4 lines', val: '800' },
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
  'Speed increases with score',
]

function Table({ title, rows }: { title: string; rows: { key: string; val: string }[] }) {
  return (
    <>
      <div className="text-ink text-game-md mb-xs mt-sm">
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
    </>
  )
}

export default function RulesInfo() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="cursor-pointer text-dim transition-colors hover:text-ink bg-transparent border-game border-frame rounded-full w-info h-info flex items-center justify-center text-game-sm mt-sm"
        onClick={() => setOpen(true)}
      >
        i
      </button>

      <Modal open={open} onClose={() => setOpen(false)} width="var(--spacing-modal-lg)">
        <Table title="CONTROLS" rows={CONTROLS} />
        <Table title="SCORING" rows={SCORING} />
        <Table title="BONUSES" rows={BONUSES} />
        <div className="text-ink text-game-md mb-xs mt-sm">
          MECHANICS
        </div>
        {MECHANICS.map((m) => (
          <div
            key={m}
            className="w-full text-dim text-game-xs px-xs"
            style={{ lineHeight: 'var(--text-lg)' }}
          >
            {m}
          </div>
        ))}
      </Modal>
    </>
  )
}
