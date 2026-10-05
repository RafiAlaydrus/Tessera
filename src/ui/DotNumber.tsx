import { Odometer } from './Odometer'

// Doto dot-matrix numerals: hero numbers only (32px and up).
export function DotNumber({ value, size = 48, roll = false }: { value: number | string; size?: 36 | 48 | 72 | 96; roll?: boolean }) {
  return (
    <span className="font-dot font-bold" style={{ fontSize: size, lineHeight: 1 }}>
      {roll && typeof value === 'number' ? <Odometer value={value} /> : value}
    </span>
  )
}
