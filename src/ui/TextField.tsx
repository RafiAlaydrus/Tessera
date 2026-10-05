import { useId, type ComponentProps } from 'react'

type Props = Omit<ComponentProps<'input'>, 'onChange' | 'value'> & {
  label: string
  value: string
  onChange: (v: string) => void
  error?: string
  multiline?: boolean
}

// 16px text so iOS never zooms on focus.
export function TextField({ label, value, onChange, error, multiline, className = '', ...rest }: Props) {
  const id = useId()
  const cls = `w-full rounded-input border bg-surface px-4 text-body text-ink outline-none placeholder:text-ink-3 focus:bg-surface-2 ${error ? 'border-ember' : 'border-line focus:border-ink-3'} ${className}`
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-secondary text-ink-2">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          rows={4}
          aria-invalid={!!error}
          onChange={(e) => onChange(e.target.value)}
          className={`${cls} py-3`}
          {...(rest as ComponentProps<'textarea'>)}
        />
      ) : (
        <input id={id} value={value} aria-invalid={!!error} onChange={(e) => onChange(e.target.value)} className={`${cls} h-12`} {...rest} />
      )}
      {error && <p className="mt-1.5 text-secondary text-ember">{error}</p>}
    </div>
  )
}
