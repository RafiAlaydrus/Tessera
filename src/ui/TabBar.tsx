import { NavLink } from 'react-router'
import { CheckCircle, Plus, SquaresFour, Sun, Target, User } from '@phosphor-icons/react'

const tabs = [
  { to: '/today', label: 'Today', Icon: Sun },
  { to: '/habits', label: 'Habits', Icon: SquaresFour },
  { to: '/tasks', label: 'Tasks', Icon: CheckCircle },
  { to: '/goals', label: 'Goals', Icon: Target },
  { to: '/you', label: 'You', Icon: User },
]

export function TabBar() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex items-center gap-2.5 px-5 pb-[calc(env(safe-area-inset-bottom)+8px)]">
      <nav
        aria-label="Main"
        className="pointer-events-auto flex flex-1 rounded-full border border-line bg-surface/70 p-1 backdrop-blur-xl"
      >
        {tabs.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 rounded-full py-1.5 text-caption ${isActive ? 'bg-surface-2 text-ink' : 'text-ink-2'}`
            }
          >
            <Icon size={24} />
            {label}
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        aria-label="Add"
        className="pointer-events-auto grid size-14 shrink-0 place-items-center rounded-full bg-ink text-board"
      >
        <Plus size={24} weight="bold" />
      </button>
    </div>
  )
}
