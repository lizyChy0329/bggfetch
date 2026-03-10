import type { RateLimitInfo } from '../types/index.js'

export class RateLimiter {
  private minDelay: number
  private info: RateLimitInfo = {
    lastRequestTime: 0,
    requestCount: 0
  }
  private jitter: number

  constructor(minDelayMs: number = 5000, jitterMs: number = 1000) {
    this.minDelay = minDelayMs
    this.jitter = jitterMs
  }

  async wait(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.info.lastRequestTime

    let delay = this.minDelay

    if (timeSinceLastRequest < this.minDelay) {
      delay = this.minDelay - timeSinceLastRequest
    }

    if (this.jitter > 0) {
      const jitterAmount = Math.floor(Math.random() * this.jitter)
      delay += jitterAmount
    }

    if (delay > 0) {
      await this.sleep(delay)
    }

    this.info.lastRequestTime = Date.now()
    this.info.requestCount++
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  getInfo(): RateLimitInfo {
    return { ...this.info }
  }

  reset(): void {
    this.info = {
      lastRequestTime: 0,
      requestCount: 0
    }
  }

  setMinDelay(ms: number): void {
    this.minDelay = ms
  }

  setJitter(ms: number): void {
    this.jitter = ms
  }
}

export const defaultRateLimiter = new RateLimiter()
