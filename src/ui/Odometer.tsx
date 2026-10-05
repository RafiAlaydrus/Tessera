import { motion } from 'motion/react'
import { springs } from '../motion/springs'

const H = 1.2 // digit cell height in em

// Digits roll vertically when the value changes. Inherits font and size from its parent.
export function Odometer({ value }: { value: number }) {
  const digits = String(Math.max(0, Math.floor(value))).split('')
  return (
    <span aria-label={String(value)} role="img" className="inline-flex tabular-nums">
      {digits.map((d, i) => (
        <span
          key={digits.length - i}
          aria-hidden="true"
          className="block overflow-hidden"
          style={{ height: `${H}em`, lineHeight: `${H}em` }}
        >
          <motion.span
            className="block"
            initial={false}
            animate={{ y: `${-Number(d) * H}em` }}
            transition={springs.snappy}
          >
            {Array.from({ length: 10 }, (_, n) => (
              <span key={n} className="block" style={{ height: `${H}em` }}>
                {n}
              </span>
            ))}
          </motion.span>
        </span>
      ))}
    </span>
  )
}
