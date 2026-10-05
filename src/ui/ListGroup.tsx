import type { ReactNode } from 'react'
import { CaretRight } from '@phosphor-icons/react'

// Inset grouped list: a rounded panel of rows split by hairlines.
export function ListGroup({ header, footer, children }: { header?: string; footer?: string; children: ReactNode }) {
  return (
    <section>
      {header && <h2 className="mb-2 px-4 text-secondary text-ink-2">{header}</h2>}
      <div className="divide-y divide-line overflow-hidden rounded-panel bg-surface">{children}</div>
      {footer && <p className="mt-2 px-4 text-caption text-ink-2">{footer}</p>}
    </section>
  )
}

type RowProps = { icon?: ReactNode; title: string; detail?: ReactNode; onClick?: () => void; chevron?: boolean }

export function ListRow({ icon, title, detail, onClick, chevron }: RowProps) {
  const inner = (
    <>
      {icon && <span className="shrink-0 text-ink-2">{icon}</span>}
      <span className="min-w-0 flex-1 text-left text-body break-words">{title}</span>
      {detail != null && <span className="ml-3 shrink-0 text-right text-body text-ink-2 tabular-nums">{detail}</span>}
      {chevron && <CaretRight size={16} className="shrink-0 text-ink-3" />}
    </>
  )
  const cls = 'flex min-h-14 w-full items-center gap-3 px-4 py-3'
  return onClick ? (
    <button type="button" onClick={onClick} className={`${cls} active:bg-surface-2`}>
      {inner}
    </button>
  ) : (
    <div className={cls}>{inner}</div>
  )
}
