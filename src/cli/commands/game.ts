import { BGGFetcher } from '../../core/fetcher.js'
import { BGGXMLParser } from '../../core/parser.js'
import { cookieManager } from '../../core/cookie-manager.js'
import { output } from '../../utils/output.js'

interface GameOptions {
  format: string
}

export async function gameCommand(id: string, options: GameOptions): Promise<void> {
  const fetcher = new BGGFetcher()
  const parser = new BGGXMLParser()

  const cookies = cookieManager.getCookies()
  if (cookies) {
    fetcher.setCookies(cookies)
  }

  try {
    const xml = await fetcher.getWithRetry(`/xmlapi2/thing?id=${id}&stats=1`)
    const game = parser.parseGame(xml as string)

    if (!game) {
      console.error(`Game with ID ${id} not found`)
      process.exit(1)
    }

    output(game, options.format as 'json' | 'jsonl' | 'csv')
  } catch (error) {
    console.error('Error fetching game:', error)
    process.exit(1)
  }
}
