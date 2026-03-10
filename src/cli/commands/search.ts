import { BGGFetcher } from '../../core/fetcher.js'
import { BGGXMLParser } from '../../core/parser.js'
import { cookieManager } from '../../core/cookie-manager.js'
import { output } from '../../utils/output.js'

interface SearchOptions {
  num: string
  format: string
}

export async function searchCommand(query: string, options: SearchOptions): Promise<void> {
  const fetcher = new BGGFetcher()
  const parser = new BGGXMLParser()

  const cookies = cookieManager.getCookies()
  if (cookies) {
    fetcher.setCookies(cookies)
  }

  try {
    const encodedQuery = encodeURIComponent(query)
    const xml = await fetcher.getWithRetry(
      `/xmlapi2/search?query=${encodedQuery}&type=boardgame&maxResults=${options.num}`
    )
    const result = parser.parseSearch(xml as string)

    output(result.items, options.format as 'json' | 'jsonl' | 'csv')
  } catch (error) {
    console.error('Error searching:', error)
    process.exit(1)
  }
}
