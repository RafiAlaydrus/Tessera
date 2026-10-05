import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { haptic } from '../motion/haptics'
import { sound } from '../motion/sound'
import { springs } from '../motion/springs'
import { ledVar, type LedColor } from './palette'
import { useLongPress } from './useLongPress'

export type TileState = 'off' | 'partial' | 'done' | 'skipped' | 'unscheduled'

export type TileProps = {
  state: TileState
  color: LedColor
  /** Accessible name, e.g. "Tuesday 30 September, 6 of 8 glasses". */
  label: string
  /** 0 to 1, for partial tiles: sets the meter height and one of three brightness steps. */
  progress?: number
  /** Shown inside partial tiles. */
  count?: ReactNode
  today?: boolean
  future?: boolean
  /** XP shown rising from the tile when it lights up. */
  reward?: number
  /** Pixels. Without it the tile fills its container width. */
  size?: number
  onPress?: () => void
  onLongPress?: () => void
}

const step = (p: number) => (p < 0.34 ? 28 : p < 0.67 ? 52 : 76)

export function Tile({ state, color, label, progress = 0, count, today, future, reward, size, onPress, onLongPress }: TileProps) {
  const done = state === 'done'
  const partial = state === 'partial'

  const { holding, handlers } = useLongPress({
    onPress: () => {
      haptic()
      sound('tick')
      onPress?.()
    },
    onLongPress,
  })

  // Skip the bloom, the floater and the number pop for tiles that were already in this state on mount.
  const mounted = useRef(false)
  const prev = useRef(state)
  const [float, setFloat] = useState(0)
  useEffect(() => {
    if (state === 'done' && prev.current !== 'done') setFloat((n) => n + 1)
    prev.current = state
  }, [state])
  useEffect(() => {
    mounted.current = true
  }, [])

  const style: CSSProperties & Record<'--c', string> = {
    '--c': ledVar(color),
    borderRadius: '28%',
    ...(size ? { width: size, height: size } : {}),
    ...(today ? { outline: '2px solid var(--ink)', outlineOffset: 2 } : {}),
  }

  return (
    <motion.button
      type="button"
      aria-label={label}
      disabled={future}
      whileTap={future ? undefined : { scale: 0.92 }}
      transition={springs.press}
      className={`relative block aspect-square ${size ? '' : 'w-full'} ${future ? 'opacity-45' : ''}`}
      style={style}
      {...handlers}
    >
      {state !== 'unscheduled' && <span className="absolute inset-0 rounded-[28%] bg-tile-off" />}

      {done && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-0 rounded-[28%] bg-(--c)"
          style={{ filter: 'blur(10px)' }}
          initial={{ opacity: mounted.current ? 0 : 0.4 }}
          animate={{ opacity: [0, 0.9, 0.4] }}
          transition={{ duration: mounted.current ? 0.7 : 0, times: [0, 0.3, 1] }}
        />
      )}

      <span className="absolute inset-0 overflow-hidden rounded-[28%]">
        <motion.span
          className="absolute inset-0"
          style={{ transformOrigin: 'bottom', background: `color-mix(in srgb, var(--c) ${step(progress)}%, var(--tile-off))` }}
          initial={false}
          animate={{ scaleY: partial ? progress : 0 }}
          transition={springs.snappy}
        />
        <motion.span
          className="absolute inset-0 rounded-[28%] bg-(--c)"
          initial={false}
          animate={done ? { scale: 1, opacity: 1 } : { scale: 0.4, opacity: 0 }}
          transition={done ? springs.pop : springs.press}
        />
      </span>

      <svg viewBox="0 0 100 100" aria-hidden="true" className="absolute inset-0 size-full">
        <motion.path
          d="M24 52 L43 71 L77 31"
          fill="none"
          stroke="var(--board)"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={done ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
          transition={done ? { duration: 0.25, delay: 0.1, ease: 'easeOut' } : { duration: 0.1 }}
        />
        {state === 'skipped' && (
          <path d="M28 52 L52 28 M28 72 L72 28 M48 72 L72 48" stroke="var(--ink-3)" strokeWidth="7" strokeLinecap="round" />
        )}
      </svg>

      {state === 'unscheduled' && (
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
          <span className="size-1.5 rounded-full bg-ink-3" />
        </span>
      )}

      {partial && count != null && (
        <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
          <motion.span
            key={String(count)}
            initial={mounted.current ? { scale: 1.4 } : false}
            animate={{ scale: 1 }}
            transition={springs.pop}
            className="text-secondary font-semibold text-ink"
          >
            {count}
          </motion.span>
        </span>
      )}

      {float > 0 && reward ? (
        <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 grid place-items-center">
          <motion.span
            key={float}
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-secondary font-semibold text-xp"
          >
            +{reward}
          </motion.span>
        </span>
      ) : null}

      {holding && (
        <svg viewBox="0 0 100 100" aria-hidden="true" className="pointer-events-none absolute -inset-[3px] size-[calc(100%+6px)] overflow-visible">
          <rect
            x="0" y="0" width="100" height="100" rx="28"
            fill="none" stroke="var(--ink)" strokeWidth="4" strokeLinecap="round"
            pathLength="1" strokeDasharray="1 1"
            style={{ strokeDashoffset: 1, animation: 'ring-trace 450ms linear forwards' }}
          />
        </svg>
      )}
    </motion.button>
  )
}
