import { describe, expect, it } from 'vitest'
import { needsInstallScreen } from './install'

describe('needsInstallScreen', () => {
  const base = { standalone: false, ios: true, dismissed: false }
  it('shows in iOS Safari tabs', () => expect(needsInstallScreen(base)).toBe(true))
  it('hides once installed', () => expect(needsInstallScreen({ ...base, standalone: true })).toBe(false))
  it('hides after Continue in browser', () => expect(needsInstallScreen({ ...base, dismissed: true })).toBe(false))
  it('hides on non-iOS browsers', () => expect(needsInstallScreen({ ...base, ios: false })).toBe(false))
})
