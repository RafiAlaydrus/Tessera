// Pure layout for the year grid: week columns, day rows, month label positions.
// Days are local YYYY-MM-DD keys; arithmetic runs in UTC so DST never shifts a day.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY = 86_400_000

const parse = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}
const format = (ms: number) => new Date(ms).toISOString().slice(0, 10)

export type YearCell = { col: number; row: number; day: string }

/** `weekStart` is 0 for Sunday or 1 for Monday. The last column is the week containing `endDay`. */
export function yearLayout(endDay: string, weekStart: 0 | 1, weeks = 53) {
  const end = parse(endDay)
  const endRow = (new Date(end).getUTCDay() - weekStart + 7) % 7
  const first = end - endRow * DAY - (weeks - 1) * 7 * DAY

  const cells: YearCell[] = []
  const months: { col: number; label: string }[] = []
  for (let col = 0; col < weeks; col++) {
    for (let row = 0; row < 7; row++) {
      const ms = first + (col * 7 + row) * DAY
      if (ms > end) break
      const day = format(ms)
      cells.push({ col, row, day })
      if (day.endsWith('-01')) months.push({ col, label: MONTHS[Number(day.slice(5, 7)) - 1] })
    }
  }
  return { cells, months }
}
