// The LED palette: one color per habit. Values live in tokens.css (darkened in the light theme).
export const ledColors = [
  { key: 'ember', name: 'Ember' },
  { key: 'amber', name: 'Amber' },
  { key: 'lemon', name: 'Lemon' },
  { key: 'lime', name: 'Lime' },
  { key: 'mint', name: 'Mint' },
  { key: 'cyan', name: 'Cyan' },
  { key: 'cobalt', name: 'Cobalt' },
  { key: 'violet', name: 'Violet' },
  { key: 'magenta', name: 'Magenta' },
  { key: 'rose', name: 'Rose' },
  { key: 'ice', name: 'Ice' },
] as const

export type LedColor = (typeof ledColors)[number]['key']

export const ledVar = (key: LedColor) => `var(--${key})`
