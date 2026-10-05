import { useEffect } from 'react'
import { motion } from 'motion/react'
import { ledColors, ledVar } from '../ui/palette'
import { useUi } from '../state/ui'
import { haptic } from './haptics'
import { sound } from './sound'

/** A burst of small tiles from `origin` (an element or a point), with a tick and a pop. */
export function celebrate(origin?: Element | { x: number; y: number }) {
  haptic()
  sound('pop')
  let p = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
  if (origin instanceof Element) {
    const r = origin.getBoundingClientRect()
    p = { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  } else if (origin) p = origin
  useUi.getState().addBurst(p.x, p.y)
}

function Burst({ id, x, y }: { id: number; x: number; y: number }) {
  const remove = useUi((s) => s.removeBurst)
  useEffect(() => {
    const t = setTimeout(() => remove(id), 900)
    return () => clearTimeout(t)
  }, [id, remove])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed z-50" style={{ left: x, top: y }}>
      {Array.from({ length: 12 }, (_, i) => {
        const a = (i / 12) * Math.PI * 2
        const d = 70 + (i % 3) * 22
        return (
          <motion.span
            key={i}
            className="absolute -mt-1.5 -ml-1.5 size-3 rounded-[28%]"
            style={{ background: ledVar(ledColors[i % ledColors.length].key) }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.4 }}
            animate={{ x: Math.cos(a) * d, y: Math.sin(a) * d, opacity: 0, scale: 1, rotate: i % 2 ? 45 : -45 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        )
      })}
    </div>
  )
}

export function CelebrationHost() {
  const bursts = useUi((s) => s.bursts)
  return bursts.map((b) => <Burst key={b.id} {...b} />)
}
