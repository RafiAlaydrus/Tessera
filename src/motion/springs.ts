// Spring presets from the Design section (motion's visualDuration / bounce).
export const springs = {
  press: { type: 'spring', visualDuration: 0.15, bounce: 0 },
  snappy: { type: 'spring', visualDuration: 0.25, bounce: 0.1 },
  sheet: { type: 'spring', visualDuration: 0.4, bounce: 0.05 },
  pop: { type: 'spring', visualDuration: 0.35, bounce: 0.45 },
} as const
