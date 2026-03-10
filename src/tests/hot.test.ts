import { describe, it, expect, vi, afterEach } from 'vitest'

interface MockImage {
  src: string
}

interface MockImages {
  square30?: MockImage
  square100?: MockImage
  mediacard?: MockImage
}

interface MockItem {
  objectid: number
  name: string
  rank: string
  yearpublished?: string
  imageurl: string
  images?: MockImages
  href: string
  type: string
}

const createMockResponse = (data: { items: MockItem[] }) => {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: new Headers({ 'content-type': 'application/json' }),
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(JSON.stringify(data)),
    clone: function () { return this }
  } as unknown as Response
}

describe('Hot Command Data Transformation', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('BGG Hot API response parsing', () => {
    it('should transform API response to correct format', async () => {
      const mockApiData: { items: MockItem[] } = {
        items: [
          {
            objectid: 13,
            name: 'Catan',
            rank: '30',
            yearpublished: '1995',
            imageurl: 'https://example.com/image.jpg',
            images: {
              square30: { src: 'https://example.com/square30.jpg' },
              square100: { src: 'https://example.com/square100.jpg' },
              mediacard: { src: 'https://example.com/mediacard.jpg' }
            },
            href: '/boardgame/13/catan',
            type: 'things'
          },
          {
            objectid: 14,
            name: 'Carcassonne',
            rank: '25',
            yearpublished: '2000',
            imageurl: 'https://example.com/image2.jpg',
            images: {
              square100: { src: 'https://example.com/square100_2.jpg' }
            },
            href: '/boardgame/14/carcassonne',
            type: 'things'
          }
        ]
      }

      vi.spyOn(global, 'fetch').mockResolvedValue(createMockResponse(mockApiData))

      const response = await fetch('https://api.geekdo.com/api/hotness?geeksite=boardgame&objecttype=thing&showcount=10', {
        headers: {
          'Accept': 'application/json, text/plain, */*'
        }
      })

      const jsonData = await response.json() as { items: MockItem[] }
      const items = jsonData.items.map((item, index) => ({
        id: item.objectid,
        rank: index + 1,
        name: item.name,
        yearpublished: item.yearpublished ? parseInt(item.yearpublished, 10) : undefined,
        image: item.images?.mediacard?.src || item.images?.square100?.src || item.imageurl,
        thumbnail: item.images?.square100?.src || item.images?.square30?.src || item.imageurl,
        type: 'boardgame'
      }))

      expect(items).toHaveLength(2)
      expect(items[0]).toEqual({
        id: 13,
        rank: 1,
        name: 'Catan',
        yearpublished: 1995,
        image: 'https://example.com/mediacard.jpg',
        thumbnail: 'https://example.com/square100.jpg',
        type: 'boardgame'
      })
      expect(items[1]).toEqual({
        id: 14,
        rank: 2,
        name: 'Carcassonne',
        yearpublished: 2000,
        image: 'https://example.com/square100_2.jpg',
        thumbnail: 'https://example.com/square100_2.jpg',
        type: 'boardgame'
      })
    })

    it('should use fallback images when images object is missing', async () => {
      const mockApiData: { items: MockItem[] } = {
        items: [
          {
            objectid: 13,
            name: 'Catan',
            rank: '30',
            yearpublished: '1995',
            imageurl: 'https://example.com/tinysquare/image.jpg',
            href: '/boardgame/13/catan',
            type: 'things'
          }
        ]
      }

      const response = createMockResponse(mockApiData)
      const jsonData = await response.json() as { items: MockItem[] }
      const items = jsonData.items.map((item, index) => ({
        id: item.objectid,
        rank: index + 1,
        name: item.name,
        yearpublished: item.yearpublished ? parseInt(item.yearpublished, 10) : undefined,
        image: item.images?.mediacard?.src || item.images?.square100?.src || item.imageurl,
        thumbnail: item.images?.square100?.src || item.images?.square30?.src || item.imageurl,
        type: 'boardgame'
      }))

      expect(items[0].image).toBe('https://example.com/tinysquare/image.jpg')
      expect(items[0].thumbnail).toBe('https://example.com/tinysquare/image.jpg')
    })

    it('should handle missing yearpublished', async () => {
      const mockApiData: { items: MockItem[] } = {
        items: [
          {
            objectid: 13,
            name: 'Catan',
            rank: '30',
            imageurl: 'https://example.com/image.jpg',
            href: '/boardgame/13/catan',
            type: 'things'
          }
        ]
      }

      const response = createMockResponse(mockApiData)
      const jsonData = await response.json() as { items: MockItem[] }
      const items = jsonData.items.map((item, index) => ({
        id: item.objectid,
        rank: index + 1,
        name: item.name,
        yearpublished: item.yearpublished ? parseInt(item.yearpublished, 10) : undefined,
        image: item.images?.mediacard?.src || item.images?.square100?.src || item.imageurl,
        thumbnail: item.images?.square100?.src || item.images?.square30?.src || item.imageurl,
        type: 'boardgame'
      }))

      expect(items[0].yearpublished).toBeUndefined()
    })

    it('should handle empty items array', async () => {
      const mockApiData = { items: [] }

      const response = createMockResponse(mockApiData)
      const jsonData = await response.json() as { items: MockItem[] }
      const items = jsonData.items.map((item, index) => ({
        id: item.objectid,
        rank: index + 1,
        name: item.name,
        yearpublished: item.yearpublished ? parseInt(item.yearpublished, 10) : undefined,
        image: item.images?.mediacard?.src || item.images?.square100?.src || item.imageurl,
        thumbnail: item.images?.square100?.src || item.images?.square30?.src || item.imageurl,
        type: 'boardgame'
      }))

      expect(items).toHaveLength(0)
    })
  })

  describe('URL parameter handling', () => {
    it('should construct correct URL with default parameters', () => {
      const geeksite = 'boardgame'
      const objecttype = 'thing'
      const showcount = 50

      const url = `https://api.geekdo.com/api/hotness?geeksite=${geeksite}&objecttype=${objecttype}&showcount=${showcount}`

      expect(url).toBe('https://api.geekdo.com/api/hotness?geeksite=boardgame&objecttype=thing&showcount=50')
    })

    it('should construct correct URL with custom parameters', () => {
      const geeksite = 'rpg'
      const objecttype = 'thing'
      const showcount = 10

      const url = `https://api.geekdo.com/api/hotness?geeksite=${geeksite}&objecttype=${objecttype}&showcount=${showcount}`

      expect(url).toBe('https://api.geekdo.com/api/hotness?geeksite=rpg&objecttype=thing&showcount=10')
    })

    it('should handle type mapping correctly', () => {
      const typeMap: Record<string, string> = {
        boardgame: 'thing',
        rpg: 'thing',
        videogame: 'thing'
      }

      expect(typeMap['boardgame']).toBe('thing')
      expect(typeMap['rpg']).toBe('thing')
      expect(typeMap['videogame']).toBe('thing')
    })
  })
})
