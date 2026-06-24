export default function Button({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`cursor-pointer bg-action text-ink border-game border-frame rounded-game-lg h-btn-h text-game-lg px-md transition-colors hover:bg-action-hover active:bg-action-press disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
