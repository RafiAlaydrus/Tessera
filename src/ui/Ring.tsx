import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { springs } from '../motion/springs'
import { ledVar, type LedColor } from './palette'

type Props = { value: number; size?: number; stroke?: number; color?: LedColor | 'xp' | 'ink'; label: string; children?: ReactNode }

const stroke_ = (c: NonNullable<Props['color']>) => (c === 'xp' || c === 'ink' ? `var(--${c})` : ledVar(c))

// Progress ring, 0 to 1. Children sit in the middle.
export function Ring({ value, size = 56, stroke = 5, color = 'ink', label, children }: Props) {
  const r = (size - stroke) / 2
  return (
    <div role="img" aria-label={`${label}, ${Math.round(value * 100)}%`} className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--tile-off)" strokeWidth={stroke} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={stroke_(color)} strokeWidth={stroke} strokeLinecap="round"
          initial={false} animate={{ pathLength: Math.min(1, Math.max(0, value)) }} transition={springs.snappy}
        />
      </svg>
      <span className="relative">{children}</span>
    </div>
  )
}
