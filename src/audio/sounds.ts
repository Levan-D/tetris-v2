import { useSettingsStore } from '../store/settingsStore'

let audioCtx: AudioContext | null = null

function ctx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  if (audioCtx.state === 'suspended') audioCtx.resume()
  return audioCtx
}

/** Master volume multiplier from settings (0..1). */
function master(): number {
  return useSettingsStore.getState().volume
}

function tone(freq: number, dur: number, type: OscillatorType = 'square', vol = 0.12) {
  if (master() <= 0) return
  const c = ctx()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(vol * master(), c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur)
  osc.connect(gain).connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + dur)
}

function noise(dur: number, vol = 0.1) {
  if (master() <= 0) return
  const c = ctx()
  const buf = c.createBuffer(1, c.sampleRate * dur, c.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1)
  const src = c.createBufferSource()
  src.buffer = buf
  const gain = c.createGain()
  gain.gain.setValueAtTime(vol * master(), c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur)
  src.connect(gain).connect(c.destination)
  src.start()
}

function sweep(startFreq: number, endFreq: number, dur: number, type: OscillatorType = 'sawtooth') {
  if (master() <= 0) return
  const c = ctx()
  const osc = c.createOscillator()
  const gain = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(startFreq, c.currentTime)
  osc.frequency.exponentialRampToValueAtTime(endFreq, c.currentTime + dur)
  gain.gain.setValueAtTime(0.1 * master(), c.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur)
  osc.connect(gain).connect(c.destination)
  osc.start()
  osc.stop(c.currentTime + dur)
}

export const sounds = {
  move: () => tone(200, 0.04, 'square', 0.06),
  rotate: () => tone(300, 0.05, 'square', 0.08),
  drop: () => tone(80, 0.12, 'square', 0.15),
  lock: () => tone(120, 0.08, 'triangle', 0.1),
  clear: (lines: number) => {
    if (lines >= 4) {
      tone(523, 0.08); setTimeout(() => tone(659, 0.08), 50)
      setTimeout(() => tone(784, 0.08), 100); setTimeout(() => tone(1047, 0.2), 150)
    } else {
      tone(523, 0.08); setTimeout(() => tone(659, 0.12), 60)
    }
  },
  tspin: () => {
    tone(392, 0.1, 'sawtooth'); setTimeout(() => tone(523, 0.1, 'sawtooth'), 80)
    setTimeout(() => tone(784, 0.15, 'sawtooth'), 160)
  },
  bomb: () => { noise(0.2, 0.15); tone(60, 0.2, 'sawtooth', 0.1) },
  lightning: () => sweep(2000, 200, 0.2),
  levelUp: () => {
    tone(523, 0.06); setTimeout(() => tone(659, 0.06), 60)
    setTimeout(() => tone(784, 0.06), 120); setTimeout(() => tone(1047, 0.15), 180)
  },
}
