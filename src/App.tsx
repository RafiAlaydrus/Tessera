import { useState } from 'react'
import { Outlet } from 'react-router'
import { InstallScreen } from './features/onboarding/InstallScreen'
import { needsInstallScreen, readInstallEnv } from './features/onboarding/install'
import { TabBar } from './ui/TabBar'
import { UpdateToast } from './ui/UpdateToast'

export function App() {
  const [env, setEnv] = useState(readInstallEnv)
  const dismiss = () => {
    sessionStorage.setItem('install-dismissed', '1')
    setEnv({ ...env, dismissed: true })
  }

  if (needsInstallScreen(env)) return <InstallScreen onContinue={dismiss} />
  return (
    <>
      <Outlet />
      <TabBar />
      <UpdateToast />
    </>
  )
}
