import type { ReactNode } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { haptic } from '../motion/haptics'
import { springs } from '../motion/springs'

export type SwipeAction = { label: string; icon?: ReactNode; onTrigger: () => void; destructive?: boolean }

const W = 80 // width of one trailing action
const TRIGGER = 96 // swipe-right distance that fires the leading action

// Swipe right past TRIGGER fires `leading` (complete). Swipe left reveals `trailing` buttons (reschedule, delete).
export function SwipeRow({ leading, trailing = [], children }: { leading?: SwipeAction; trailing?: SwipeAction[]; children: ReactNode }) {
  const x = useMotionValue(0)
  // Action layers sit under the row; keep them invisible at rest so they never bleed through rounded corners.
  const leadingOpacity = useTransform(x, [0, 8], [0, 1])
  const trailingOpacity = useTransform(x, [0, -8], [0, 1])
  const open = W * trailing.length
  const settle = (to: number) => animate(x, to, springs.snappy)

  return (
    <div className="relative overflow-hidden">
      {leading && (
        <motion.div
          aria-hidden="true"
          style={{ opacity: leadingOpacity }}
          className="absolute inset-y-0 left-0 flex w-full items-center gap-2 bg-ink px-5 text-body font-semibold text-board"
        >
          {leading.icon}
          {leading.label}
        </motion.div>
      )}
      <motion.div style={{ opacity: trailingOpacity }} className="absolute inset-y-0 right-0 flex">
        {trailing.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => {
              settle(0)
              a.onTrigger()
            }}
            className={`flex flex-col items-center justify-center gap-1 text-caption font-semibold ${a.destructive ? 'bg-ember text-board' : 'bg-surface-2 text-ink'}`}
            style={{ width: W }}
          >
            {a.icon}
            {a.label}
          </button>
        ))}
      </motion.div>
      <motion.div
        drag="x"
        dragDirectionLock
        dragConstraints={{ left: -open, right: leading ? 160 : 0 }}
        dragElastic={0.1}
        style={{ x, touchAction: 'pan-y' }}
        onDragEnd={() => {
          const cur = x.get()
          if (leading && cur > TRIGGER) {
            haptic()
            leading.onTrigger()
            settle(0)
          } else settle(open && cur < -open / 2 ? -open : 0)
        }}
        onClick={() => x.get() < -1 && settle(0)}
        className="relative bg-surface"
      >
        {children}
      </motion.div>
    </div>
  )
}
