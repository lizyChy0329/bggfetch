import { output } from '../../utils/output.js'

interface HotOptions {
  type: string
  num: string
  format: string
}

interface BGGHotItem {
  objectid: number
  name: string
  rank: string
  yearpublished: string
  description: string
  imageurl: string
  images?: {
    square30?: { src: string }
    square100?: { src: string }
    mediacard?: { src: string }
  }
  href: string
}

export async function hotCommand(options: HotOptions): Promise<void> {
  try {
    const typeMap: Record<string, string> = {
      boardgame: 'thing',
      rpg: 'thing',
      videogame: 'thing'
    }

    const geeksite = options.type || 'boardgame'
    const objecttype = typeMap[geeksite] || 'thing'
    const showcount = parseInt(options.num, 10) || 50

    const url = `https://api.geekdo.com/api/hotness?geeksite=${geeksite}&objecttype=${objecttype}&showcount=${showcount}`

    const headers: Record<string, string> = {
      'Accept': 'application/json, text/plain, */*',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://boardgamegeek.com/'
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`BGG API error: ${response.status} ${response.statusText}`)
    }

    const jsonData = await response.json() as { items: BGGHotItem[] }
    const items = jsonData.items.map((item, index) => ({
      id: item.objectid,
      rank: index + 1,
      name: item.name,
      yearpublished: item.yearpublished ? parseInt(item.yearpublished, 10) : undefined,
      image: item.images?.mediacard?.src || item.images?.square100?.src || item.imageurl,
      thumbnail: item.images?.square100?.src || item.images?.square30?.src || item.imageurl,
      type: 'boardgame'
    }))

    output(items, options.format as 'json' | 'jsonl' | 'csv')
  } catch (error) {
    console.error('Error fetching hot items:', error)
    process.exit(1)
  }
}
