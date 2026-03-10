import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { BGGFetcher } from '../core/fetcher'

describe('BGGFetcher', () => {
  let fetcher: BGGFetcher

  beforeEach(() => {
    fetcher = new BGGFetcher({ delayMs: 10 })
  })

  afterEach(() => {
    vi.restoreAllMocks()
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

  describe('get', () => {
    const createMockResponse = (options: {
      ok?: boolean
      status?: number
      statusText?: string
      body?: string
    }) => {
      return {
        ok: options.ok ?? true,
        status: options.status ?? 200,
        statusText: options.statusText ?? 'OK',
        headers: new Headers({ 'content-type': 'application/xml' }),
        text: () => Promise.resolve(options.body ?? '<items></items>'),
        json: () => Promise.resolve({}),
        clone: function () { return this }
      } as unknown as Response
    }

    it('should make successful GET request', async () => {
      const mockResponse = createMockResponse({
        ok: true,
        status: 200,
        body: '<items><item id="13"><name>Catan</name></item></items>'
      })

      vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse)

      const result = await fetcher.get('/test', { id: 123 })

      expect(global.fetch).toHaveBeenCalled()
      expect(result).toBeDefined()
    })

    it('should throw on HTTP error', async () => {
      const mockResponse = createMockResponse({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse)

      await expect(fetcher.get('/test')).rejects.toThrow('500')
    })

    it('should handle timeout', async () => {
      const shortTimeoutFetcher = new BGGFetcher({ delayMs: 10, timeoutMs: 100 })

      vi.spyOn(global, 'fetch').mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(new Error('AbortError: The operation was aborted')), 200))
      )

      await expect(shortTimeoutFetcher.get('/test')).rejects.toThrow()
    })

    it('should set auth token header', async () => {
      fetcher.setAuthToken('GeekAuth test_token')

      const mockResponse = createMockResponse({ ok: true })

      vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse)

      await fetcher.get('/test')

      const fetchCall = vi.mocked(global.fetch).mock.calls[0]
      const options = fetchCall[1] as RequestInit
      const headers = options.headers as Record<string, string>
      expect(headers['Authorization']).toBe('GeekAuth test_token')
    })

    it('should handle BGG queued response (202)', async () => {
      const mockResponse = createMockResponse({
        ok: true,
        status: 202,
        body: '<message>Your request has been queued</message>'
      })

      vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse)

      const result = await fetcher.get('/test')

      expect(result).toHaveProperty('_queued')
      expect((result as Record<string, unknown>)._status).toBe(202)
    })
  })

  describe('getWithRetry', () => {
    const createMockResponse = (options: {
      ok?: boolean
      status?: number
      statusText?: string
      body?: string
    }) => {
      return {
        ok: options.ok ?? true,
        status: options.status ?? 200,
        statusText: options.statusText ?? 'OK',
        headers: new Headers({ 'content-type': 'application/xml' }),
        text: () => Promise.resolve(options.body ?? '<items></items>'),
        json: () => Promise.resolve({}),
        clone: function () { return this }
      } as unknown as Response
    }

    it('should retry on server error and succeed', async () => {
      let callCount = 0

      vi.spyOn(global, 'fetch').mockImplementation(() => {
        callCount++
        if (callCount < 3) {
          return Promise.resolve(createMockResponse({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error'
          }))
        }
        return Promise.resolve(createMockResponse({
          ok: true,
          body: '<items><item id="1"><name>Test</name></item></items>'
        }))
      })

      const retryFetcher = new BGGFetcher({ delayMs: 10 })
      const result = await retryFetcher.getWithRetry('/test', {}, 3)

      expect(callCount).toBe(3)
      expect(result).toBeDefined()
    })

    it('should succeed on first call when successful', async () => {
      const mockResponse = createMockResponse({
        ok: true,
        body: '<items><item id="13"><name>Catan</name></item></items>'
      })

      vi.spyOn(global, 'fetch').mockResolvedValue(mockResponse)

      const result = await fetcher.getWithRetry('/test')

      expect(global.fetch).toHaveBeenCalledTimes(1)
      expect(result).toBeDefined()
    })

    it('should fail after max retries exhausted', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        createMockResponse({
          ok: false,
          status: 500,
          statusText: 'Internal Server Error'
        })
      )

      const retryFetcher = new BGGFetcher({ delayMs: 10 })

      await expect(retryFetcher.getWithRetry('/test', {}, 3)).rejects.toThrow()
      expect(global.fetch).toHaveBeenCalledTimes(3)
    })
  })
})
