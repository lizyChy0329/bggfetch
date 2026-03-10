# bggfetch 🚀

> Fast BoardGameGeek CLI scraper. No API keys. Just cookies and go.

[![npm version](https://img.shields.io/npm/v/bggfetch.svg)](https://www.npmjs.com/package/bggfetch)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

- 🔐 **Cookie-based auth** - For private data (collection, plays)
- 📊 **Multi-format output** - JSON, JSONL, CSV
- ⚡ **Rate limiting** - Built-in 5-second delay to respect BGG
- 🔁 **Auto-retry** - Handles BGG's 202 processing responses
- 🎯 **TypeScript** - Full type support

## Install

```bash
# npm
npm install -g bggfetch

# pnpm
pnpm add -g bggfetch

# bun (recommended)
bun add -g bggfetch
```

## Quick Start

```bash
# Check auth status
bggfetch auth check

# Get game details by ID
bggfetch game 13

# Search for games
bggfetch search "Catan" -n 10

# Get user profile
bggfetch user monteslu

# Get hot games
bggfetch hot

# Get user collection (requires auth)
bggfetch collection username --type boardgame
```

## Commands

### Game

```bash
bggfetch game <id> [-f, --format <json|jsonl|csv>]
```

### Search

```bash
bggfetch search <query> [-n, --num <number>] [-f, --format <json|jsonl|csv>]
```

### User

```bash
bggfetch user <username> [-b, --buddies] [-h, --hot] [-f, --format <json|jsonl|csv>]
```

### Collection (requires authentication)

```bash
bggfetch collection <username> [-t, --type <type>] [-s, --status <status>] [-f, --format]
```

### Hot

```bash
bggfetch hot [-t, --type <boardgame|rpg|videogame>] [-n, --num <number>] [-f, --format]
```

### Plays (requires authentication)

```bash
bggfetch plays <username> [-g, --game <id>] [-n, --num <number>] [-f, --format]
```

### Authentication

```bash
# Check current auth status
bggfetch auth check

# Set cookies
bggfetch auth set "bb_session=xxx; bgguser=xxx;"

# Or use environment variable
export BGG_COOKIES="bb_session=xxx; bgguser=xxx;"

# Clear cookies
bggfetch auth clear

# Show cookies file path
bggfetch auth path
```

## Output Formats

```bash
--format json     # Default, pretty printed
--format jsonl    # Line-delimited JSON
--format csv      # CSV with headers
```

## Configuration

Config file: `~/.config/bggfetch/config.json`

```json
{
  "delayMs": 5000,
  "timeoutMs": 30000,
  "defaultFormat": "json"
}
```

## Environment Variables

- `BGG_COOKIES` - Set cookies for authenticated requests

## Rate Limiting

bggfetch respects BoardGameGeek's API limits by enforcing a 5-second delay between requests. This helps avoid rate limiting and ensures consistent access to BGG's data.

## License

MIT
