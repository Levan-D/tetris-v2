import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type GameMode = 'marathon' | 'sprint' | 'ultra' | 'survival'

interface Settings {
  mode: GameMode
  soundEnabled: boolean
  volume: number
  particlesEnabled: boolean
  ghostEnabled: boolean
  powerupsEnabled: boolean
  setMode: (mode: GameMode) => void
  toggleSound: () => void
  setVolume: (volume: number) => void
  toggleParticles: () => void
  toggleGhost: () => void
  togglePowerups: () => void
}

export const useSettingsStore = create<Settings>()(persist((set) => ({
  mode: 'marathon' as GameMode,
  soundEnabled: true,
  volume: 0.6,
  particlesEnabled: true,
  ghostEnabled: true,
  powerupsEnabled: true,
  setMode: (mode) => set({ mode }),
  toggleSound: () => set((s) => ({ soundEnabled: !s.soundEnabled })),
  setVolume: (volume) => set({ volume: Math.max(0, Math.min(1, volume)) }),
  toggleParticles: () => set((s) => ({ particlesEnabled: !s.particlesEnabled })),
  toggleGhost: () => set((s) => ({ ghostEnabled: !s.ghostEnabled })),
  togglePowerups: () => set((s) => ({ powerupsEnabled: !s.powerupsEnabled })),
}), { name: 'tetris-settings' }))
