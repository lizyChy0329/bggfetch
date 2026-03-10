import { describe, it, expect } from 'vitest'
import { CookieManager } from '../core/cookie-manager'

describe('CookieManager', () => {
  it('should parse cookies correctly', () => {
    const manager = new CookieManager()
    const cookies = 'bb_session=abc123; bgguser=testuser; bggpass=secret'
    const parsed = manager.parseCookies(cookies)

    expect(parsed['bb_session']).toBe('abc123')
    expect(parsed['bgguser']).toBe('testuser')
    expect(parsed['bggpass']).toBe('secret')
  })

  it('should handle empty cookie string', () => {
    const manager = new CookieManager()
    const parsed = manager.parseCookies('')

    expect(Object.keys(parsed).length).toBe(0)
  })

  it('should handle cookies without values', () => {
    const manager = new CookieManager()
    const cookies = 'bb_session=abc123; empty_key'
    const parsed = manager.parseCookies(cookies)

    expect(parsed['bb_session']).toBe('abc123')
    expect(parsed['empty_key']).toBe('')
  })

  it('should validate valid cookies', () => {
    const manager = new CookieManager()
    const valid = manager.validateCookies('bb_session=abc123')
    expect(valid).toBe(true)
  })

  it('should invalidate empty cookies', () => {
    const manager = new CookieManager()
    const invalid = manager.validateCookies('')
    expect(invalid).toBe(false)
  })
})
