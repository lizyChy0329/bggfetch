# bggfetch 🚀

> Fast BoardGameGeek CLI scraper. Requires authentication.

[![npm version](https://img.shields.io/npm/v/bggfetch.svg)](https://www.npmjs.com/package/bggfetch)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ⚠️ Important: BGG API Now Requires Authentication

As of 2024-2025, BoardGameGeek's XML API requires authentication. You must provide your BGG cookies to use this tool.

## Getting Your BGG Cookies

1. **Log into BGG**: Visit https://boardgamegeek.com and log in
2. **Open Developer Tools**: Press `F12` or `Cmd+Option+I`
3. **Go to Application/Storage Tab**: Click on "Cookies" > "https://boardgamegeek.com"
4. **Copy the following cookies**:
   - `bb_session`
   - `bgguser`
   - `bggpassword` (if available)

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
# Set your BGG cookies
bggfetch auth set "bb_session=xxx; bgguser=yourusername;"

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

# Get user collection
bggfetch collection username
```

## Commands

### Authentication

```bash
# Set cookies (required before using other commands)
bggfetch auth set "bb_session=xxx; bgguser=xxx;"

# Check current auth status
bggfetch auth check

# Clear cookies
bggfetch auth clear

# Show cookies file path
bggfetch auth path
```

You can also set cookies via environment variable:
```bash
export BGG_COOKIES="bb_session=xxx; bgguser=xxx;"
```

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

### Collection

```bash
bggfetch collection <username> [-t, --type <type>] [-s, --status <status>] [-f, --format]
```

### Hot

```bash
bggfetch hot [-t, --type <boardgame|rpg|videogame>] [-n, --num <number>] [-f, --format]
```

### Plays

```bash
bggfetch plays <username> [-g, --game <id>] [-n, --num <number>] [-f, --format]
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

## Rate Limiting

bggfetch enforces a 5-second delay between requests to respect BGG's API limits.

## License

MIT
