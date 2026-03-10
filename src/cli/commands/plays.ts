import { BGGFetcher } from '../../core/fetcher.js'
import { BGGXMLParser } from '../../core/parser.js'
import { cookieManager } from '../../core/cookie-manager.js'
import { output } from '../../utils/output.js'

interface PlaysOptions {
  game: string
  num: string
  format: string
}

export async function playsCommand(username: string, options: PlaysOptions): Promise<void> {
  const fetcher = new BGGFetcher()
  const parser = new BGGXMLParser()

  const cookies = cookieManager.getCookies()
  if (!cookies) {
    console.error('Authentication required. Use: bggfetch auth set "your cookies"')
    process.exit(1)
  }
  fetcher.setCookies(cookies)

  try {
    let params = `username=${encodeURIComponent(username)}&maxItems=${options.num}`
    if (options.game) params += `&gameid=${options.game}`

    const xml = await fetcher.getWithRetry(`/xmlapi2/plays?${params}`)
    const plays = parser.parsePlays(xml as string)

    output(plays.plays, options.format as 'json' | 'jsonl' | 'csv')
  } catch (error) {
    console.error('Error fetching plays:', error)
    process.exit(1)
  }
}
