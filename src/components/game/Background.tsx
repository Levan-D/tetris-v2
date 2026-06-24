import { useEffect, useRef } from 'react'

interface Star {
  x: number
  y: number
  size: number
  speed: number
  opacity: number
  pulse: number
}

export default function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const c = canvas.getContext('2d')
    if (!c) return

    let w = 0, h = 0
    const stars: Star[] = []

    const resize = () => {
      w = canvas.width = window.innerWidth
      h = canvas.height = window.innerHeight
      if (stars.length === 0) {
        for (let i = 0; i < 60; i++) {
          stars.push({
            x: Math.random() * w,
            y: Math.random() * h,
            size: Math.random() * 1.5 + 0.5,
            speed: Math.random() * 0.15 + 0.05,
            opacity: Math.random() * 0.25 + 0.05,
            pulse: Math.random() * Math.PI * 2,
          })
        }
      }
    }
    resize()
    window.addEventListener('resize', resize)

    let id: number
    const draw = (_t: number) => {
      c.clearRect(0, 0, w, h)
      for (const s of stars) {
        s.y -= s.speed
        s.pulse += 0.008
        if (s.y < -2) { s.y = h + 2; s.x = Math.random() * w }
        const flicker = s.opacity + Math.sin(s.pulse) * 0.08
        c.fillStyle = `rgba(148,163,184,${Math.max(0, flicker)})`
        c.fillRect(Math.round(s.x), Math.round(s.y), s.size, s.size)
      }
      id = requestAnimationFrame(draw)
    }
    id = requestAnimationFrame(draw)

    return () => { cancelAnimationFrame(id); window.removeEventListener('resize', resize) }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-1 pointer-events-none" />
}
