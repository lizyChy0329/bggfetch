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
  if (!cookies) {
    console.error('❌ BGG API now requires authentication.')
    console.error('')
    console.error('Please provide your BGG session cookies:')
    console.error('1. Log into BGG in your browser')
    console.error('2. Open Developer Tools > Application > Cookies')
    console.error('3. Copy the cookie values (bb_session, bgguser)')
    console.error('')
    console.error('Then run: bggfetch auth set "your_cookies"')
    console.error('')
    console.error('Example: bggfetch auth set "bb_session=abc123; bgguser=yourusername"')
    process.exit(1)
  }
  fetcher.setCookies(cookies)

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
