import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Two-step confirm for destructive actions: the first `trigger()` arms it
 * (`confirming` becomes true) and a second `trigger()` within `timeout` runs
 * the action. Auto-disarms after the timeout.
 */
export function useConfirm(action: () => void, timeout = 2000) {
  const [confirming, setConfirming] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const reset = useCallback(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null }
    setConfirming(false)
  }, [])

  useEffect(() => reset, [reset])

  const trigger = useCallback(() => {
    if (confirming) {
      reset()
      action()
    } else {
      setConfirming(true)
      timerRef.current = setTimeout(() => setConfirming(false), timeout)
    }
  }, [confirming, action, reset, timeout])

  return { confirming, trigger, reset }
}
