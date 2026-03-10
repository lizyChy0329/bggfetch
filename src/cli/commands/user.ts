import { BGGFetcher } from '../../core/fetcher.js'
import { BGGXMLParser } from '../../core/parser.js'
import { cookieManager } from '../../core/cookie-manager.js'
import { output } from '../../utils/output.js'

interface UserOptions {
  buddies: boolean
  hot: boolean
  format: string
}

export async function userCommand(username: string, options: UserOptions): Promise<void> {
  const fetcher = new BGGFetcher()
  const parser = new BGGXMLParser()

  const cookies = cookieManager.getCookies()
  if (cookies) {
    fetcher.setCookies(cookies)
  }

  try {
    let params = `name=${encodeURIComponent(username)}`
    if (options.buddies) params += '&buddies=1'
    if (options.hot) params += '&hot=1'

    const xml = await fetcher.getWithRetry(`/xmlapi2/user?${params}`)
    const user = parser.parseUser(xml as string)

    if (!user) {
      console.error(`User ${username} not found`)
      process.exit(1)
    }

    output(user, options.format as 'json' | 'jsonl' | 'csv')
  } catch (error) {
    console.error('Error fetching user:', error)
    process.exit(1)
  }
}
