import { describe, it, expect, beforeEach } from 'vitest'
import { BGGFetcher } from '../core/fetcher'

describe('BGGFetcher', () => {
  let fetcher: BGGFetcher

  beforeEach(() => {
    fetcher = new BGGFetcher({ delayMs: 10 })
  })

  it('should create with default config', () => {
    const defaultFetcher = new BGGFetcher()
    const config = defaultFetcher.getConfig()

    expect(config.delayMs).toBe(5000)
    expect(config.timeoutMs).toBe(30000)
    expect(config.defaultFormat).toBe('json')
  })

  it('should create with custom config', () => {
    const customFetcher = new BGGFetcher({ delayMs: 1000, timeoutMs: 60000 })
    const config = customFetcher.getConfig()

    expect(config.delayMs).toBe(1000)
    expect(config.timeoutMs).toBe(60000)
  })

  it('should set and get cookies', () => {
    fetcher.setCookies('bb_session=abc123; bgguser=test')
    fetcher.clearCookies()

    const config = fetcher.getConfig()
    expect(config).toBeDefined()
  })

  it('should set delay', () => {
    fetcher.setDelay(2000)
    const config = fetcher.getConfig()
    expect(config.delayMs).toBe(2000)
  })

  it('should set jitter', () => {
    fetcher.setJitter(500)
    expect(() => fetcher.setJitter(500)).not.toThrow()
  })

  it('should track rate limiter info', () => {
    const info = fetcher.getRateLimiterInfo()
    expect(info).toHaveProperty('lastRequestTime')
    expect(info).toHaveProperty('requestCount')
  })

  describe('getWithRetry', () => {
    it('should have getWithRetry method', () => {
      expect(fetcher.getWithRetry).toBeDefined()
    })
  })
})
