#!/usr/bin/env node

import { Command } from 'commander'
import { gameCommand } from './commands/game.js'
import { searchCommand } from './commands/search.js'
import { userCommand } from './commands/user.js'
import { collectionCommand } from './commands/collection.js'
import { hotCommand } from './commands/hot.js'
import { playsCommand } from './commands/plays.js'
import { authCommand } from './commands/auth.js'
import { version } from '../utils/version.js'

const program = new Command()

program
  .name('bggfetch')
  .description('Fast BoardGameGeek CLI scraper. No API keys. Just cookies and go.')
  .version(version)

program
  .command('game <id>')
  .description('Get game details by ID')
  .option('-f, --format <format>', 'Output format (json, jsonl, csv)', 'json')
  .action(gameCommand)

program
  .command('search <query>')
  .description('Search for games')
  .option('-n, --num <number>', 'Number of results', '10')
  .option('-f, --format <format>', 'Output format (json, jsonl, csv)', 'json')
  .action(searchCommand)

program
  .command('user <username>')
  .description('Get user profile information')
  .option('-b, --buddies', 'Include buddies list')
  .option('-h, --hot', 'Include hot items')
  .option('-f, --format <format>', 'Output format (json, jsonl, csv)', 'json')
  .action(userCommand)

program
  .command('collection <username>')
  .description('Get user collection (requires authentication)')
  .option('-t, --type <type>', 'Collection type (boardgame, boardgameexpansion)', 'boardgame')
  .option('-s, --status <status>', 'Status filter (own, rated, wanttobuy, etc.)')
  .option('-f, --format <format>', 'Output format (json, jsonl, csv)', 'json')
  .action(collectionCommand)

program
  .command('hot')
  .description('Get hot items')
  .option('-t, --type <type>', 'Hot list type (boardgame, rpg, videogame)', 'boardgame')
  .option('-n, --num <number>', 'Number of results', '50')
  .option('-f, --format <format>', 'Output format (json, jsonl, csv)', 'json')
  .action(hotCommand)

program
  .command('plays <username>')
  .description('Get user play history (requires authentication)')
  .option('-g, --game <id>', 'Filter by game ID')
  .option('-n, --num <number>', 'Number of results', '100')
  .option('-f, --format <format>', 'Output format (json, jsonl, csv)', 'json')
  .action(playsCommand)

program
  .command('auth')
  .description('Authentication management')
  .addCommand(authCommand)

program.parse()
