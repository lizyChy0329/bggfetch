import { describe, it, expect } from 'vitest'

describe('Integration: BGG API', () => {
  describe('Hot JSON API (public)', () => {
    it('should fetch hot boardgames from BGG API', async () => {
      const url = 'https://api.geekdo.com/api/hotness?geeksite=boardgame&objecttype=thing&showcount=10'

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      expect(response.ok).toBe(true)
      expect(response.status).toBe(200)

      const data = await response.json() as { items: Array<Record<string, unknown>> }
      expect(data.items).toBeDefined()
      expect(Array.isArray(data.items)).toBe(true)
      expect(data.items.length).toBeGreaterThan(0)
    }, 30000)

    it('should return valid hot item structure', async () => {
      const url = 'https://api.geekdo.com/api/hotness?geeksite=boardgame&objecttype=thing&showcount=5'

      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json'
        }
      })

      const data = await response.json() as { items: Array<Record<string, unknown>> }
      const item = data.items[0]

      expect(item.objectid).toBeDefined()
      expect(item.name).toBeDefined()
      expect(typeof item.name).toBe('string')
      expect(item.href).toContain('/boardgame/')
    }, 30000)

    it('should respect showcount parameter', async () => {
      const count = 3
      const url = `https://api.geekdo.com/api/hotness?geeksite=boardgame&objecttype=thing&showcount=${count}`

      const response = await fetch(url)
      const data = await response.json() as { items: unknown[] }

      expect(data.items.length).toBeLessThanOrEqual(count)
    }, 30000)

    it('should return different games for rpg category', async () => {
      const boardgameUrl = 'https://api.geekdo.com/api/hotness?geeksite=boardgame&objecttype=thing&showcount=5'
      const rpgUrl = 'https://api.geekdo.com/api/hotness?geeksite=rpg&objecttype=thing&showcount=5'

      const [boardgameResponse, rpgResponse] = await Promise.all([
        fetch(boardgameUrl),
        fetch(rpgUrl)
      ])

      const boardgameData = await boardgameResponse.json() as { items: Array<{ objectid: number }> }
      const rpgData = await rpgResponse.json() as { items: Array<{ objectid: number }> }

      const boardgameIds = boardgameData.items.map(i => i.objectid)
      const rpgIds = rpgData.items.map(i => i.objectid)

      expect(boardgameIds).not.toEqual(rpgIds)
    }, 30000)

    it('should handle large showcount', async () => {
      const url = 'https://api.geekdo.com/api/hotness?geeksite=boardgame&objecttype=thing&showcount=50'

      const response = await fetch(url)
      const data = await response.json() as { items: unknown[] }

      expect(data.items.length).toBe(50)
    }, 30000)
  })
})
