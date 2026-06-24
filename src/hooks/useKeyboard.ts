import { useEffect } from 'react'
import { useGameStore } from '../store/gameStore'

/**
 * Wires the arrow keys to the store. Move/soft-drop fire on key-down; rotate fires
 * on key-up (matching the original, so holding Up doesn't spin the piece).
 */
export function useKeyboard(): void {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const store = useGameStore.getState()
      if (!store.isPlaying) return
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          store.moveLeft()
          break
        case 'ArrowRight':
          e.preventDefault()
          store.moveRight()
          break
        case 'ArrowDown':
          e.preventDefault()
          store.tick()
          break
      }
    }

    const onKeyUp = (e: KeyboardEvent) => {
      const store = useGameStore.getState()
      if (!store.isPlaying) return
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        store.rotate()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])
}
