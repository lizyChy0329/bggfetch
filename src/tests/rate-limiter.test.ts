import { describe, it, expect, beforeEach, vi } from 'vitest'
import { RateLimiter } from '../core/rate-limiter'

describe('RateLimiter', () => {
  let limiter: RateLimiter

  beforeEach(() => {
    limiter = new RateLimiter(100, 0) // 100ms delay, no jitter for testing
  })

  it('should initialize with correct default values', () => {
    const info = limiter.getInfo()
    expect(info.requestCount).toBe(0)
    expect(info.lastRequestTime).toBe(0)
  })

  it('should wait the specified delay on first call', async () => {
    const start = Date.now()
    await limiter.wait()
    const elapsed = Date.now() - start

    // Should wait at least minDelay (100ms)
    expect(elapsed).toBeGreaterThanOrEqual(90)
  })

  it('should track request count correctly', async () => {
    await limiter.wait()
    await limiter.wait()
    await limiter.wait()

    const info = limiter.getInfo()
    expect(info.requestCount).toBe(3)
  })

  it('should reset counter correctly', async () => {
    await limiter.wait()
    await limiter.wait()

    limiter.reset()
    const info = limiter.getInfo()

    expect(info.requestCount).toBe(0)
    expect(info.lastRequestTime).toBe(0)
  })

  it('should add jitter to delay when configured', async () => {
    const limiterWithJitter = new RateLimiter(100, 50)

    // Mock Math.random to return 0.8 (so jitter = 40ms)
    vi.spyOn(Math, 'random').mockReturnValue(0.8)

    const start = Date.now()
    await limiterWithJitter.wait()
    const elapsed = Date.now() - start

    // Should be around 140ms (100 + 40), allow some tolerance
    expect(elapsed).toBeGreaterThanOrEqual(130)

    vi.restoreAllMocks()
  })

  it('should update lastRequestTime after wait', async () => {
    const beforeWait = Date.now()
    await limiter.wait()
    const afterWait = Date.now()

    const info = limiter.getInfo()
    expect(info.lastRequestTime).toBeGreaterThanOrEqual(beforeWait)
    expect(info.lastRequestTime).toBeLessThanOrEqual(afterWait)
  })

  it('should allow configuring minDelay', () => {
    limiter.setMinDelay(200)
    // The internal state is hard to test directly, but the method should exist
    expect(() => limiter.setMinDelay(200)).not.toThrow()
  })

  it('should allow configuring jitter', () => {
    limiter.setJitter(100)
    expect(() => limiter.setJitter(100)).not.toThrow()
  })
})
