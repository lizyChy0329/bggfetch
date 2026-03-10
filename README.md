# bggfetch 🚀

> Fast BoardGameGeek CLI scraper. No API keys required.

[![npm version](https://img.shields.io/npm/v/bggfetch.svg)](https://www.npmjs.com/package/bggfetch)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

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
# Get game details by ID
bggfetch game 13

# Search for games
bggfetch search "Catan" -n 10

# Get user profile
bggfetch user monteslu

# Get hot games
bggfetch hot
```

## Commands

### Game

```bash
bggfetch game <id> [-f, --format <json|jsonl|csv>]
```

Get detailed information about a board game by its BGG ID.

### Search

```bash
bggfetch search <query> [-n, --num <number>] [-f, --format <json|jsonl|csv>]
```

Search for games on BoardGameGeek.

### User

```bash
bggfetch user <username> [-b, --buddies] [-h, --hot] [-f, --format <json|jsonl|csv>]
```

Get user profile information. Options:
- `-b, --buddies`: Include buddies list
- `-h, --hot`: Include hot items for user
- `-f, --format`: Output format (json, jsonl, csv)

### Hot

```bash
bggfetch hot [-t, --type <boardgame|rpg|videogame>] [-n, --num <number>] [-f, --format <json|jsonl|csv>]
```

Get hot items from BoardGameGeek. Options:
- `-t, --type`: Hot list type (boardgame, rpg, videogame). Default: boardgame
- `-n, --num`: Number of results. Default: 50
- `-f, --format`: Output format (json, jsonl, csv). Default: json

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
