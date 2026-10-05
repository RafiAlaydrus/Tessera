# Tessera: build plan

Working name. Before Phase 0, ask the user for the final app name and the GitHub repo name, then use those everywhere.

Tessera is a personal life tracker for iPhone, built as a PWA and hosted on GitHub Pages. Its feature set matches loggd.life (habits, tasks, goals, vision, focus timer, journal, notes, weekly review, XP and badges), adapted to run with no server. The look is original: never reuse Loggd's name, logo, copy, screenshots or visual design.

## How to work through this plan

Work one phase at a time, in order. Before coding a phase, restate its goal in two lines and list anything unclear. Ask instead of assuming. Ask before starting the optional phases (12 and 13).

Make minimal, targeted changes. If you see a better approach than this plan, say so and wait for an answer before doing it. Don't add dependencies outside the stack below without asking.

At the end of each phase, run `npm test` and `npm run build`, fix what fails, commit as `phase N: <summary>`, tick the phase under Progress, then stop and tell the user exactly what to try on their iPhone. Quick UI checks can use `npm run dev -- --host` in Safari on the same Wi-Fi (no service worker over plain HTTP); real PWA checks use the deployed GitHub Pages URL.

In Phase 0, write `CLAUDE.md` with the stack, commands, folder layout and the rules from the Design section, so every later session follows them.

## What we're building

**Habits.** Check, count (8 glasses) and duration (20 min) habits. Schedules: every day, chosen weekdays, X times per week, every N days. Weekly skip allowance, streaks, a week view, a 365-day grid per habit, notes on any day, archive, reorder, templates.

**Tasks.** List and board views, due dates, time blocks, recurring tasks, subtasks, tags (tags double as projects), priority, natural-language quick add.

**Today.** One main focus, habits due, an agenda timeline, morning and evening journal prompts, a day recap, XP earned today.

**Goals and vision.** Goals with milestones or a numeric target across six life areas, pace tracking, linked habits and tasks. Mission statement, eulogy method, core values, bucket list, vision board photos.

**Focus.** Pomodoro and open sessions linked to a habit, task or tag. Minutes flow into linked duration habits.

**Journal, notes, weekly review.** Guided prompts with mood and energy; nested markdown pages; a weekly review built from the week's real numbers.

**Game layer.** XP for every action, 100 levels, 65+ badges, unlockable palettes and tile shapes, a personal monthly league.

**Stats.** Completion rates, best weekdays, focus breakdowns, mood insights.

What changes because there's no server:

| Loggd | Here |
|---|---|
| Account, sync across devices | Local-first: IndexedDB on the phone is the source of truth. Backup and restore through the iOS share sheet (Files, iCloud Drive). |
| Monthly leaderboards | Personal league: this month vs last month vs best month. |
| Claude integration | Optional command bar calling the Claude API directly with the user's own key (Phase 13). |
| Alarm reminders | Optional Web Push sent by a scheduled GitHub Actions workflow, plus an app icon badge (Phase 12). Can arrive a few minutes late. |
| Live Activity | The "island": a pill under the status bar while a focus session runs. |
| Public API | Dropped. Full JSON export instead. |

## Stack

React 19+, TypeScript, Vite. `motion` (`motion/react`) for animation. Dexie 4 with `dexie-react-hooks` for IndexedDB. Zustand for transient UI state (open sheets, running timer, toasts). React Router with a hash router, so GitHub Pages needs no 404 tricks. Tailwind CSS v4 with design tokens as CSS variables in `@theme`; Tailwind's default palette is never used. `vite-plugin-pwa` with the `injectManifest` strategy and a TypeScript service worker. `date-fns`, `zod`, `chrono-node`, `marked` + `dompurify`, `@phosphor-icons/react`. Fonts self-hosted via Fontsource. Vitest for logic; Playwright (WebKit, touch, iPhone viewports) for smoke tests and screenshots. `pwa-asset-generator` for icons and startup images. `web-push` only inside the GitHub Actions script.

Deploy with GitHub Actions to GitHub Pages (repo Settings, Pages, Source: GitHub Actions). Vite `base` is `/<repo>/`, or `/` for a `<user>.github.io` repo; the manifest's `start_url` and `scope` must match it.

```
.
├── CLAUDE.md
├── PLAN.md
├── index.html
├── vite.config.ts
├── public/                 icons, startup images, mark.svg
├── scripts/                send-reminders.mjs
├── .github/workflows/      deploy.yml, reminders.yml
└── src/
    ├── main.tsx  App.tsx  router.tsx  sw.ts
    ├── styles/             tokens.css, base.css
    ├── domain/             dates, schedule, streaks, xp, levels, badges,
    │                       recurrence, parse, insights (+ *.test.ts)
    ├── db/                 schema.ts, repos/, seed.ts, backup.ts
    ├── state/              ui.ts
    ├── ui/                 design-system components
    ├── motion/             springs.ts, celebrate.tsx, haptics.ts, sound.ts
    └── features/           today, habits, tasks, goals, vision, focus, journal,
                            notes, review, stats, profile, settings, assistant,
                            onboarding
```

Data rules: IndexedDB is the only store. Everything in `src/domain` is a pure function with tests; components never compute streaks, XP or badges themselves. Days are local `YYYY-MM-DD` keys, and a "day starts at" setting (default 03:00) decides which day a late-night check belongs to. IDs come from `crypto.randomUUID()`. Every row has `createdAt` and `updatedAt` (epoch ms) so backups can merge.

## Design

### Concept: the scoreboard

Each day is a tile that lights up like an LED pixel when you show up, and a year of effort becomes a lit board. That's the one bold idea and it carries the personality: lit tiles, dot-matrix numerals, light-up motion. Everything around it stays quiet and behaves like a native iOS app.

### Color

| Token | Dark | Light | Use |
|---|---|---|---|
| board | #000000 | #F3F4F6 | App background (true black for OLED) |
| surface | #131417 | #FFFFFF | Sheets, grouped lists, inputs |
| surface-2 | #1C1E22 | #E9EBEF | Pressed and selected states |
| tile-off | #202227 | #DFE2E7 | Unlit tile |
| line | rgba(255,255,255,0.08) | rgba(0,0,0,0.08) | Hairlines |
| ink | #F2F3F5 | #0F1013 | Text, primary button fill |
| ink-2 | #9EA2AA | #5B606A | Secondary text |
| ink-3 | #62666E | #9A9FA8 | Tertiary, disabled |
| xp | #FFC53D | #B87F00 | XP, levels, badges only |

Habit colors (the LED palette, one per habit): Ember #FF5B3A, Amber #FFA41F, Lemon #F2E14C, Lime #A3E048, Mint #2FD69A, Cyan #33C3F0, Cobalt #4F7DFF, Violet #9D6CFF, Magenta #F05BC8, Rose #FF7D93, Ice #D9E4F0. In the light theme, darken each with `color-mix(in oklch, <color> 80%, black)`, and Ice becomes #3A3F47. Partial progress shows four brightness steps of the habit color over tile-off (28%, 52%, 76%, 100%); only 100% gets the glow. The chrome has no accent color: primary buttons are ink-filled pills, and color belongs to habits and XP.

### Type

Atkinson Hyperlegible Next for all UI text. It was built for fast, unambiguous reading, which suits an app you glance at twenty times a day. Doto, a dot-matrix face, only for hero numbers at 32px and up: streaks on a habit page, XP and level, the focus timer, today's XP, the level-up screen. Never for labels or small numbers; those use the UI font with `font-variant-numeric: tabular-nums`. Both are OFL; if one is missing from Fontsource, self-host the woff2 from Google Fonts.

Scale: 12 caption, 14 secondary, 16 body, 18 row title, 21 section title, 28 large title; Doto at 36, 48, 72, 96. Inputs are at least 16px so iOS never zooms.

Sentence case everywhere. No all-caps labels, no letter-spaced eyebrow text, no "A · B · C" meta strings, no arrows on buttons. Weekday headers are single letters: M T W T F S S.

### Shape, space, layout

4px grid, 20px screen padding, 28px between sections. Radii follow hierarchy instead of one value everywhere: tiles 28% of their size, panels 22px, sheet tops 28px, inputs 14px, buttons full pills. No drop shadows in dark mode; elevation is a lighter surface. Only the tab bar and the island use backdrop blur.

Structure follows iOS: large titles that shrink into a compact bar on scroll, inset grouped lists for settings-like screens, left-aligned content, numbers right-aligned in rows. Habits are rows on the board, not boxed cards: a line with icon, name and streak above seven tiles, rows separated by space.

Today

```
 Mon 5 Oct                       ◔23   avatar with level ring
 Today                                 large title, collapses on scroll

 Main focus
 ○  Finish the auth flow

 Habits                       4 of 7
 ▣ ▣ ▢ ▣ ▢ ▣ ▢                         tap a tile to light it

 Agenda
 09:00 ┃ Deep work           ▶ focus
 ─────────── now ───────────
 14:00 ┃ Gym

 Evening reflection                 ›  after 18:00
                            +145 XP    Doto

  Today   Habits   Tasks   Goals   You        (+)
```

Habits, week view

```
 ‹  29 Sep – 5 Oct  ›            Week | Year

 [icon] Morning workout      flame 7
 M  T  W  T  F  S  S
 ▣  ▣  ▣  ▢  ▣  ▨  ·      ▨ skipped   · not scheduled

 [icon] Drink water          flame 13
 ▣  ◧  ▣  ▣  ▣  ◧  ▢      ◧ partial, count shown inside
```

Habit page

```
 Morning workout
    7          21          86%         Doto
  streak      best     last 90 days

 [ year grid 53 × 7, scrolls into the past ]
 [ month calendar ]
 [ weekday bars ]        [ notes ]
```

Focus

```
 Linked to Deep work

     ▣ ▣ ▣ ▣ ▣
     ▣ ▒ ▢ ▢ ▢        25 tiles for 25 minutes,
     ▢ ▢ ▢ ▢ ▢        the current tile breathes
     ▢ ▢ ▢ ▢ ▢
     ▢ ▢ ▢ ▢ ▢

       18:42           Doto 96
   Pause       End
```

### Motion

Spring presets (motion's `visualDuration` / `bounce`): press 0.15s / 0, snappy 0.25s / 0.1, sheet 0.4s / 0.05, pop 0.35s / 0.45.

Motion answers what the user did. These are the moments:

1. **Light a tile.** The fill scales from 0.4 to 1 with the pop spring as it takes the habit color, a soft glow blooms and settles, the check draws itself, "+10" in the xp color rises 20px and fades, the streak rolls like an odometer, and the phone ticks. Undo is a quick reverse with no glow.
2. **Count habits.** Each tap raises the fill like a level meter and pops the number; reaching the target plays moment 1.
3. **Long-press (450ms).** A ring traces around the tile during the hold, a tick at completion, then the action sheet rises. Moving more than 8px cancels.
4. **Sheets.** Drag down to dismiss (fast flick or past 30% of height); the page behind scales to 0.94 and rounds its corners, like iOS.
5. **Navigation.** Detail pages push in from the right while the previous page slides 25% left and dims; dragging from the left edge (first 24px) goes back.
6. **Tabs.** The active indicator slides (shared `layoutId`); content crossfades with an 8px nudge in the direction of travel.
7. **Island.** Leaving the focus screen shrinks the timer into a pill under the status bar; tapping it morphs back (shared `layoutId`).
8. **Level up.** The one big orchestrated moment: the screen dims, a full-screen board lights in a wave from the XP bar outward, the new level counts up in Doto, then the reward appears. Under 1.8s, tap to skip.
9. **Launch.** On cold start only, today's habit tiles light left to right in 400ms.

Nothing else moves on its own: no idle bouncing, no entrance animation on every section, no shimmer.

Performance: animate only transform and opacity (the glow is a pre-blurred layer whose opacity changes, never an animated shadow or filter). Lists animate on add and remove only. The year grid's entrance uses CSS keyframes with a `--i` delay variable, not 365 motion components. Wrap the app in `<MotionConfig reducedMotion="user">`; with reduced motion, movement becomes a fade.

Haptics: iOS Safari has no `navigator.vibrate`. On iOS 18+, clicking the label of a hidden `<input type="checkbox" switch>` inside a user gesture plays the system haptic tick. Wrap it in `haptic()`, feature-detect, no-op elsewhere, and add a setting to turn it off. Sounds are tiny Web Audio synth blips (no audio files), off by default except the focus-end chime.

### Words

Plain verbs, sentence case, no filler. Buttons say what happens ("Save habit", "Start focus") and the toast repeats it ("Habit saved"). Empty states give one next step: "No habits yet. Start with one you can do in two minutes." Errors say what happened and how to fix it. No exclamation marks, no emoji, no "Welcome back".

### Anti-slop check

Before finishing any phase that adds UI, take Playwright screenshots of every new screen at 393×852 and 440×956 in both themes, review them against this section, and fix failures. A screen fails if it has decorative gradients; blur beyond the tab bar and island; everything boxed in identical rounded cards with the same shadow; emoji as icons, or mixed icon styles within a role (habit icons are Phosphor duotone tinted with the habit color, UI icons are Phosphor regular); placeholder or lorem text; spinners for local data; or no designed empty, single-item, many-item and long-text states.

## iOS PWA requirements

Head: viewport with `viewport-fit=cover`; `apple-mobile-web-app-capable` and `mobile-web-app-capable`; status bar style `black-translucent`; `theme-color` per color scheme; a 180px apple-touch-icon; startup images for current iPhone sizes from pwa-asset-generator, so launch is black instead of a white flash. Manifest: `display: standalone`, background `#000000`, maskable icons, `start_url` and `scope` equal to the Vite base.

Layout uses `100dvh` and `env(safe-area-inset-*)`; the tab bar clears the home indicator and headers clear the Dynamic Island. Interactive elements get `touch-action: manipulation`, `-webkit-tap-highlight-color: transparent`, `-webkit-touch-callout: none` and `user-select: none`, so long-press never opens the iOS callout. The body has `overscroll-behavior: none`, with scrolling inside containers. Sheets with inputs follow `visualViewport` so the keyboard never covers a field.

Call `navigator.storage.persist()` on first run and show the result in Settings. Safari and the Home Screen app keep separate storage, so real use happens in the installed app. iOS has no install prompt: when not standalone, show an install screen with the Share, Add to Home Screen steps. Service worker updates use prompt mode: a "New version ready" toast reloads on tap. Timers never count with `setInterval`; store `startedAt` and paused time and derive elapsed from `Date.now()`, so app switches and phone locks don't break them.

## Data model (Dexie, version 1)

| Table | Fields | Indexes |
|---|---|---|
| habits | id, name, icon, color, type (check / count / duration), target, unit, schedule { kind: daily / days / perWeek / everyN, days, perWeek, every, anchorDay }, skipsPerWeek, areaId, goalId, autoFrom (journal / focus / none), reminders [{ time, days }], order, archivedAt, createdAt, updatedAt | order, archivedAt |
| habitLogs | id, habitId, day, value, status (done / partial / skip), note, updatedAt | `&[habitId+day]`, day |
| tasks | id, title, notes, status (backlog / todo / doing / done), priority 0–3, due, block { day, start, minutes }, recurrence { freq, interval, days, mode: fixed / afterDone }, tags, goalId, subtasks [{ id, title, done }], order, completedAt, updatedAt | status, due, `*tags` |
| taskCompletions | id, taskId, day, at | taskId, day |
| tags | id, name, color | name |
| areas | id, name, icon, color, order; defaults Health, Mind, Work, Money, People, Play | order |
| goals | id, title, why, areaId, kind (milestones / numeric), start, target, unit, startDay, deadline, status, updatedAt | areaId, status |
| milestones | id, goalId, title, due, doneAt, order | goalId |
| goalLogs | id, goalId, day, value, note | goalId, day |
| days | day (key), mainFocus { text, taskId, doneAt } | none |
| focusSessions | id, mode (pomodoro / open), plannedMin, startedAt, endedAt, pausedMs, linkKind, linkId, completed, note | startedAt, `[linkKind+linkId]` |
| journal | id, day, kind (morning / evening), answers { promptId: text }, mood 1–5, energy 1–5, updatedAt | `&[day+kind]` |
| prompts | id, kind, text, active, order | kind |
| notes | id, parentId, title, body (markdown), icon, pinned, order, updatedAt | parentId |
| vision | key (mission / eulogy / values), value | none |
| bucket | id, title, areaId, doneAt, order | areaId |
| boardImages | id, blob, caption, order | order |
| reviews | id (ISO week, e.g. 2026-W41), answers, rating, nextTopThree, snapshot, completedAt | none |
| xp | id, at, day, amount, sourceKind, sourceId, reason | day, `[sourceKind+sourceId]` |
| badges | key, unlockedAt, seen | none |
| settings | key, value | none |

## Rules (`src/domain`)

**Due and done.** A habit is due on a day its schedule includes; `perWeek` habits are due every day of the week until the weekly target is met. Done means value ≥ target (check habits have target 1); partial is anything between 0 and target.

**Streaks.** For daily, weekday and every-N habits, the streak is the run of consecutive scheduled days that are done, counting back from today. Today not done yet keeps the streak alive and shows it as pending. Skips within the weekly allowance keep it alive without adding to it; unscheduled days are ignored. `perWeek` streaks count consecutive weeks that met the target; the current week counts once it's met. Best streak is the longest run ever. Test these: schedule changed mid-streak, habit created mid-week, skips at the allowance limit, a check at 02:30 with the day starting at 03:00, leap day, a DST time zone (Europe/London), Monday vs Sunday week start.

**Completion rate.** Done ÷ scheduled over 7, 30, 90 and 365 days; skipped days leave the denominator.

**Recurrence.** `fixed` advances from the due date, `afterDone` from the completion day. Monthly on the 31st clamps to the last day of shorter months. Completing writes a `taskCompletions` row and moves `due` forward on the same task, never duplicating it.

**XP.** A ledger, never a stored total. Habit done +10, plus 1 per full week of its current streak (max +5); partial earns proportional XP rounded down. Task done +5, +8, +12, +15 by priority. Main focus +25. Focus +1 per minute (max 240 a day). Journal entry +15. Weekly review +50. Milestone +100. Goal completed +300. Bucket list item +150. Undo deletes the ledger row with the same source.

**Levels.** XP needed to reach level L is round(100 × (L − 1)^1.5), capped at 100: 100 XP for level 2, about 2,700 for level 10, 34,300 for 50 and 98,500 for 100, which is around 18 months of steady use.

**Badges.** A declarative catalog in `src/domain/badges.ts`, each `{ key, name, description, category, tier, evaluate(stats) → { unlocked, progress } }`. Categories: streaks (3, 7, 14, 30, 60, 100, 180, 365 days); perfect day, week and month; total checks (1, 100, 500, 1,000, 5,000); one habit done 100 and 365 times; focus (first session, 10, 50, 100, 500 hours, four sessions in a day, a 2-hour session); tasks (1, 100, 1,000, board cleared); journal (7, 30, 100 entries, a 7-day journaling streak); goals (first milestone, first goal, three goals); reviews (first, 4 in a row, 12 in a row); levels (5, 10, 25, 50, 75, 100); timing (10 checks before 07:00, 10 after 22:00); comeback (back after a 7-day gap); vision (mission written, eulogy written, 10 bucket list items); balance (activity in all six life areas in one week). That's about 50; extend the same categories to 65 or more. Evaluate after relevant writes, never during render.

**League.** This month's XP vs last month and vs the best month, shown as a percentage with a small tile bar.

**Insights.** For habits with at least 14 days on each side, compare average mood on done vs not-done days and show only gaps of 0.5 or more, as a plain sentence. Also best weekday per habit and best focus hour.

## Phases

### Phase 0: Foundation and deploy

Vite + React + TypeScript; Tailwind v4 tokens from the Design section; fonts; `vite-plugin-pwa` (`injectManifest`, `src/sw.ts`) and manifest; an original app mark (a 3×3 tile grid with one lit tile) exported to icons and startup images; hash router with five tabs (Today, Habits, Tasks, Goals, You) as placeholders; app shell with safe areas, collapsing large titles, the floating blurred tab bar and the + button; install screen when not standalone; GitHub Actions deploy workflow (install, test, build, `upload-pages-artifact`, `deploy-pages`); Vitest and Playwright set up with one smoke test; `CLAUDE.md`.

Done when:
- [ ] Live at `https://<user>.github.io/<repo>/`
- [ ] Adds to Home Screen, opens standalone, launches black with no white flash
- [ ] Reloads offline after the first visit
- [ ] Tab bar clears the home indicator; headers clear the Dynamic Island
- [ ] CI is green

### Phase 1: Design system and motion kit

In `src/ui` and `src/motion`: Tile (off, partial 1–4, done, skipped, unscheduled, today outline, future), WeekStrip, YearGrid (SVG, 53×7, month labels, scrolls into the past, anchored on the current week), Sheet, ActionSheet, SwipeRow, Button (primary, secondary, ghost, destructive), SegmentedControl, Stepper, Ring, Odometer, DotNumber (Doto), Toast with Undo, EmptyState, ListGroup (inset grouped), TextField, ColorPicker (LED palette), IconPicker (searchable Phosphor), `useLongPress`, `haptic()`, `sound()`, spring presets, `celebrate()`. A hidden `#/dev` page shows every component with theme and reduced-motion toggles.

Done when:
- [ ] Every component renders in both themes on `#/dev`
- [ ] Tile light-up and long-press feel right on a real iPhone; a 365-tile grid scrolls without jank
- [ ] Reduced motion verified

### Phase 2: Data and rules

Dexie schema v1, repository hooks with `useLiveQuery`, all of `src/domain` with tests, a settings store, and a demo seed (a realistic year with streaks, gaps, skips, focus sessions and moods) behind "Load demo data" on `#/dev`. From Phase 3 on, every feature writes XP through the ledger as it's built; the visible game layer arrives in Phase 9.

Done when:
- [ ] All rule tests pass, including every listed edge case
- [ ] Seeded year grids look believable
- [ ] A migration test harness exists for future schema versions

### Phase 3: Habits

Habits tab with a Week view (swipe between weeks) and a Year view (every habit as a year grid). Habit editor sheet: name, icon, color, type, target and unit, schedule, skips per week, life area, goal link, auto-complete from journal or focus. Tap a tile to toggle or increment; long-press for the action sheet (set exact value, skip, add note, focus on this, edit, archive). Habit page with Doto stats, year grid, month calendar, weekday bars and notes history. Reorder mode, archive and restore, and about 24 templates: water 8 glasses, read 20 pages, workout, 10k steps, meditate 10 min, deep work 90 min, stretch, sleep by 23:30, journal, language 15 min, instrument 20 min, no sugar, vitamins, floss, make bed, no phone first hour, plan tomorrow, gym 3× a week, call family 2× a week, meal prep on Sundays, weekly budget review, weekly tidy, side project 45 min, gratitude.

Done when:
- [ ] All three habit types work, including partial states
- [ ] Schedules and skips render correctly; streaks match the rules tests
- [ ] Past days can be edited by navigating weeks
- [ ] VoiceOver reads each tile, e.g. "Tuesday 30 September, 6 of 8 glasses"

### Phase 4: Today and first run

Today changes with the time of day, respecting the day-start setting. Morning: pick the main focus and answer morning prompts. Daytime: main focus, habits due as a tap row, an agenda timeline of time blocks with a live now-line, tasks due. Evening (after 18:00): evening reflection and a day recap (habits, focus minutes, tasks, XP). Today's XP in Doto. The + sheet offers habit, task, focus, journal, note and goal (and "Ask Claude" once Phase 13 is on). A backup banner appears after 7 days without an export. First run: install screen if needed, name, starter habits from templates, week start and day-start time, then "Start fresh" or "Explore with demo data" (erasable).

Done when:
- [ ] Completing the main focus gives +25 XP with its own animation
- [ ] Morning, day and evening layouts switch at the right times
- [ ] The launch tile sequence plays once per cold start

### Phase 5: Tasks

List view (Inbox, Today, Upcoming, Someday) and Board view (Backlog, To do, Doing, Done; one column per screen, swipe between columns, drag cards across). Quick add with natural language, e.g. "pay rent fri 9am #home !2" becomes due date, time, tag and priority, shown as live chips while typing (chrono-node plus a small parser). Task sheet: notes, subtasks, tags, priority, due date, time block, recurrence, goal link. Swipe right to complete; swipe left to reschedule or delete. Search and tag filter.

Done when:
- [ ] Parser tests cover at least 20 phrases
- [ ] Recurring tasks never duplicate
- [ ] Completing awards XP, and Undo removes it

### Phase 6: Focus

Pomodoro (default 25/5 with a long break every 4, all editable) and Open mode, with a link picker (habit, task or tag). The timer is a tile board: Pomodoro uses 25 tiles that each stand for 1/25 of the session; Open mode lights one tile per minute and adds rows as it goes. Pause, resume, end. Sessions are saved with their link, and minutes are logged to linked duration habits automatically. Leaving the screen collapses the timer into the island. Completion plays the chime, tick and XP. If the session ended in the background, show "Finished while you were away". Optional screen wake lock (feature-detected). Focus stats for today, the week and by link.

Done when:
- [ ] Time stays accurate across app switches and phone lock
- [ ] Linked duration habits update
- [ ] The island morph works from every tab

### Phase 7: Goals and vision

Goals tab with Goals and Vision segments. Goals are grouped by life area; each shows a progress ring and its pace against a straight line from start to deadline ("2 weeks ahead", "5 days behind"). Goal page: reorderable milestones, a numeric progress log with a small custom SVG line chart, linked habits and tasks, complete or archive with a celebration. Vision: mission statement, eulogy method (guided prompts, then free writing), up to five core values, bucket list by area (checking one off stamps it), vision board (photos resized to 1600px JPEG at 0.8, stored as blobs, masonry grid, full-screen viewer).

Done when:
- [ ] Pace math is tested
- [ ] Photos survive reloads and a backup round-trip

### Phase 8: Journal, notes, weekly review

Journal with a calendar, an entry list and morning/evening flows (one prompt per screen, swipe onward, mood and energy pickers), an editable prompt library, and a mood year grid. Notes: nested pages with expand and collapse, breadcrumbs and "Move to"; markdown editing with a preview toggle; pin; search across titles and bodies. Weekly review on the chosen day (default Sunday), surfaced on Today: an automatic snapshot of the week (habit rate, best streak, focus hours, tasks, XP, average mood), then wins, what got in the way, lessons, top three for next week and a 1–10 rating. The top three show on Today all next week.

Done when:
- [ ] A journal entry auto-completes a journal-linked habit
- [ ] The review snapshot matches Stats
- [ ] Notes nest at least four levels deep

### Phase 9: Game layer

XP bar and level ring on the avatar; the level-up moment; the badge catalog with procedurally drawn SVG badges (shape by category, color by tier, a Phosphor glyph inside, no emoji or external art); an unlock toast that drops from the top with a light sweep; a badge cabinet with locked silhouettes and progress ("37 of 50"). You tab: profile with the year-of-XP grid as the hero, level, total XP, personal league, and links to Stats, Journal, Notes, Weekly review and Settings. Unlockables at levels 5, 10, 20, 30, 50, 75 and 100: extra LED palettes and tile shapes (square, round, diamond).

Done when:
- [ ] Total XP can be recomputed from the ledger at any time
- [ ] Undo never leaves orphan XP
- [ ] Each level-up fires exactly once

### Phase 10: Stats and insights

Overall year grid (daily XP), completion rates per habit (7/30/90/365), best weekday, streak timeline, focus by link, tag and hour, tasks per week, mood trend, and insight sentences ("On days you work out, your mood averages 4.1 vs 3.4"). All charts are custom SVG in the tile language; no chart library.

Done when:
- [ ] Every number cross-checks against the domain functions
- [ ] Insights stay hidden when there isn't enough data

### Phase 11: Settings, backup, themes

Inset grouped Settings: profile, theme (system, dark, light), unlocked palettes, week start, day-start time, review day, sounds, haptics, reduce motion, focus defaults, prompts, life areas, data. Export all tables to versioned JSON (images as base64, the Claude key never included) through the share sheet (Web Share API with files), with a download fallback. Import validates with zod, previews counts, and offers Merge (newer `updatedAt` wins) or Replace. Show storage used and persistence status. "Erase all data" requires typing ERASE.

Done when:
- [ ] Export, erase, import restores everything identically (automated test)
- [ ] Exporting clears the backup banner

### Phase 12 (optional): Reminders through GitHub Actions

iOS 16.4+ supports Web Push for Home Screen apps, but something has to send each push. A scheduled GitHub Actions workflow takes that role, so there's still no server.

Generate VAPID keys once (`npx web-push generate-vapid-keys`). The public key is a repo variable read at build time (`VITE_VAPID_PUBLIC_KEY`); the private key and subject are secrets. Settings, Reminders: "Turn on notifications" (inside a tap) requests permission, calls `pushManager.subscribe`, then offers "Copy reminder setup", which produces `{ subscription, timeZone, reminders: [{ id, title, body, time, days, url }] }` for the user to paste into the `REMINDER_CONFIG` secret (again whenever reminders change). `.github/workflows/reminders.yml` runs every 10 minutes plus manual dispatch, in a concurrency group, executing `scripts/send-reminders.mjs`: it sends anything due in the last 60 minutes that wasn't already sent today, so late runs still deliver exactly once. The sent log lives in `actions/cache` (saved under a new key each run, restored by prefix, pruned to two days). The service worker shows a notification for every push (iOS revokes permission otherwise) and tapping opens the right screen. The app icon badge uses `navigator.setAppBadge()` with habits left today and clears when all are done. Settings copy states the limits: reminders can arrive a few minutes late, and GitHub pauses scheduled workflows in public repos after 60 days without activity.

Done when:
- [ ] A test push arrives on a locked iPhone
- [ ] Overlapping runs never duplicate
- [ ] Tapping a reminder opens that habit

### Phase 13 (optional): Claude command bar

Settings, Claude: paste an Anthropic API key (stored only on this device, excluded from backups, with Remove key) and pick a model (default `claude-haiku-4-5-20251001` for speed and cost, option `claude-sonnet-5-5`; confirm current model IDs at docs.claude.com). A command bar in the + sheet and on Today takes typed or dictated requests like "drank 2 glasses, read 30 pages, add call bank tomorrow 10am".

Client-side tool loop: `fetch` to `https://api.anthropic.com/v1/messages` with headers `x-api-key`, `anthropic-version: 2023-06-01` and `anthropic-dangerous-direct-browser-access: true`. The system prompt carries today's date, the day-start rule and a compact index of habits, goals and tags (ids, names, types). Tools: `log_habit`, `create_task`, `complete_task`, `create_habit`, `log_goal_progress`, `add_note`, `add_journal_entry`, `start_focus`, `get_summary` (read-only stats for questions like "how was my week"). Validate every tool input with zod before writing; stop at `end_turn` or after 6 turns; show each executed action as a chip with one Undo all. Journal and note text is only sent when the request is about it.

Done when:
- [ ] 15 scripted commands produce the right changes
- [ ] A wrong key and being offline give clear, fixable errors
- [ ] The key never appears in exports or logs

### Phase 14: Polish and QA

Motion audit (only user-triggered motion, plus the level-up and launch moments); empty, one, many and long-text states on every screen; a copy pass; initial JS under about 250 KB gzipped, with route-level splitting for Stats, Notes, Vision and Claude; memoized year grids; accessibility (labels, 44px targets, AA contrast, logical focus order); the full Playwright screenshot set; an on-device checklist: install, offline, lock during focus, kill and reopen, rotate, large backup import, Low Power Mode.

Done when:
- [ ] Screenshot review findings are fixed
- [ ] The on-device checklist passes

## Progress

- [x] Phase 0: Foundation and deploy
- [ ] Phase 1: Design system and motion kit
- [ ] Phase 2: Data and rules
- [ ] Phase 3: Habits
- [ ] Phase 4: Today and first run
- [ ] Phase 5: Tasks
- [ ] Phase 6: Focus
- [ ] Phase 7: Goals and vision
- [ ] Phase 8: Journal, notes, weekly review
- [ ] Phase 9: Game layer
- [ ] Phase 10: Stats and insights
- [ ] Phase 11: Settings, backup, themes
- [ ] Phase 12 (optional): Reminders through GitHub Actions
- [ ] Phase 13 (optional): Claude command bar
- [ ] Phase 14: Polish and QA
