import confetti from 'canvas-confetti'

const PIECE_COLORS = ['#7dd3fc', '#fcd34d', '#6ee7b7', '#c4b5fd', '#f9a8d4', '#fdba74', '#fda4af']

export function lineClearParticles(lines: number) {
  confetti({
    particleCount: lines * 12,
    spread: 50 + lines * 10,
    startVelocity: 20,
    gravity: 0.8,
    origin: { x: 0.4, y: 0.65 },
    colors: PIECE_COLORS,
    scalar: 0.7,
  })
}

export function bombParticles() {
  confetti({
    particleCount: 25,
    spread: 100,
    startVelocity: 25,
    gravity: 1,
    origin: { x: 0.4, y: 0.6 },
    colors: ['#ef4444', '#fca5a5', '#f97316'],
    scalar: 0.8,
  })
}

export function lightningParticles() {
  confetti({
    particleCount: 15,
    spread: 40,
    startVelocity: 30,
    gravity: 0.6,
    origin: { x: 0.4, y: 0.5 },
    colors: ['#eab308', '#fef9c3', '#ffffff'],
    scalar: 0.6,
  })
}

export function tSpinParticles() {
  confetti({
    particleCount: 30,
    spread: 80,
    startVelocity: 22,
    gravity: 0.7,
    origin: { x: 0.4, y: 0.6 },
    colors: ['#c4b5fd', '#818cf8', '#a78bfa'],
    scalar: 0.7,
  })
}
