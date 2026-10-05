import { Tile, type TileProps } from './Tile'
import type { LedColor } from './palette'

export type WeekCell = Omit<TileProps, 'color' | 'size'> & { key: string; weekday: string }

// Seven tiles for one habit, with optional single-letter weekday headers.
export function WeekStrip({ cells, color, showHeader = false }: { cells: WeekCell[]; color: LedColor; showHeader?: boolean }) {
  return (
    <div className="grid grid-cols-7 gap-x-2 gap-y-1.5">
      {showHeader &&
        cells.map((c) => (
          <span key={`h-${c.key}`} aria-hidden="true" className="text-center text-caption text-ink-3">
            {c.weekday}
          </span>
        ))}
      {cells.map(({ key, weekday: _weekday, ...tile }) => (
        <Tile key={key} color={color} {...tile} />
      ))}
    </div>
  )
}
