export type InstallEnv = { standalone: boolean; ios: boolean; dismissed: boolean }

// iOS has no install prompt, so Safari tabs get a how-to screen. Other browsers go straight in.
export const needsInstallScreen = (e: InstallEnv) => e.ios && !e.standalone && !e.dismissed

export const readInstallEnv = (): InstallEnv => ({
  standalone:
    matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true,
  ios: /iPhone|iPad|iPod/.test(navigator.userAgent),
  dismissed: sessionStorage.getItem('install-dismissed') === '1',
})
