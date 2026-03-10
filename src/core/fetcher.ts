import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { RateLimiter } from './rate-limiter.js'
import type { BGGConfig } from '../types/index.js'

const DEFAULT_CONFIG: BGGConfig = {
  delayMs: 5000,
  timeoutMs: 30000,
  defaultFormat: 'json'
}

export class BGGFetcher {
  private client: AxiosInstance
  private rateLimiter: RateLimiter
  private config: BGGConfig
  private cookies: string = ''

  constructor(config: Partial<BGGConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.rateLimiter = new RateLimiter(this.config.delayMs)
    this.client = axios.create({
      baseURL: 'https://boardgamegeek.com',
      timeout: this.config.timeoutMs,
      headers: {
        'User-Agent': 'bggfetch/1.0 (Board Game Data CLI)',
        'Accept': 'application/xml'
      }
    })
  }

  async get<T = string>(path: string, config: AxiosRequestConfig = {}): Promise<T> {
    await this.rateLimiter.wait()

    const requestHeaders: Record<string, string> = {}
    if (this.cookies) {
      requestHeaders['Cookie'] = this.cookies
    }

    const response: AxiosResponse<T> = await this.client.get(path, {
      ...config,
      headers: { ...requestHeaders, ...config.headers } as typeof config.headers
    })

    return response.data
  }

  async getWithRetry<T = string>(
    path: string,
    config: AxiosRequestConfig = {},
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.get<T>(path, config)
      } catch (error) {
        lastError = error as Error

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 429) {
            const delay = Math.pow(2, attempt) * 1000
            console.warn(`Rate limited, retrying in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }

          if (error.response?.status === 202) {
            const delay = Math.pow(2, attempt) * 1000
            console.warn(`BGG processing request, retrying in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }

          if (error.response?.status === 500 || error.response?.status === 503) {
            const delay = Math.pow(2, attempt) * 1000
            console.warn(`BGG server error, retrying in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
            continue
          }
        }

        throw error
      }
    }

    throw lastError
  }

  setCookies(cookies: string): void {
    this.cookies = cookies
  }

  clearCookies(): void {
    this.cookies = ''
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
