import { BGGFetcher } from '../../core/fetcher.js'
import { BGGXMLParser } from '../../core/parser.js'
import { cookieManager } from '../../core/cookie-manager.js'
import { output } from '../../utils/output.js'

interface CollectionOptions {
  type: string
  status: string
  format: string
}

export async function collectionCommand(username: string, options: CollectionOptions): Promise<void> {
  const fetcher = new BGGFetcher()
  const parser = new BGGXMLParser()

  const cookies = cookieManager.getCookies()
  if (!cookies) {
    console.error('Authentication required. Use: bggfetch auth set "your cookies"')
    process.exit(1)
  }
  fetcher.setCookies(cookies)

  try {
    let params = `username=${encodeURIComponent(username)}&subtype=${options.type}`
    if (options.status) params += `&status=${options.status}`

    let xml = await fetcher.getWithRetry(`/xmlapi2/collection?${params}`)
    let collection = parser.parseCollection(xml as string)

    while (collection.total === -1) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      xml = await fetcher.getWithRetry(`/xmlapi2/collection?${params}`)
      collection = parser.parseCollection(xml as string)
    }

    output(collection.items, options.format as 'json' | 'jsonl' | 'csv')
  } catch (error) {
    console.error('Error fetching collection:', error)
    process.exit(1)
  }
}
