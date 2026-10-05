/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute, type PrecacheEntry } from 'workbox-precaching'

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: (string | PrecacheEntry)[] }

precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Prompt mode: the app asks to activate a waiting worker when the user taps "New version ready".
self.addEventListener('message', (e) => {
  if (e.data?.type === 'SKIP_WAITING') void self.skipWaiting()
})
