// Tiny Web Audio synth blips, no audio files. Off by default except the focus-end chime.
type Note = [freq: number, at: number, dur: number]

const sounds = {
  tick: [[880, 0, 0.04]],
  pop: [[660, 0, 0.06], [990, 0.05, 0.09]],
  chime: [[784, 0, 0.3], [1175, 0.14, 0.5]],
  up: [[523, 0, 0.12], [659, 0.1, 0.12], [784, 0.2, 0.3]],
} satisfies Record<string, Note[]>

export type SoundName = keyof typeof sounds

let enabled = false
let ctx: AudioContext | undefined

export const setSoundEnabled = (on: boolean) => {
  enabled = on
}

export function sound(name: SoundName) {
  if (!enabled && name !== 'chime') return
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return
  ctx ??= new AC()
  void ctx.resume()
  const t0 = ctx.currentTime
  for (const [freq, at, dur] of sounds[name]) {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, t0 + at)
    gain.gain.exponentialRampToValueAtTime(0.12, t0 + at + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + at + dur)
    osc.connect(gain).connect(ctx.destination)
    osc.start(t0 + at)
    osc.stop(t0 + at + dur + 0.02)
  }
}
