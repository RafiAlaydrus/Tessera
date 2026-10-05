// iPhone portrait sizes: CSS points and device pixel ratio. Drives startup images
// (scripts/generate-icons.ts) and their <link> tags (vite.config.ts).
export const devices = [
  { w: 440, h: 956, r: 3 },
  { w: 430, h: 932, r: 3 },
  { w: 428, h: 926, r: 3 },
  { w: 420, h: 912, r: 3 },
  { w: 414, h: 896, r: 3 },
  { w: 414, h: 896, r: 2 },
  { w: 414, h: 736, r: 3 },
  { w: 402, h: 874, r: 3 },
  { w: 393, h: 852, r: 3 },
  { w: 390, h: 844, r: 3 },
  { w: 375, h: 812, r: 3 },
  { w: 375, h: 667, r: 2 },
]

export const startupName = (d: (typeof devices)[number]) =>
  `startup/${d.w * d.r}x${d.h * d.r}.png`
