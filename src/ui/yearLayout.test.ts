import { describe, expect, it } from 'vitest'
import { yearLayout } from './yearLayout'

describe('yearLayout', () => {
  it('puts the end day in the last column on its weekday row (Monday start)', () => {
    const { cells } = yearLayout('2026-10-07', 1) // Wednesday
    const last = cells.at(-1)!
    expect(last).toEqual({ col: 52, row: 2, day: '2026-10-07' })
    expect(cells.filter((c) => c.col === 52)).toHaveLength(3)
    expect(cells).toHaveLength(52 * 7 + 3)
  })

  it('shifts rows with a Sunday week start', () => {
    expect(yearLayout('2026-10-07', 0).cells.at(-1)).toMatchObject({ row: 3 }) // Sun=0 ... Wed=3
    expect(yearLayout('2026-10-04', 0).cells.at(-1)).toMatchObject({ row: 0 }) // a Sunday
    expect(yearLayout('2026-10-04', 1).cells.at(-1)).toMatchObject({ row: 6 }) // same day, Monday start
  })

  it('starts on the first day of the week 52 weeks back', () => {
    const { cells } = yearLayout('2026-10-05', 1) // a Monday
    expect(cells[0]).toEqual({ col: 0, row: 0, day: '2025-10-06' })
  })

  it('includes the leap day and has no duplicate days', () => {
    const { cells } = yearLayout('2024-03-10', 1)
    expect(cells.some((c) => c.day === '2024-02-29')).toBe(true)
    expect(new Set(cells.map((c) => c.day)).size).toBe(cells.length)
  })

  it('labels each month once, on the column holding the 1st', () => {
    const { months, cells } = yearLayout('2026-10-05', 1)
    expect(months.map((m) => m.label)).toEqual(['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'])
    const nov = cells.find((c) => c.day === '2025-11-01')!
    expect(months[0].col).toBe(nov.col)
  })
})
