import { Command } from 'commander'
import { cookieManager } from '../../core/cookie-manager.js'

export const authCommand = new Command('auth')
  .description('Authentication management')

authCommand
  .command('check')
  .description('Check current authentication status')
  .action(() => {
    if (cookieManager.hasCookies()) {
      console.log('✓ Cookies are configured')
      const cookies = cookieManager.getCookies()
      const parsed = cookieManager.parseCookies(cookies)
      console.log('Cookie keys:', Object.keys(parsed).join(', '))
    } else {
      console.log('✗ No cookies configured')
      console.log('Use: bggfetch auth set "your_cookies"')
      console.log('Or set BGG_COOKIES environment variable')
    }
  })

authCommand
  .command('set <cookies>')
  .description('Set cookies for authenticated requests')
  .action((cookies: string) => {
    if (!cookieManager.validateCookies(cookies)) {
      console.error('Invalid cookie format')
      process.exit(1)
    }
    cookieManager.saveCookies(cookies)
  })

authCommand
  .command('clear')
  .description('Clear saved cookies')
  .action(() => {
    cookieManager.clearCookies()
  })

authCommand
  .command('path')
  .description('Show cookies file path')
  .action(() => {
    console.log(cookieManager.getCookiePath())
  })
