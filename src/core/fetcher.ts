import { XMLParser } from 'fast-xml-parser'
import { RateLimiter } from './rate-limiter.js'
import type { BGGConfig } from '../types/index.js'

const DEFAULT_CONFIG: BGGConfig = {
  delayMs: 5000,
  timeoutMs: 30000,
  defaultFormat: 'json'
}

const BGG_API = 'https://api.geekdo.com/xmlapi2/'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: '_text'
})

export class BGGFetcher {
  private rateLimiter: RateLimiter
  private config: BGGConfig
  private authToken: string = ''

  constructor(config: Partial<BGGConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.rateLimiter = new RateLimiter(this.config.delayMs)
  }

  setAuthToken(token: string): void {
    this.authToken = token
  }

  async get<T = unknown>(path: string, params: Record<string, unknown> = {}): Promise<T> {
    await this.rateLimiter.wait()

    const url = new URL(path, BGG_API)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value))
        }
      })
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs)

    try {
      const headers: Record<string, string> = {
        'Accept': 'text/xml',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }

      if (this.authToken) {
        const prefix = this.authToken.startsWith('GeekAuth') ? '' : 'GeekAuth '
        headers['Authorization'] = `${prefix}${this.authToken}`
      }

      const response = await fetch(url, {
        signal: controller.signal,
        headers
      })

      if (response.status === 202) {
        return {
          _queued: true,
          _status: 202,
          _message: 'Request queued by BGG. Retry after a short delay.'
        } as T
      }

      if (!response.ok) {
        throw new Error(`BGG API error: ${response.status} ${response.statusText}`)
      }

      const xml = await response.text()
      return parser.parse(xml) as T
    } finally {
      clearTimeout(timeoutId)
    }
  }

  async getWithRetry<T = unknown>(
    path: string,
    params: Record<string, unknown> = {},
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const result = await this.get<T>(path, params)

        if (result && typeof result === 'object' && '_queued' in result) {
          const delay = Math.pow(2, attempt) * 1000
          console.warn(`BGG processing request, retrying in ${delay}ms...`)
          await new Promise(resolve => setTimeout(resolve, delay))
          continue
        }

        return result
      } catch (error) {
        lastError = error as Error

        if (error instanceof Error) {
          const message = error.message.toLowerCase()
          if (message.includes('rate') || message.includes('429')) {
            const delay = Math.pow(2, attempt) * 1000
            console.warn(`Rate limited, retrying in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }

          if (message.includes('500') || message.includes('503') || message.includes('server error')) {
            const delay = Math.pow(2, attempt) * 1000
            console.warn(`BGG server error, retrying in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }

          if (message.includes('abort')) {
            const delay = Math.pow(2, attempt) * 1000
            console.warn(`Request timeout, retrying in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }
        }

        throw error
      }
    }

    throw lastError
  }

  setCookies(_cookies: string): void {
  }

  clearCookies(): void {
  }

  setDelay(ms: number): void {
    this.config.delayMs = ms
    this.rateLimiter.setMinDelay(ms)
  }

  setJitter(ms: number): void {
    this.rateLimiter.setJitter(ms)
  }

  getRateLimiterInfo() {
    return this.rateLimiter.getInfo()
  }

  getConfig(): BGGConfig {
    return { ...this.config }
  }
}

export const defaultFetcher = new BGGFetcher()
