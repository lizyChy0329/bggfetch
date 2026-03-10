declare module 'bgg' {
  interface BGGClientOptions {
    timeout?: number
    retries?: number
  }

  type BGGEndpoint = 
    | 'thing' 
    | 'family' 
    | 'search' 
    | 'collection' 
    | 'user' 
    | 'plays' 
    | 'guild' 
    | 'forum' 
    | 'thread' 
    | 'hot'
    | 'hotitems'
    | string

  type BGGParams = Record<string, string | number>

  export default function createClient(options?: BGGClientOptions): (endpoint: BGGEndpoint, params?: BGGParams) => Promise<unknown>
}
