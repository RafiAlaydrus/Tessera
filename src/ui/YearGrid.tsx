import { memo, useLayoutEffect, useMemo, useRef, type CSSProperties } from 'react'
import { ledVar, type LedColor } from './palette'
import { yearLayout } from './yearLayout'

export type YearLevel = 0 | 1 | 2 | 3 | 4 | 'skip'

const CELL = 12
const GAP = 3
const STEP = CELL + GAP
const TOP = 18 // room for month labels

type Props = {
  /** Level per day key. Missing days draw as unlit tiles. */
  levels: Record<string, YearLevel>
  endDay: string
  weekStart?: 0 | 1
  color: LedColor
  label: string
}

// 53 weeks x 7 days in one SVG. Scrolls horizontally and starts at the current week.
export const YearGrid = memo(function YearGrid({ levels, endDay, weekStart = 1, color, label }: Props) {
  const { cells, months } = useMemo(() => yearLayout(endDay, weekStart), [endDay, weekStart])
  const scroller = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    scroller.current!.scrollLeft = scroller.current!.scrollWidth
  }, [endDay])

  const width = 53 * STEP - GAP
  return (
    <div ref={scroller} className="overflow-x-auto overscroll-x-contain [scrollbar-width:none]">
      <svg
        role="img"
        aria-label={label}
        width={width}
        height={TOP + 7 * STEP - GAP}
        style={{ '--c': ledVar(color), display: 'block' } as CSSProperties}
      >
        {months.map((m) => (
          <text key={m.col} x={m.col * STEP} y={11} fontSize="12" fill="var(--ink-3)">
            {m.label}
          </text>
        ))}
        {cells.map((c) => {
          const lv = levels[c.day]
          return (
            <rect
              key={c.day}
              className={`yg-cell${lv ? ` yg-${lv}` : ''}`}
              style={{ '--i': c.col } as CSSProperties}
              x={c.col * STEP}
              y={TOP + c.row * STEP}
              width={CELL}
              height={CELL}
              rx={CELL * 0.28}
            />
          )
        })}
      </svg>
    </div>
  )
})
