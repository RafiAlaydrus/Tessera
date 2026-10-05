import { Button } from './Button'

// A muted 3x3 board echoing the app mark, one message and one next step.
export function EmptyState({ message, action }: { message: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex flex-col items-start py-7">
      <div aria-hidden="true" className="grid grid-cols-3 gap-1">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className={`size-4 rounded-[28%] ${i === 5 ? 'bg-ink-3' : 'bg-tile-off'}`} />
        ))}
      </div>
      <p className="mt-4 max-w-[30ch] text-body text-ink-2">{message}</p>
      {action && (
        <Button variant="secondary" className="mt-5" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}
