import { useEffect } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { toast } from './Toast'

// Prompt-mode service worker updates: a persistent toast whose button reloads into the new version.
export function UpdateToast() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()
  useEffect(() => {
    if (needRefresh)
      toast('New version ready', { action: { label: 'Reload', run: () => updateServiceWorker(true) }, duration: Infinity })
  }, [needRefresh, updateServiceWorker])
  return null
}
