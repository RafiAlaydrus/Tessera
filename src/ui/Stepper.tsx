import { Minus, Plus } from '@phosphor-icons/react'
import { haptic } from '../motion/haptics'
import { Odometer } from './Odometer'

type Props = { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; unit?: string; label: string }

export function Stepper({ value, onChange, min = 0, max = 999, step = 1, unit, label }: Props) {
  const set = (v: number) => {
    const next = Math.min(max, Math.max(min, v))
    if (next === value) return
    haptic()
    onChange(next)
  }
  const btn = 'grid size-12 place-items-center rounded-full text-ink disabled:text-ink-3'
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-full bg-surface">
      <button type="button" aria-label="Decrease" disabled={value <= min} onClick={() => set(value - step)} className={btn}>
        <Minus size={20} />
      </button>
      <span className="flex min-w-16 items-baseline justify-center gap-1 text-row font-semibold">
        <Odometer value={value} />
        {unit && <span className="text-secondary font-normal text-ink-2">{unit}</span>}
      </span>
      <button type="button" aria-label="Increase" disabled={value >= max} onClick={() => set(value + step)} className={btn}>
        <Plus size={20} />
      </button>
    </div>
  )
}
