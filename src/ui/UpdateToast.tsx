import { useRegisterSW } from 'virtual:pwa-register/react'

export function UpdateToast() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()
  if (!needRefresh) return null
  return (
    <button
      type="button"
      onClick={() => updateServiceWorker(true)}
      className="fixed inset-x-5 bottom-[calc(env(safe-area-inset-bottom)+88px)] z-30 rounded-full border border-line bg-surface-2 px-5 py-3 text-left text-secondary text-ink"
    >
      New version ready. Tap to reload.
    </button>
  )
}
