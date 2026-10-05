import { useMemo, useState, type ReactNode } from 'react'
import { Archive, CalendarX, NotePencil, PencilSimple, Plus, SlidersHorizontal, Target, Trash, CheckCircle, Clock } from '@phosphor-icons/react'
import { celebrate } from '../../motion/celebrate'
import { setHapticsEnabled } from '../../motion/haptics'
import { setSoundEnabled } from '../../motion/sound'
import { useUi } from '../../state/ui'
import { ActionSheet } from '../../ui/ActionSheet'
import { Button } from '../../ui/Button'
import { ColorPicker } from '../../ui/ColorPicker'
import { DotNumber } from '../../ui/DotNumber'
import { EmptyState } from '../../ui/EmptyState'
import { HabitIcon } from '../../ui/icons'
import { IconPicker } from '../../ui/IconPicker'
import { ListGroup, ListRow } from '../../ui/ListGroup'
import { Odometer } from '../../ui/Odometer'
import { Page } from '../../ui/Page'
import type { LedColor } from '../../ui/palette'
import { Ring } from '../../ui/Ring'
import { SegmentedControl } from '../../ui/SegmentedControl'
import { Sheet } from '../../ui/Sheet'
import { Stepper } from '../../ui/Stepper'
import { SwipeRow } from '../../ui/SwipeRow'
import { TextField } from '../../ui/TextField'
import { Tile } from '../../ui/Tile'
import { toast } from '../../ui/Toast'
import { WeekStrip, type WeekCell } from '../../ui/WeekStrip'
import { YearGrid, type YearLevel } from '../../ui/YearGrid'

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mt-7">
    <h2 className="mb-3 text-section font-semibold">{title}</h2>
    {children}
  </section>
)

const key = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

// Monday-based week containing today, plus the index of today in it.
function thisWeek() {
  const now = new Date()
  const idx = (now.getDay() + 6) % 7
  const days = Array.from({ length: 7 }, (_, i) => new Date(now.getFullYear(), now.getMonth(), now.getDate() - idx + i))
  return { days, idx }
}

// Deterministic fake year so screenshots stay stable.
function fakeYear(): Record<string, YearLevel> {
  let s = 7
  const rand = () => (s = (s * 16807) % 2147483647) / 2147483647
  const out: Record<string, YearLevel> = {}
  const now = new Date()
  for (let i = 0; i < 365; i++) {
    const r = rand()
    const lv: YearLevel = r < 0.2 ? 0 : r < 0.3 ? 1 : r < 0.42 ? 2 : r < 0.55 ? 3 : r < 0.62 ? 'skip' : 4
    out[key(new Date(now.getFullYear(), now.getMonth(), now.getDate() - i))] = lv
  }
  return out
}

type Mark = 'off' | 'done' | 'skipped'

export function DevPage() {
  const reducedMotion = useUi((s) => s.reducedMotion)
  const setReducedMotion = useUi((s) => s.setReducedMotion)
  const [theme, setTheme] = useState<'system' | 'dark' | 'light'>('system')
  const [haptics, setHaptics] = useState<'on' | 'off'>('on')
  const [sounds, setSounds] = useState<'on' | 'off'>('off')

  const { days, idx } = useMemo(thisWeek, [])
  const today = key(new Date())
  const year = useMemo(fakeYear, [])

  const [color, setColor] = useState<LedColor>('mint')
  const [icon, setIcon] = useState('barbell')
  // Days before today get a believable history; today and later start unlit.
  const [marks, setMarks] = useState<Mark[]>(() => LETTERS.map((_, i) => (i < idx ? (i % 3 === 2 ? 'off' : 'done') : 'off')))
  const [glasses, setGlasses] = useState(() => [8, 5, 8, 6, 2, 7, 4].map((v, i) => (i < idx ? v : i === idx ? 3 : 0)))
  const [actions, setActions] = useState(false)
  const [sheet, setSheet] = useState(false)
  const [segment, setSegment] = useState<'week' | 'year'>('week')
  const [pages, setPages] = useState(20)
  const [odo, setOdo] = useState(7)
  const [name, setName] = useState('')
  const [rowDone, setRowDone] = useState(false)

  const streak = (() => {
    let n = 0
    for (let i = idx; i >= 0; i--) {
      if (marks[i] === 'done') n++
      else if (marks[i] === 'skipped' || i === idx) continue
      else break
    }
    return n
  })()

  const label = (d: Date, text: string) => `${d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}, ${text}`

  const workoutCells: WeekCell[] = days.map((d, i) => ({
    key: key(d),
    weekday: LETTERS[i],
    state: marks[i] === 'off' ? 'off' : marks[i],
    label: label(d, marks[i] === 'done' ? 'done' : marks[i] === 'skipped' ? 'skipped' : 'not done'),
    today: i === idx,
    future: i > idx,
    reward: 10,
    onPress: () => {
      const was = marks[i]
      setMarks((m) => m.map((v, j) => (j === i ? (was === 'done' ? 'off' : 'done') : v)))
      toast(was === 'done' ? 'Check removed' : 'Habit checked', {
        undo: () => setMarks((m) => m.map((v, j) => (j === i ? was : v))),
      })
    },
    onLongPress: () => setActions(true),
  }))

  const waterCells: WeekCell[] = days.map((d, i) => {
    const n = glasses[i]
    return {
      key: key(d),
      weekday: LETTERS[i],
      state: n >= 8 ? 'done' : n > 0 ? 'partial' : 'off',
      progress: n / 8,
      count: n,
      label: label(d, `${n} of 8 glasses`),
      today: i === idx,
      future: i > idx,
      reward: 10,
      onPress: () => setGlasses((g) => g.map((v, j) => (j === i ? (v >= 8 ? 0 : v + 1) : v))),
    }
  })

  return (
    <Page title="Components">
      <p className="mt-2 text-body text-ink-2">Every piece of the design system, live.</p>

      <Section title="Display">
        <div className="space-y-3">
          <SegmentedControl
            label="Theme"
            value={theme}
            options={[{ value: 'system', label: 'System' }, { value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]}
            onChange={(v) => {
              setTheme(v)
              if (v === 'system') delete document.documentElement.dataset.theme
              else document.documentElement.dataset.theme = v
            }}
          />
          <SegmentedControl
            label="Reduced motion"
            value={reducedMotion}
            options={[{ value: 'user', label: 'Follow system' }, { value: 'always', label: 'Reduce motion' }]}
            onChange={setReducedMotion}
          />
          <SegmentedControl
            label="Haptics"
            value={haptics}
            options={[{ value: 'on', label: 'Haptics on' }, { value: 'off', label: 'Haptics off' }]}
            onChange={(v) => {
              setHaptics(v)
              setHapticsEnabled(v === 'on')
            }}
          />
          <SegmentedControl
            label="Sounds"
            value={sounds}
            options={[{ value: 'on', label: 'Sounds on' }, { value: 'off', label: 'Sounds off' }]}
            onChange={(v) => {
              setSounds(v)
              setSoundEnabled(v === 'on')
            }}
          />
        </div>
      </Section>

      <Section title="Tile states">
        <div className="grid grid-cols-5 gap-x-2 gap-y-4">
          {(
            [
              ['Off', { state: 'off' }],
              ['Partial 25%', { state: 'partial', progress: 0.25 }],
              ['Partial 50%', { state: 'partial', progress: 0.5 }],
              ['Partial 75%', { state: 'partial', progress: 0.75 }],
              ['Done', { state: 'done' }],
              ['Skipped', { state: 'skipped' }],
              ['Not scheduled', { state: 'unscheduled' }],
              ['Today', { state: 'off', today: true }],
              ['Future', { state: 'off', future: true }],
              ['Count', { state: 'partial', progress: 0.5, count: 4 }],
            ] as const
          ).map(([name, p]) => (
            <div key={name} className="text-center">
              <Tile color={color} label={name} {...p} />
              <p className="mt-1 text-caption text-ink-2">{name}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Habit rows">
        <div className="space-y-7">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <HabitIcon name={icon} color={color} size={28} />
              <span className="flex-1 text-row">Morning workout</span>
              <span className="flex items-center gap-1 text-row font-semibold">
                <Odometer value={streak} />
                <span className="text-secondary font-normal text-ink-2">days</span>
              </span>
            </div>
            <WeekStrip cells={workoutCells} color={color} showHeader />
            <p className="mt-2 text-caption text-ink-2">Tap a tile to light it. Hold for more actions.</p>
          </div>
          <div>
            <div className="mb-2 flex items-center gap-3">
              <HabitIcon name="drop" color="cyan" size={28} />
              <span className="flex-1 text-row">Drink water</span>
              <span className="text-secondary text-ink-2">8 glasses</span>
            </div>
            <WeekStrip cells={waterCells} color="cyan" />
          </div>
        </div>
      </Section>

      <Section title="Year grid">
        <div className="-mx-5 px-5">
          <YearGrid levels={year} endDay={today} color={color} label="Morning workout, last 365 days" />
        </div>
        <p className="mt-2 text-caption text-ink-2">Scrolls into the past from the current week.</p>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap gap-3">
          <Button icon={<Plus size={20} weight="bold" />}>Save habit</Button>
          <Button variant="secondary">Start focus</Button>
          <Button variant="ghost">Skip for now</Button>
          <Button variant="destructive" icon={<Trash size={20} />}>Delete habit</Button>
          <Button disabled>Save habit</Button>
        </div>
      </Section>

      <Section title="Controls">
        <div className="space-y-4">
          <SegmentedControl
            label="View"
            value={segment}
            options={[{ value: 'week', label: 'Week' }, { value: 'year', label: 'Year' }]}
            onChange={setSegment}
          />
          <div className="flex flex-wrap items-center gap-6">
            <Stepper label="Pages read" value={pages} onChange={setPages} step={5} max={100} unit="pages" />
            <div className="flex items-center gap-4">
              <Ring value={pages / 100} label="Pages goal" size={64} color={color}>
                <span className="text-secondary font-semibold">{pages}</span>
              </Ring>
              <Ring value={0.4} label="Level progress" size={40} stroke={4} color="xp" />
            </div>
          </div>
        </div>
      </Section>

      <Section title="Numbers">
        <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
          <div>
            <DotNumber value={odo} size={72} roll />
            <p className="text-caption text-ink-2">Streak</p>
          </div>
          <div>
            <DotNumber value="86%" size={48} />
            <p className="text-caption text-ink-2">Last 90 days</p>
          </div>
          <div>
            <DotNumber value="1,240" size={36} />
            <p className="text-caption text-ink-2">XP</p>
          </div>
          <Button variant="secondary" onClick={() => setOdo((n) => (n >= 120 ? 7 : n + 11))}>Roll number</Button>
        </div>
      </Section>

      <Section title="Fields">
        <div className="space-y-4">
          <TextField label="Habit name" value={name} onChange={setName} placeholder="Morning workout" />
          <TextField label="Habit name" value="" onChange={() => {}} error="Add a name to save this habit." />
          <TextField label="Note" value="" onChange={() => {}} multiline placeholder="What happened today" />
        </div>
      </Section>

      <Section title="Color and icon">
        <div className="space-y-5">
          <ColorPicker value={color} onChange={setColor} />
          <IconPicker value={icon} onChange={setIcon} color={color} />
        </div>
      </Section>

      <Section title="Lists">
        <div className="space-y-5">
          <ListGroup header="Account" footer="Backups include everything except your Claude key.">
            <ListRow title="Week starts on" detail="Monday" chevron onClick={() => {}} />
            <ListRow title="Day starts at" detail="03:00" chevron onClick={() => {}} />
            <ListRow icon={<SlidersHorizontal size={22} />} title="A deliberately long row title that wraps onto a second line so the layout can be checked" detail="1,284" />
          </ListGroup>
          <ListGroup header="Swipe rows">
            <SwipeRow
              leading={{ label: 'Complete', icon: <CheckCircle size={22} />, onTrigger: () => { setRowDone(true); toast('Task completed', { undo: () => setRowDone(false) }) } }}
              trailing={[
                { label: 'Later', icon: <Clock size={22} />, onTrigger: () => toast('Task moved to tomorrow') },
                { label: 'Delete', icon: <Trash size={22} />, destructive: true, onTrigger: () => toast('Task deleted') },
              ]}
            >
              <ListRow icon={<Target size={22} />} title={rowDone ? 'Pay rent (done)' : 'Pay rent'} detail="Fri 9:00" />
            </SwipeRow>
            <SwipeRow leading={{ label: 'Complete', onTrigger: () => toast('Task completed') }}>
              <ListRow title="Book dentist" detail="Today" />
            </SwipeRow>
          </ListGroup>
        </div>
      </Section>

      <Section title="Empty state">
        <EmptyState message="No habits yet. Start with one you can do in two minutes." action={{ label: 'Add a habit', onClick: () => toast('Habit saved') }} />
      </Section>

      <Section title="Overlays and feedback">
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => setSheet(true)}>Open sheet</Button>
          <Button variant="secondary" onClick={() => setActions(true)}>Open action sheet</Button>
          <Button variant="secondary" onClick={() => toast('Habit saved')}>Show toast</Button>
          <Button variant="secondary" onClick={() => toast('Habit archived', { undo: () => toast('Habit restored') })}>Toast with undo</Button>
          <Button variant="secondary" onClick={(e) => celebrate(e.currentTarget)}>Celebrate</Button>
        </div>
      </Section>

      <Sheet open={sheet} onClose={() => setSheet(false)} title="Name your habit">
        <div className="space-y-4">
          <TextField label="Habit name" value={name} onChange={setName} placeholder="Morning workout" />
          <ColorPicker value={color} onChange={setColor} />
          <Button className="w-full" onClick={() => { setSheet(false); toast('Habit saved') }}>Save habit</Button>
        </div>
      </Sheet>

      <ActionSheet
        open={actions}
        onClose={() => setActions(false)}
        title="Morning workout"
        actions={[
          { label: 'Set exact value', icon: <SlidersHorizontal size={22} />, onSelect: () => toast('Value saved') },
          { label: 'Skip this day', icon: <CalendarX size={22} />, onSelect: () => { setMarks((m) => m.map((v, j) => (j === idx ? 'skipped' : v))); toast('Day skipped') } },
          { label: 'Add note', icon: <NotePencil size={22} />, onSelect: () => toast('Note saved') },
          { label: 'Edit habit', icon: <PencilSimple size={22} />, onSelect: () => toast('Habit updated') },
          { label: 'Archive habit', icon: <Archive size={22} />, destructive: true, onSelect: () => toast('Habit archived') },
        ]}
      />
    </Page>
  )
}
