interface ModalProps {
  open: boolean
  onClose?: () => void
  children: React.ReactNode
  width?: string
}

export default function Modal({ open, onClose, children, width }: ModalProps) {
  if (!open) return null

  return (
    <div
      className="absolute inset-0 z-10 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex flex-col items-center bg-shell text-ink rounded-game-lg border-game border-frame-light overflow-hidden"
        style={{ width: width ?? 'var(--spacing-modal)', maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center w-full px-sm py-md overflow-y-auto scrollbar-game">
          {children}
        </div>
      </div>
    </div>
  )
}
