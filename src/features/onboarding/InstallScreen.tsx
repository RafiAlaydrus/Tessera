import { DeviceMobile, Export, PlusSquare } from '@phosphor-icons/react'

const steps = [
  { Icon: Export, text: 'Tap Share in the Safari toolbar' },
  { Icon: PlusSquare, text: 'Choose Add to Home Screen' },
  { Icon: DeviceMobile, text: 'Open Tessera from your Home Screen' },
]

export function InstallScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <main className="flex h-dvh flex-col px-5 pt-[calc(env(safe-area-inset-top)+48px)] pb-[calc(env(safe-area-inset-bottom)+24px)]">
      <img src={`${import.meta.env.BASE_URL}mark.svg`} alt="" className="size-16" />
      <h1 className="mt-7 text-title font-bold">Install Tessera</h1>
      <p className="mt-2 text-body text-ink-2">
        Tessera opens full screen and works offline once it is on your Home Screen. Safari and the
        Home Screen app keep separate data, so use the installed app for real tracking.
      </p>
      <ul className="mt-7 divide-y divide-line rounded-panel bg-surface">
        {steps.map(({ Icon, text }) => (
          <li key={text} className="flex items-center gap-4 px-4 py-4 text-body">
            <Icon size={24} className="shrink-0 text-ink-2" />
            {text}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={onContinue}
        className="mt-auto h-12 rounded-full border border-line text-body text-ink-2"
      >
        Continue in browser
      </button>
    </main>
  )
}
