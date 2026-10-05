import { useRef, useState, type MouseEvent, type PointerEvent } from 'react'
import { haptic } from '../motion/haptics'

type Options = { onPress?: () => void; onLongPress?: () => void; delay?: number; slop?: number }

// Press fires on pointer-up. Holding for `delay` ms fires onLongPress (with a tick) instead.
// Moving more than `slop` px cancels both. Keyboard activation (click with detail 0) counts as a press.
export function useLongPress({ onPress, onLongPress, delay = 450, slop = 8 }: Options) {
  const [holding, setHolding] = useState(false)
  const timer = useRef<number>(undefined)
  const start = useRef<{ x: number; y: number } | null>(null)
  const fired = useRef(false)

  const cancel = () => {
    clearTimeout(timer.current)
    start.current = null
    setHolding(false)
  }

  return {
    holding,
    handlers: {
      onPointerDown: (e: PointerEvent) => {
        if (e.button !== 0) return
        start.current = { x: e.clientX, y: e.clientY }
        fired.current = false
        if (!onLongPress) return
        setHolding(true)
        timer.current = window.setTimeout(() => {
          fired.current = true
          start.current = null
          setHolding(false)
          haptic()
          onLongPress()
        }, delay)
      },
      onPointerMove: (e: PointerEvent) => {
        const s = start.current
        if (s && Math.hypot(e.clientX - s.x, e.clientY - s.y) > slop) cancel()
      },
      onPointerUp: () => {
        const pressed = start.current && !fired.current
        cancel()
        if (pressed) onPress?.()
      },
      onPointerCancel: cancel,
      onClick: (e: MouseEvent) => {
        if (e.detail === 0) onPress?.()
      },
      onContextMenu: (e: MouseEvent) => e.preventDefault(),
    },
  }
}
