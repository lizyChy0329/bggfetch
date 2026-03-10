import { BGGFetcher } from '../../core/fetcher.js'
import { BGGXMLParser } from '../../core/parser.js'
import { output } from '../../utils/output.js'

interface HotOptions {
  type: string
  num: string
  format: string
}

export async function hotCommand(options: HotOptions): Promise<void> {
  const fetcher = new BGGFetcher()
  const parser = new BGGXMLParser()

  const authToken = process.env.BGG_AUTH_TOKEN
  fetcher.setAuthToken(authToken || '')

  try {
    const params: Record<string, unknown> = {}
    if (options.type) params.type = options.type
    if (options.num) params.maxItems = parseInt(options.num, 10)

    const data = await fetcher.getWithRetry('/hot', params)
    const hot = parser.parseHotFromAPI(data)

    output(hot.items, options.format as 'json' | 'jsonl' | 'csv')
  } catch (error) {
    console.error('Error fetching hot items:', error)
    process.exit(1)
  }
}
