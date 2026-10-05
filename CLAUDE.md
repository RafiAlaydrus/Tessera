# Tessera

Personal life tracker for iPhone: a local-first PWA on GitHub Pages (https://github.com/RafiAlaydrus/Tessera, served at `/Tessera/`). `PLAN.md` is the build plan; work one phase at a time and tick it under Progress.

## Working rules

- Minimal, targeted changes. If you see a better approach than the plan, say so and wait for an answer.
- No dependencies outside the stack below without asking. Ask before starting the optional phases (12, 13).
- Before coding a phase, restate its goal in two lines and list anything unclear.
- End of phase: `npm test`, `npm run build`, fix failures, commit as `phase N: <summary>`, tick Progress, then stop and tell the user what to try on their iPhone.
- Never reuse Loggd's name, logo, copy, screenshots or visual design.

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4 (tokens in `@theme`), React Router (hash router), `vite-plugin-pwa` with `injectManifest` and `src/sw.ts`, Phosphor icons, Fontsource fonts, Vitest, Playwright (WebKit, iPhone). Planned: `motion`, Dexie 4 + `dexie-react-hooks`, Zustand, `date-fns`, `zod`, `chrono-node`, `marked` + `dompurify`.

Vite `base`, manifest `start_url` and `scope` are all `/Tessera/`; change them together.

## Commands

| Command | What it does |
|---|---|
| `npm run dev -- --host` | Dev server for a quick Safari check on the same Wi-Fi (no service worker over HTTP) |
| `npm test` | Vitest (`src/**/*.test.ts`) |
| `npm run build` | Typecheck app and service worker, then Vite build into `dist/` |
| `npm run test:e2e` | Playwright smoke test against a built preview on port 4173 |
| `npm run shots` | Review screenshots into `screenshots/` (393×852 and 440×956, dark and light) |
| `npm run icons` | Regenerate app icons and startup images from `public/mark.svg` (Playwright WebKit) |

## Layout

```
index.html  vite.config.ts  playwright.config.ts
public/        mark.svg, icons, startup/ images (generated)
scripts/       devices.ts (iPhone sizes), generate-icons.ts
e2e/           smoke.spec.ts, shots.spec.ts
.github/workflows/   deploy.yml (reminders.yml in Phase 12)
src/
  main.tsx  App.tsx  router.tsx  sw.ts
  styles/      tokens.css (Tailwind + tokens), base.css
  domain/      pure functions with tests (Phase 2)
  db/          Dexie schema, repos, seed, backup (Phase 2)
  state/       Zustand UI state
  ui/          design-system components
  motion/      springs, celebrate, haptics, sound
  features/    today, habits, tasks, goals, profile, onboarding, ...
```

## Data rules

- IndexedDB (Dexie) is the only store. Everything in `src/domain` is a pure function with tests. Components never compute streaks, XP or badges.
- Days are local `YYYY-MM-DD` keys; a "day starts at" setting (default 03:00) decides which day a late-night check belongs to.
- IDs come from `crypto.randomUUID()`. Every row has `createdAt` and `updatedAt` (epoch ms).
- XP is a ledger, never a stored total. Timers store `startedAt` and paused time and derive elapsed from `Date.now()`; never count with `setInterval`.

## Design rules

**Concept: the scoreboard.** Each day is a tile that lights up like an LED pixel; a year of effort is a lit board. Everything around it stays quiet and behaves like a native iOS app.

**Color.** Use the tokens in `src/styles/tokens.css`, never Tailwind's default palette (it is cleared). Dark board is true black. Chrome has no accent color: primary buttons are ink-filled pills; color belongs to habits (the 11 LED colors) and XP (`xp`, badges only). Partial progress is four brightness steps (28, 52, 76, 100%) of the habit color over `tile-off`; only 100% glows. Light theme darkens LED colors via `color-mix(in oklch, <color> 80%, black)`; Ice is `#3A3F47`.

**Type.** Atkinson Hyperlegible Next for all UI. Doto (dot-matrix) only for hero numbers at 32px and up (streaks on a habit page, XP and level, focus timer, today's XP, level-up). Small numbers use the UI font with tabular figures. Scale: 12 caption, 14 secondary, 16 body, 18 row, 21 section, 28 title; Doto 36, 48, 72, 96. Inputs are at least 16px. Sentence case everywhere: no all-caps, no letter-spaced eyebrows, no "A · B · C" meta strings, no arrows on buttons. Weekday headers are single letters.

**Shape and layout.** 4px grid, 20px screen padding, 28px between sections. Radii: tiles 28% of size, panels 22px, sheet tops 28px, inputs 14px, buttons full pills. No drop shadows in dark mode (elevation is a lighter surface). Only the tab bar and the island use backdrop blur. iOS structure: large titles that collapse, inset grouped lists, left-aligned content, numbers right-aligned in rows. Habits are rows on the board, not boxed cards.

**Motion.** Springs (`visualDuration`/`bounce`): press 0.15/0, snappy 0.25/0.1, sheet 0.4/0.05, pop 0.35/0.45. Motion answers what the user did: light a tile, count habits, long-press ring (450ms, cancel past 8px), sheets (drag to dismiss, page behind scales to 0.94), push navigation, sliding tab indicator, island, level-up (under 1.8s, tap to skip), launch tile sequence on cold start only. Nothing else moves on its own. Animate only transform and opacity (glow is a pre-blurred layer whose opacity changes). Lists animate on add and remove only. Wrap the app in `<MotionConfig reducedMotion="user">`.

**Haptics and sound.** `haptic()` clicks a hidden `<input type="checkbox" switch>` label inside a user gesture (iOS 18+), feature-detected, with a setting to disable. Sounds are tiny Web Audio blips, off by default except the focus-end chime.

**Words.** Plain verbs, sentence case, no filler. Buttons say what happens ("Save habit"), the toast repeats it ("Habit saved"). Empty states give one next step. Errors say what happened and how to fix it. No exclamation marks, no emoji, no "Welcome back".

**Anti-slop check.** Before finishing a phase that adds UI, run `npm run shots` and review every new screen. A screen fails if it has decorative gradients; blur beyond the tab bar and island; everything boxed in identical rounded cards with the same shadow; emoji as icons, or mixed icon styles within a role (habit icons are Phosphor duotone tinted with the habit color, UI icons are Phosphor regular); placeholder or lorem text; spinners for local data; or no designed empty, single-item, many-item and long-text states.

## iOS PWA requirements

- Layout uses `100dvh` and `env(safe-area-inset-*)`; the tab bar clears the home indicator, headers clear the Dynamic Island.
- Interactive elements: `touch-action: manipulation`, no tap highlight, no touch callout, no user-select (see `base.css`). Body has `overscroll-behavior: none`; scroll inside containers.
- Sheets with inputs follow `visualViewport` so the keyboard never covers a field.
- Call `navigator.storage.persist()` on first run and show the result in Settings. Safari and the Home Screen app have separate storage; real use is in the installed app.
- iOS has no install prompt: iOS Safari tabs show the install screen (dismissal is per session). Service worker updates use prompt mode: the "New version ready" toast reloads on tap.
