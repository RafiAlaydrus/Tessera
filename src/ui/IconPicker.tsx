import { useMemo, useState } from 'react'
import { haptic } from '../motion/haptics'
import { habitIcons, HabitIcon } from './icons'
import type { LedColor } from './palette'
import { TextField } from './TextField'

export function IconPicker({ value, onChange, color }: { value: string; onChange: (name: string) => void; color: LedColor }) {
  const [query, setQuery] = useState('')
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return q ? habitIcons.filter((i) => `${i.name} ${i.words}`.includes(q)) : habitIcons
  }, [query])

  return (
    <div>
      <TextField label="Search icons" type="search" value={query} onChange={setQuery} placeholder="Water, read, gym" />
      {shown.length === 0 ? (
        <p className="mt-4 text-body text-ink-2">No icons match. Try another word.</p>
      ) : (
        <div role="radiogroup" aria-label="Icon" className="mt-3 grid max-h-64 grid-cols-5 gap-2 overflow-y-auto">
          {shown.map((i) => {
            const active = i.name === value
            return (
              <button
                key={i.name}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={i.name.replace(/-/g, ' ')}
                onClick={() => {
                  haptic()
                  onChange(i.name)
                }}
                className={`grid aspect-square place-items-center rounded-input ${active ? 'bg-surface-2' : 'bg-surface'}`}
                style={active ? { outline: '2px solid var(--ink)', outlineOffset: -2 } : undefined}
              >
                <HabitIcon name={i.name} color={active ? color : 'ice'} size={26} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
