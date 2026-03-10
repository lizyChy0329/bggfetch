export interface BGGConfig {
  delayMs: number
  timeoutMs: number
  defaultFormat: OutputFormat
  cookieSource?: 'chrome' | 'firefox' | 'safari' | 'brave' | 'arc'
  chromeProfile?: string
}

export type OutputFormat = 'json' | 'jsonl' | 'csv'

export interface BGGGame {
  id: number
  name: string
  description?: string
  yearpublished?: number
  minplayers?: number
  maxplayers?: number
  playingtime?: number
  minage?: number
  image?: string
  thumbnail?: string
  statistics?: {
    usersrated: number
    average?: number
    bayesaverage?: number
    stddev?: number
    median?: number
    ranks?: BGGGameRank[]
  }
  categories?: string[]
  mechanics?: string[]
  publishers?: string[]
  designers?: string[]
  artists?: string[]
}

export interface BGGGameRank {
  type: string
  id: number
  name: string
  friendlyname: string
  rank: number
  bayesaverage: string
}

export interface BGGSearchResult {
  total: number
  items: BGGSearchItem[]
}

export interface BGGSearchItem {
  id: number
  name: string
  type: string
  yearpublished?: number
  image?: string
}

export interface BGGUser {
  id: number
  name: string
 avatid?: number
  avatar?: string
  country?: string
  stateorprovince?: string
  city?: string
  registered?: number
  lastlogin?: number
  browsegames?: number
  marketplace?: number
  trade?: number
  wantgames?: number
  wanttobuy?: number
  wanttoplay?: number
  owned?: number
  previouslyowned?: number
  fortrade?: number
  buddies?: BGGUserBuddy[]
  hot?: BGGUserHot[]
}

export interface BGGUserBuddy {
  id: number
  name: string
  avatar?: string
}

export interface BGGUserHot {
  id: number
  name: string
  rank: number
  thumbnail?: string
}

export interface BGGCollectionItem {
  id: number
  objecttype: string
  objectid: number
  name: string
  yearpublished?: number
  image?: string
  thumbnail?: string
  collectionid?: number
  collectiontype?: string
  subtype?: string
  status?: {
    own: boolean
    previouslyowned: boolean
    fortrade: boolean
    want: boolean
    wanttoplay: boolean
    wanttobuy: boolean
    played: boolean
    preordered: boolean
    lastmodified?: string
  }
  stats?: {
    rating?: number
    numplays?: number
  }
  version?: {
    id?: number
    language?: string
    publisher?: string
    yearpublished?: number
  }
  comment?: string
}

export interface BGGCollection {
  total: number
  items: BGGCollectionItem[]
}

export interface BGGHotItem {
  id: number
  rank: number
  name: string
  yearpublished?: number
  image?: string
  thumbnail?: string
  type: string
}

export interface BGGHot {
  total: number
  items: BGGHotItem[]
}

export interface BGGPlay {
  id: number
  date: string
  quantity: number
  location?: string
  game: {
    id: number
    name: string
  }
  users?: {
    username: string
  }[]
  comment?: string
}

export interface BGGPlays {
  total: number
  page: number
  plays: BGGPlay[]
}

export interface RateLimitInfo {
  lastRequestTime: number
  requestCount: number
  resetTime?: number
}

export interface CookieInfo {
  bb_session?: string
  bgguser?: string
  bggpass?: string
  [key: string]: string | undefined
}
