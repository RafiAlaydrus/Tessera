import { useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { springs } from '../motion/springs'
import { useUi } from '../state/ui'

type Options = { undo?: () => void; action?: { label: string; run: () => void }; duration?: number }

/** Shows one toast at a time. Buttons say what happens and the toast repeats it ("Habit saved"). */
export function toast(message: string, { undo, action, duration }: Options = {}) {
  const a = undo ? { label: 'Undo', run: undo } : action
  useUi.getState().showToast({ message, action: a, duration: duration ?? (a ? 6000 : 3500) })
}

export function ToastHost() {
  const current = useUi((s) => s.toast)
  const dismiss = useUi((s) => s.dismissToast)

  useEffect(() => {
    if (!current || !Number.isFinite(current.duration)) return
    const t = setTimeout(dismiss, current.duration)
    return () => clearTimeout(t)
  }, [current, dismiss])

  return (
    <div className="pointer-events-none fixed inset-x-5 bottom-[calc(env(safe-area-inset-bottom)+88px)] z-40">
      <AnimatePresence>
        {current && (
          <motion.div
            key={current.id}
            role="status"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springs.snappy}
            className="pointer-events-auto flex items-center gap-3 rounded-full border border-line bg-surface-2 py-2 pr-2 pl-5 text-secondary"
          >
            <span className="min-w-0 flex-1">{current.message}</span>
            {current.action && (
              <button
                type="button"
                onClick={() => {
                  current.action!.run()
                  dismiss()
                }}
                className="h-9 shrink-0 rounded-full bg-ink px-4 font-semibold text-board"
              >
                {current.action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
