import { useEffect, useRef } from 'react'

// Tetromino block layouts as [col, row] cell offsets.
const SHAPES: [number, number][][] = [
  [[0, 0], [1, 0], [2, 0], [3, 0]], // I
  [[0, 0], [1, 0], [0, 1], [1, 1]], // O
  [[0, 0], [1, 0], [2, 0], [1, 1]], // T
  [[0, 0], [1, 0], [2, 0], [2, 1]], // L
  [[0, 0], [1, 0], [2, 0], [0, 1]], // J
  [[1, 0], [2, 0], [0, 1], [1, 1]], // S
  [[0, 0], [1, 0], [1, 1], [2, 1]], // Z
]

const COLORS = ['#7dd3fc', '#fcd34d', '#6ee7b7', '#c4b5fd', '#f9a8d4', '#fdba74', '#fda4af']

interface Piece {
  x: number
  y: number
  shape: [number, number][]
  size: number
  speed: number
  drift: number
  angle: number
  spin: number
  opacity: number
  color: string
}

/** Subtle drifting / slowly-rotating tetromino field behind the main menu. */
export default function MenuBackground() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    const pieces: Piece[] = []
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const makePiece = (atBottom = false): Piece => ({
      x: Math.random() * w,
      y: atBottom ? h + 40 : Math.random() * h,
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      size: 12 + Math.random() * 16,
      speed: 0.1 + Math.random() * 0.25,
      drift: (Math.random() - 0.5) * 0.15,
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.004,
      opacity: 0.05 + Math.random() * 0.07,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    })

    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = canvas.width = Math.max(1, rect.width)
      h = canvas.height = Math.max(1, rect.height)
      if (pieces.length === 0) {
        for (let i = 0; i < 14; i++) pieces.push(makePiece())
      }
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    const drawPiece = (p: Piece) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      ctx.globalAlpha = p.opacity
      ctx.fillStyle = p.color
      const s = p.size - 1.5
      const r = s * 0.22
      for (const [cx, cy] of p.shape) {
        ctx.beginPath()
        ctx.roundRect(cx * p.size, cy * p.size, s, s, r)
        ctx.fill()
      }
      ctx.restore()
    }

    let id = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      for (const p of pieces) {
        p.y -= p.speed
        p.x += p.drift
        p.angle += p.spin
        if (p.y < -60) Object.assign(p, makePiece(true))
        drawPiece(p)
      }
      id = requestAnimationFrame(draw)
    }

    if (reduced) {
      // honor reduced-motion: paint a single static frame
      ctx.clearRect(0, 0, w, h)
      for (const p of pieces) drawPiece(p)
    } else {
      id = requestAnimationFrame(draw)
    }

    return () => {
      cancelAnimationFrame(id)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />
}
