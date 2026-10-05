import type { ReactNode } from 'react'
import { Button } from './Button'
import { Sheet } from './Sheet'

export type Action = { label: string; icon?: ReactNode; destructive?: boolean; onSelect: () => void }

export function ActionSheet({ open, onClose, title, actions }: { open: boolean; onClose: () => void; title?: string; actions: Action[] }) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <div className="divide-y divide-line overflow-hidden rounded-panel bg-surface-2">
        {actions.map((a) => (
          <button
            key={a.label}
            type="button"
            onClick={() => {
              onClose()
              a.onSelect()
            }}
            className={`flex h-14 w-full items-center gap-3 px-4 text-body ${a.destructive ? 'text-ember' : 'text-ink'}`}
          >
            {a.icon}
            {a.label}
          </button>
        ))}
      </div>
      <Button variant="secondary" className="mt-3 w-full" onClick={onClose}>
        Cancel
      </Button>
    </Sheet>
  )
}
