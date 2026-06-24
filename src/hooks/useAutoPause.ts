import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

/**
 * Pauses an in-progress game when the tab/window loses focus or is hidden,
 * and resumes it on return — but only if WE paused it (a manual pause is
 * left untouched).
 */
export function useAutoPause(): void {
  useEffect(() => {
    let autoPaused = false

    const pause = () => {
      const s = useGameStore.getState()
      if (s.isPlaying && !s.isPaused && !s.showMenu) {
        s.togglePause()
        autoPaused = true
      }
    }

    const resume = () => {
      const s = useGameStore.getState()
      if (autoPaused && s.isPlaying && s.isPaused) {
        s.togglePause()
      }
      autoPaused = false
    }

    const onVisibility = () => {
      if (document.hidden) pause()
      else resume()
    }

    window.addEventListener('blur', pause)
    window.addEventListener('focus', resume)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('blur', pause)
      window.removeEventListener('focus', resume)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])
}
