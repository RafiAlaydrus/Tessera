import { useEffect, useRef, useState, type ReactNode } from 'react'

// Large title that collapses into a compact bar once it scrolls under the status area.
export function Page({ title, children }: { title: string; children: ReactNode }) {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setCompact(!e.isIntersecting), {
      rootMargin: '-100px 0px 0px 0px',
    })
    io.observe(titleRef.current!)
    return () => io.disconnect()
  }, [])

  return (
    <div className="h-dvh overflow-y-auto overscroll-none pb-[calc(env(safe-area-inset-bottom)+112px)]">
      <div
        aria-hidden="true"
        className={`fixed inset-x-0 top-0 z-10 border-b border-line bg-board pt-[env(safe-area-inset-top)] transition-opacity duration-150 ${compact ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <div className="grid h-11 place-items-center text-row font-semibold">{title}</div>
      </div>
      <main className="px-5 pt-[calc(env(safe-area-inset-top)+16px)]">
        <h1 ref={titleRef} className="text-title font-bold">
          {title}
        </h1>
        {children}
      </main>
    </div>
  )
}

export const Empty = ({ children }: { children: ReactNode }) => (
  <p className="mt-7 text-body text-ink-2">{children}</p>
)
