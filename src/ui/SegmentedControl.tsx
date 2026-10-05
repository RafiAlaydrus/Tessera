import { useId } from 'react'
import { motion } from 'motion/react'
import { haptic } from '../motion/haptics'
import { springs } from '../motion/springs'

type Props<T extends string> = {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  label: string
}

export function SegmentedControl<T extends string>({ options, value, onChange, label }: Props<T>) {
  const id = useId()
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-full bg-surface p-1">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => {
              if (!active) haptic()
              onChange(o.value)
            }}
            className={`relative h-10 flex-1 rounded-full text-secondary font-semibold ${active ? 'text-ink' : 'text-ink-2'}`}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                transition={springs.snappy}
                className="absolute inset-0 rounded-full border border-line bg-surface-2"
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
