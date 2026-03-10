import { BGGFetcher } from '../../core/fetcher.js'
import { BGGXMLParser } from '../../core/parser.js'
import { cookieManager } from '../../core/cookie-manager.js'
import { output } from '../../utils/output.js'

interface HotOptions {
  type: string
  num: string
  format: string
}

export async function hotCommand(options: HotOptions): Promise<void> {
  const fetcher = new BGGFetcher()
  const parser = new BGGXMLParser()

  const cookies = cookieManager.getCookies()
  if (cookies) {
    fetcher.setCookies(cookies)
  }

  try {
    const xml = await fetcher.getWithRetry(
      `/xmlapi2/hot?type=${options.type}&maxItems=${options.num}`
    )
    const hot = parser.parseHot(xml as string)

    output(hot.items, options.format as 'json' | 'jsonl' | 'csv')
  } catch (error) {
    console.error('Error fetching hot items:', error)
    process.exit(1)
  }
}
