import { Check } from '@phosphor-icons/react'
import { haptic } from '../motion/haptics'
import { ledColors, ledVar, type LedColor } from './palette'

export function ColorPicker({ value, onChange, label = 'Color' }: { value: LedColor; onChange: (c: LedColor) => void; label?: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-3">
      {ledColors.map((c) => {
        const active = c.key === value
        return (
          <button
            key={c.key}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={c.name}
            onClick={() => {
              haptic()
              onChange(c.key)
            }}
            className="relative grid size-11 place-items-center rounded-[28%]"
            style={{ background: ledVar(c.key), outline: active ? '2px solid var(--ink)' : undefined, outlineOffset: 2 }}
          >
            {active && <Check size={20} weight="bold" color="var(--board)" />}
          </button>
        )
      })}
    </div>
  )
}
