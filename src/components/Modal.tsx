import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  onClose?: () => void
  /** Fixed header text. Omit for a title-less modal. */
  title?: string
  /** Scrollable body content. */
  children: React.ReactNode
  /** Fixed footer — pass 0-2 buttons; they stack vertically. */
  footer?: React.ReactNode
  width?: string
}

export default function Modal({ open, onClose, title, children, footer, width }: ModalProps) {
  if (!open) return null

  // Portal to body so the overlay covers the whole viewport, not just the shell.
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex flex-col bg-shell text-ink rounded-game-lg border-game border-frame-light overflow-hidden modal-h"
        style={{ width: width ?? 'var(--spacing-modal)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <div className="shrink-0 w-full px-xs py-xs border-b-2 border-frame text-center text-game-lg">
            {title}
          </div>
        )}

        <div className="flex flex-col items-center w-full px-sm py-sm gap-sm overflow-y-auto scrollbar-game flex-1 min-h-0">
          {children}
        </div>

        {footer && (
          <div className="shrink-0 w-full px-xs py-xs border-t-2 border-frame flex flex-col items-stretch gap-xxs">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
