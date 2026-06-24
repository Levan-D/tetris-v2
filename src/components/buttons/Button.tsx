export type ButtonVariant = 'primary' | 'secondary' | 'tertiary'
export type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
}

const BASE = 'cursor-pointer transition-colors disabled:cursor-not-allowed disabled:opacity-60'

// Color / border only — geometry comes from SIZES
const COLORS: Record<ButtonVariant, string> = {
  primary: 'bg-action text-ink border-game border-frame hover:bg-action-hover active:bg-action-press',
  secondary: 'bg-surface text-ink border-game border-frame hover:bg-surface-2 active:bg-frame',
  tertiary: 'text-dim hover:text-ink tracking-wide',
}

// Geometry for filled (primary/secondary) buttons
const SIZES: Record<ButtonSize, string> = {
  sm: 'h-btn-h-sm text-game-xs px-sm rounded-game-md',
  md: 'h-btn-h-md text-game-md px-md rounded-game-md',
  lg: 'h-btn-h text-game-lg px-md rounded-game-lg',
}

// Tertiary is text-only; size just scales the text
const TERTIARY_SIZES: Record<ButtonSize, string> = {
  sm: 'text-game-xs px-xs',
  md: 'text-game-sm px-xs',
  lg: 'text-game-md px-sm',
}

export default function Button({ variant = 'primary', size, className = '', ...props }: ButtonProps) {
  // Filled buttons default to lg; tertiary stays small unless told otherwise
  const resolved = size ?? (variant === 'tertiary' ? 'sm' : 'lg')
  const geometry = variant === 'tertiary' ? TERTIARY_SIZES[resolved] : SIZES[resolved]
  return (
    <button
      type="button"
      className={`${BASE} ${COLORS[variant]} ${geometry} ${className}`}
      {...props}
    />
  )
}
