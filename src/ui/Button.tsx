import type { ComponentProps, ReactNode } from 'react'
import { motion } from 'motion/react'
import { springs } from '../motion/springs'

const variants = {
  primary: 'bg-ink text-board',
  secondary: 'border border-line bg-surface text-ink',
  ghost: 'text-ink-2',
  destructive: 'border border-line bg-surface text-ember',
}

type Props = Omit<ComponentProps<typeof motion.button>, 'children'> & {
  variant?: keyof typeof variants
  icon?: ReactNode
  children: ReactNode
}

// Pills, 48px tall. Primary is ink-filled; color is reserved for habits and XP.
export function Button({ variant = 'primary', icon, children, className = '', ...rest }: Props) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      transition={springs.press}
      className={`inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-body font-semibold disabled:opacity-40 ${variants[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </motion.button>
  )
}
