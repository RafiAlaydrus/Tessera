import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useDragControls } from 'motion/react'
import { springs } from '../motion/springs'
import { useUi } from '../state/ui'

// Keeps the sheet above the iOS keyboard: follows visualViewport instead of the layout viewport.
function useKeyboard(active: boolean) {
  const [vp, setVp] = useState({ inset: 0, height: window.innerHeight })
  useEffect(() => {
    const vv = window.visualViewport
    if (!active || !vv) return
    const update = () => setVp({ inset: Math.max(0, window.innerHeight - vv.height - vv.offsetTop), height: vv.height })
    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [active])
  return vp
}

type Props = { open: boolean; onClose: () => void; title?: string; children: ReactNode }

// Bottom sheet. Drag the handle down to dismiss (fast flick or past 30% of its height).
// While open, the page behind scales to 0.94 (see Root).
export function Sheet({ open, onClose, title, children }: Props) {
  const controls = useDragControls()
  const ref = useRef<HTMLDivElement>(null)
  const pushSheet = useUi((s) => s.pushSheet)
  const { inset, height } = useKeyboard(open)
  // Callers pass inline closures; keep the latest in a ref so the open/close effect doesn't re-run on every render.
  const closeRef = useRef(onClose)
  useEffect(() => {
    closeRef.current = onClose
  })

  useEffect(() => {
    if (!open) return
    const pop = pushSheet()
    const opener = document.activeElement as HTMLElement | null
    ref.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current()
    window.addEventListener('keydown', onKey)
    return () => {
      pop()
      window.removeEventListener('keydown', onKey)
      opener?.focus?.()
    }
  }, [open, pushSheet])

  return createPortal(
    <AnimatePresence>
      {open && (
        <div key="sheet" className="fixed inset-0 z-50">
          <motion.div
            className="absolute inset-0 bg-[rgb(0_0_0/0.5)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-label={title ?? 'Sheet'}
            tabIndex={-1}
            drag="y"
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 1 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > ref.current!.offsetHeight * 0.3 || info.velocity.y > 600) onClose()
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={springs.sheet}
            className="absolute inset-x-0 flex flex-col rounded-t-sheet bg-surface outline-none"
            style={{ bottom: inset, maxHeight: height - 24 }}
          >
            <div data-testid="sheet-handle" onPointerDown={(e) => controls.start(e)} className="shrink-0 touch-none px-5 pt-3 pb-3">
              <div className="mx-auto h-1.5 w-10 rounded-full bg-ink-3" />
              {title && <h2 className="mt-4 text-section font-semibold">{title}</h2>}
            </div>
            <div className="overflow-y-auto px-5 pb-[calc(env(safe-area-inset-bottom)+20px)]">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
