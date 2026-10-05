// iOS Safari has no navigator.vibrate. On iOS 18+, clicking the label of a hidden
// <input type="checkbox" switch> inside a user gesture plays the system tick.
let enabled = true
let label: HTMLLabelElement | undefined

export const setHapticsEnabled = (on: boolean) => {
  enabled = on
}

const isIOS = () => typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent)

export function haptic() {
  if (!enabled || !isIOS()) return
  if (!label) {
    label = document.createElement('label')
    label.setAttribute('aria-hidden', 'true')
    label.style.cssText =
      'position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden'
    const input = document.createElement('input')
    input.type = 'checkbox'
    input.setAttribute('switch', '')
    label.append(input)
    document.body.append(label)
  }
  label.click()
}
