import { MotionConfig, motion } from 'motion/react'
import { Outlet } from 'react-router'
import { CelebrationHost } from './motion/celebrate'
import { springs } from './motion/springs'
import { useUi } from './state/ui'
import { ToastHost } from './ui/Toast'

// Providers and overlays shared by every route. While a sheet is open the page behind
// scales to 0.94 with rounded corners, like iOS.
export function Root() {
  const reduced = useUi((s) => s.reducedMotion)
  const sheetOpen = useUi((s) => s.sheetDepth > 0)
  return (
    <MotionConfig reducedMotion={reduced}>
      <motion.div
        className="h-dvh bg-board"
        style={{ transformOrigin: '50% 0%', overflow: sheetOpen ? 'hidden' : 'visible' }}
        animate={{ scale: sheetOpen ? 0.94 : 1, borderRadius: sheetOpen ? 28 : 0 }}
        transition={springs.sheet}
      >
        <Outlet />
      </motion.div>
      <ToastHost />
      <CelebrationHost />
    </MotionConfig>
  )
}
