import { XMLParser } from 'fast-xml-parser'
import type {
  BGGGame,
  BGGSearchResult,
  BGGSearchItem,
  BGGUser,
  BGGCollection,
  BGGCollectionItem,
  BGGHot,
  BGGHotItem,
  BGGPlays,
  BGGPlay
} from '../types/index.js'

const parserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  textNodeName: '#text',
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true
}

export class BGGXMLParser {
  private parser: XMLParser

  constructor() {
    this.parser = new XMLParser(parserOptions)
  }

  parse(xml: string): Record<string, unknown> {
    return this.parser.parse(xml)
  }

  parseGame(xml: string): BGGGame | null {
    const data = this.parse(xml)
    const items = (data as Record<string, unknown>).items as Record<string, unknown> | undefined

    if (!items?.item) return null

    const item = Array.isArray(items.item) ? items.item[0] : items.item

    return this.normalizeGame(item as Record<string, unknown>)
  }

  parseGames(xml: string): BGGGame[] {
    const data = this.parse(xml)
    const items = (data as Record<string, unknown>).items as Record<string, unknown> | undefined

    if (!items?.item) return []

    const itemArray = Array.isArray(items.item) ? items.item : [items.item]

    return itemArray.map(item => this.normalizeGame(item as Record<string, unknown>))
  }

  private normalizeGame(item: Record<string, unknown>): BGGGame {
    const game: BGGGame = {
      id: (item['@_id'] as number) || 0,
      name: this.getName(item),
      yearpublished: item.yearpublished as number | undefined
    }

    if (item.minplayers) game.minplayers = item.minplayers as number
    if (item.maxplayers) game.maxplayers = item.maxplayers as number
    if (item.playingtime) game.playingtime = item.playingtime as number
    if (item.minage) game.minage = item.minage as number
    if (item.image) game.image = item.image as string
    if (item.thumbnail) game.thumbnail = item.thumbnail as string

    if (item.description) {
      game.description = item.description as string
    }

    if (item.statistics) {
      const stats = item.statistics as Record<string, unknown>
      if (stats.ratings) {
        const ratings = stats.ratings as Record<string, unknown>
        game.statistics = {
          usersrated: (ratings.usersrated as number) || 0,
          average: ratings.average as number | undefined,
          bayesaverage: ratings.bayesaverage as number | undefined,
          stddev: ratings.stddev as number | undefined,
          median: ratings.median as number | undefined
        }

        if (ratings.ranks) {
          const ranks = Array.isArray(ratings.ranks)
            ? ratings.ranks
            : [ratings.ranks]
          game.statistics.ranks = ranks.map((r: Record<string, unknown>) => ({
            type: r.type as string,
            id: r.id as number,
            name: r.name as string,
            friendlyname: r.friendlyname as string,
            rank: r.rank as number,
            bayesaverage: r.bayesaverage as string
          }))
        }
      }
    }

    if (item.link) {
      const links = Array.isArray(item.link) ? item.link : [item.link]
      const linkMap = new Map<string, string[]>()

      for (const link of links as Record<string, unknown>[]) {
        const type = link['@_type'] as string
        const value = link['@_value'] as string

        if (!linkMap.has(type)) {
          linkMap.set(type, [])
        }
        linkMap.get(type)!.push(value)
      }

      game.categories = linkMap.get('boardgamecategory')
      game.mechanics = linkMap.get('boardgamemechanic')
      game.publishers = linkMap.get('boardgamepublisher')
      game.designers = linkMap.get('boardgamedesigner')
      game.artists = linkMap.get('boardgameartist')
    }

    return game
  }

  private getName(item: Record<string, unknown>): string {
    const name = item.name
    if (typeof name === 'string') return name
    if (Array.isArray(name)) return (name[0] as Record<string, unknown>)?.['#text'] as string || ''
    if (typeof name === 'object') return (name as Record<string, unknown>)['#text'] as string || ''
    return ''
  }

  parseSearch(xml: string): BGGSearchResult {
    const data = this.parse(xml)
    const items = (data as Record<string, unknown>).items as Record<string, unknown> | undefined

    if (!items) {
      return { total: 0, items: [] }
    }

    const total = (items['@_total'] as number) || 0
    const itemArray = items.item
      ? Array.isArray(items.item)
        ? items.item
        : [items.item]
      : []

    const searchItems: BGGSearchItem[] = itemArray.map((item: Record<string, unknown>) => ({
      id: item['@_id'] as number,
      name: (item.name as Record<string, unknown>)?.['#text'] as string || item.name as string || '',
      type: item['@_type'] as string,
      yearpublished: item.yearpublished as number | undefined,
      image: item.image as string | undefined,
      thumbnail: item.thumbnail as string | undefined
    }))

    return { total, items: searchItems }
  }

  parseUser(xml: string): BGGUser | null {
    const data = this.parse(xml)
    const user = (data as Record<string, unknown>).user as Record<string, unknown> | undefined

    if (!user) return null

    const result: BGGUser = {
      id: (user['@_id'] as number) || 0,
      name: user['@_name'] as string || ''
    }

    if (user.avatar) result.avatar = user.avatar as string
    if (user.avatid) result.avatid = user.avatid as number
    if (user.country) result.country = user.country as string
    if (user.stateorprovince) result.stateorprovince = user.stateorprovince as string
    if (user.city) result.city = user.city as string
    if (user.registered) result.registered = user.registered as number
    if (user.lastlogin) result.lastlogin = user.lastlogin as number
    if (user.browsegames) result.browsegames = user.browsegames as number
    if (user.marketplace) result.marketplace = user.marketplace as number
    if (user.trade) result.trade = user.trade as number
    if (user.wantgames) result.wantgames = user.wantgames as number
    if (user.wanttobuy) result.wanttobuy = user.wanttobuy as number
    if (user.wanttoplay) result.wanttoplay = user.wanttoplay as number
    if (user.owned) result.owned = user.owned as number
    if (user.previouslyowned) result.previouslyowned = user.previouslyowned as number
    if (user.fortrade) result.fortrade = user.fortrade as number

    if (user.buddies) {
      const buddiesData = (user.buddies as Record<string, unknown>).buddy
      if (buddiesData) {
        const buddies = Array.isArray(buddiesData)
          ? buddiesData
          : [buddiesData]
        result.buddies = buddies.map((b: Record<string, unknown>) => ({
          id: b['@_id'] as number,
          name: b.name as string,
          avatar: b.avatar as string | undefined
        }))
      }
    }

    if (user.hot) {
      const hotData = (user.hot as Record<string, unknown>).item
      if (hotData) {
        const hotItems = Array.isArray(hotData)
          ? hotData
          : [hotData]
        result.hot = hotItems.map((h: Record<string, unknown>) => ({
          id: h['@_id'] as number,
          name: h.name as string,
          rank: h['@_rank'] as number,
          thumbnail: h.thumbnail as string | undefined
        }))
      }
    }

    return result
  }

  parseCollection(xml: string): BGGCollection {
    const data = this.parse(xml)

    // Handle 202 Accepted (BGG queued the request)
    const resp = data as Record<string, unknown>
    if (resp.message) {
      return { total: -1, items: [] } // Indicates retry needed
    }

    const items = resp.items as Record<string, unknown> | undefined

    if (!items) {
      return { total: 0, items: [] }
    }

    const total = (items['@_totalitems'] as number) || 0
    const itemArray = items.item
      ? Array.isArray(items.item)
        ? items.item
        : [items.item]
      : []

    const collectionItems: BGGCollectionItem[] = itemArray.map(
      (item: Record<string, unknown>): BGGCollectionItem => {
        const result: BGGCollectionItem = {
          id: item['@_id'] as number,
          objecttype: item['@_objecttype'] as string,
          objectid: item['@_objectid'] as number,
          name: (item.name as Record<string, unknown>)?.['#text'] as string || ''
        }

        if (item.yearpublished) result.yearpublished = item.yearpublished as number
        if (item.image) result.image = item.image as string
        if (item.thumbnail) result.thumbnail = item.thumbnail as string
        if (item.stats) {
          const stats = item.stats as Record<string, unknown>
          result.stats = {}
          if (stats.rating) result.stats.rating = (stats.rating as number) || undefined
          if (stats.numplays) result.stats.numplays = stats.numplays as number
        }
        if (item.comment) result.comment = item.comment as string

        return result
      }
    )

    return { total, items: collectionItems }
  }

  parseHot(xml: string): BGGHot {
    const data = this.parse(xml)
    const dataObj = data as Record<string, unknown>
    const itemsWrapper = dataObj.items as Record<string, unknown> | undefined
    const items = itemsWrapper?.item as
      | Record<string, unknown>[]
      | Record<string, unknown>
      | undefined

    if (!items) {
      return { total: 0, items: [] }
    }

    const itemArray = Array.isArray(items) ? items : [items]

    const hotItems: BGGHotItem[] = itemArray.map((item: Record<string, unknown>) => ({
      id: item['@_id'] as number,
      rank: item['@_rank'] as number,
      name: item.name as string,
      yearpublished: item.yearpublished as number | undefined,
      image: item.image as string | undefined,
      thumbnail: item.thumbnail as string | undefined,
      type: item['@_type'] as string
    }))

    return { total: hotItems.length, items: hotItems }
  }

  parseHotFromAPI(data: unknown): BGGHot {
    const dataObj = data as Record<string, unknown>
    const itemsWrapper = dataObj.items as Record<string, unknown> | undefined
    const items = itemsWrapper?.item as
      | Record<string, unknown>[]
      | Record<string, unknown>
      | undefined

    if (!items) {
      return { total: 0, items: [] }
    }

    const itemArray = Array.isArray(items) ? items : [items]

    const hotItems: BGGHotItem[] = itemArray.map((item: Record<string, unknown>) => {
      const nameValue = item.name
      const name = typeof nameValue === 'object' && nameValue !== null 
        ? (nameValue as Record<string, unknown>)._text as string || ''
        : nameValue as string || ''
      
      return {
        id: item.id as number,
        rank: item.rank as number,
        name,
        yearpublished: item.yearpublished as number | undefined,
        image: item.image as string | undefined,
        thumbnail: item.thumbnail as string | undefined,
        type: item.type as string
      }
    })

    return { total: hotItems.length, items: hotItems }
  }

  parsePlays(xml: string): BGGPlays {
    const data = this.parse(xml)
    const plays = (data as Record<string, unknown>).plays as
      | Record<string, unknown>
      | undefined

    if (!plays) {
      return { total: 0, page: 1, plays: [] }
    }

    const total = (plays['@_total'] as number) || 0
    const page = (plays['@_page'] as number) || 1

    const playArray = plays.play
      ? Array.isArray(plays.play)
        ? plays.play
        : [plays.play]
      : []

    const parsedPlays: BGGPlay[] = playArray.map((p: Record<string, unknown>): BGGPlay => {
      const play: BGGPlay = {
        id: p['@_id'] as number,
        date: p.date as string,
        quantity: (p.quantity as number) || 1,
        game: {
          id: (p.game as Record<string, unknown>)['@_objectid'] as number,
          name: (p.game as Record<string, unknown>).name as string
        }
      }

      if (p.location) play.location = p.location as string
      const usersData = (p.users as Record<string, unknown>)?.user
      if (usersData) {
        const users = Array.isArray(usersData) ? usersData : [usersData]
        const mappedUsers = users.map((u: Record<string, unknown>) => ({
          username: String(u.username ?? '')
        }))
        play.users = mappedUsers
      }
      if (p.comment) play.comment = p.comment as string

      return play
    })

    return { total, page, plays: parsedPlays }
  }
}

export const defaultParser = new BGGXMLParser()
