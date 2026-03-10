import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import type { CookieInfo } from '../types/index.js'

const CONFIG_DIR = path.join(os.homedir(), '.config', 'bggfetch')
const COOKIES_FILE = path.join(CONFIG_DIR, 'cookies.txt')

export class CookieManager {
  private cookies: string = ''

  constructor() {
    this.loadCookies()
  }

  private loadCookies(): void {
    if (fs.existsSync(COOKIES_FILE)) {
      try {
        this.cookies = fs.readFileSync(COOKIES_FILE, 'utf-8').trim()
      } catch (error) {
        console.warn('Failed to load cookies:', error)
        this.cookies = ''
      }
    }

    const envCookies = process.env.BGG_COOKIES
    if (envCookies && !this.cookies) {
      this.cookies = envCookies
    }
  }

  saveCookies(cookies: string): void {
    try {
      if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true })
      }
      fs.writeFileSync(COOKIES_FILE, cookies, 'utf-8')
      this.cookies = cookies
      console.log('Cookies saved successfully')
    } catch (error) {
      console.error('Failed to save cookies:', error)
      throw error
    }
  }

  getCookies(): string {
    return this.cookies
  }

  hasCookies(): boolean {
    return this.cookies.length > 0
  }

  clearCookies(): void {
    try {
      if (fs.existsSync(COOKIES_FILE)) {
        fs.unlinkSync(COOKIES_FILE)
      }
      this.cookies = ''
      console.log('Cookies cleared successfully')
    } catch (error) {
      console.error('Failed to clear cookies:', error)
      throw error
    }
  }

  parseCookies(cookieString: string): CookieInfo {
    const pairs = cookieString.split(';').map(c => c.trim())
    const result: CookieInfo = {}

    for (const pair of pairs) {
      const parts = pair.split('=')
      const key = parts[0]?.trim()
      const value = parts.slice(1).join('=').trim()
      
      if (key) {
        result[key] = value || ''
      }
    }

    return result
  }

  validateCookies(cookies: string): boolean {
    try {
      const parsed = this.parseCookies(cookies)
      return Object.keys(parsed).length > 0
    } catch {
      return false
    }
  }

  getCookiePath(): string {
    return COOKIES_FILE
  }
}

export const cookieManager = new CookieManager()
