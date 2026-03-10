import { describe, it, expect } from 'vitest'
import { BGGXMLParser } from '../core/parser'

describe('BGGXMLParser', () => {
  const parser = new BGGXMLParser()

  describe('parseGame', () => {
    it('should parse a basic game XML', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
        <items>
          <item id="13" type="boardgame">
            <name index="1">Catan</name>
            <yearpublished>1995</yearpublished>
            <minplayers>3</minplayers>
            <maxplayers>4</maxplayers>
            <playingtime>60</playingtime>
            <minage>10</minage>
            <image>https://example.com/image.jpg</image>
            <thumbnail>https://example.com/thumb.jpg</thumbnail>
            <description><![CDATA[Description here]]></description>
            <statistics page="1">
              <ratings>
                <usersrated>125000</usersrated>
                <average>7.1</average>
                <bayesaverage>7.05</bayesaverage>
                <stddev>1.5</stddev>
                <median>7.0</median>
              </ratings>
            </statistics>
          </item>
        </items>`

      const game = parser.parseGame(xml)

      expect(game).not.toBeNull()
      expect(game!.id).toBe(13)
      expect(game!.name).toBe('Catan')
      expect(game!.yearpublished).toBe(1995)
      expect(game!.minplayers).toBe(3)
      expect(game!.maxplayers).toBe(4)
      expect(game!.playingtime).toBe(60)
      expect(game!.minage).toBe(10)
      expect(game!.image).toBe('https://example.com/image.jpg')
      expect(game!.statistics?.usersrated).toBe(125000)
      expect(game!.statistics?.average).toBe(7.1)
    })

    it('should return null for invalid XML', () => {
      const xml = '<invalid>'
      const game = parser.parseGame(xml)
      expect(game).toBeNull()
    })

    it('should return null when no items in XML', () => {
      const xml = '<items></items>'
      const game = parser.parseGame(xml)
      expect(game).toBeNull()
    })

    it('should parse game with links (categories, mechanics)', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
        <items>
          <item id="13" type="boardgame">
            <name index="1">Catan</name>
            <link type="boardgamecategory" id="1001" value="Strategy"></link>
            <link type="boardgamecategory" id="1002" value="Economic"></link>
            <link type="boardgamemechanic" id="2001" value="Dice Rolling"></link>
          </item>
        </items>`

      const game = parser.parseGame(xml)

      expect(game).not.toBeNull()
      expect(game!.categories).toContain('Strategy')
      expect(game!.categories).toContain('Economic')
      expect(game!.mechanics).toContain('Dice Rolling')
    })
  })

  describe('parseGames', () => {
    it('should parse multiple games', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
        <items>
          <item id="13" type="boardgame">
            <name index="1">Catan</name>
          </item>
          <item id="14" type="boardgame">
            <name index="1">Carcassonne</name>
          </item>
        </items>`

      const games = parser.parseGames(xml)

      expect(games).toHaveLength(2)
      expect(games[0].id).toBe(13)
      expect(games[1].id).toBe(14)
    })

    it('should return empty array for no items', () => {
      const xml = '<items></items>'
      const games = parser.parseGames(xml)
      expect(games).toHaveLength(0)
    })
  })

  describe('parseSearch', () => {
    it('should parse search results', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
        <items total="2" termsofuse="https://example.com">
          <item id="13" type="boardgame">
            <name index="1">Catan</name>
            <yearpublished>1995</yearpublished>
          </item>
          <item id="14" type="boardgame">
            <name index="1">Catan: Cities & Knights</name>
            <yearpublished>1998</yearpublished>
          </item>
        </items>`

      const result = parser.parseSearch(xml)

      expect(result.total).toBe(2)
      expect(result.items).toHaveLength(2)
      expect(result.items[0].name).toBe('Catan')
      expect(result.items[1].yearpublished).toBe(1998)
    })

    it('should handle empty search results', () => {
      const xml = '<items total="0"></items>'
      const result = parser.parseSearch(xml)
      expect(result.total).toBe(0)
      expect(result.items).toHaveLength(0)
    })
  })

  describe('parseUser', () => {
    it('should parse user data', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
        <user id="12345" name="testuser">
          <avatar>https://example.com/avatar.jpg</avatar>
          <country>USA</country>
          <stateorprovince>CA</stateorprovince>
          <city>San Francisco</city>
          <registered>1609459200</registered>
          <lastlogin>1640995200</lastlogin>
          <browsegames>100</browsegames>
          <owned>50</owned>
        </user>`

      const user = parser.parseUser(xml)

      expect(user).not.toBeNull()
      expect(user!.id).toBe(12345)
      expect(user!.name).toBe('testuser')
      expect(user!.country).toBe('USA')
      expect(user!.stateorprovince).toBe('CA')
      expect(user!.city).toBe('San Francisco')
      expect(user!.owned).toBe(50)
    })

    it('should return null for invalid XML', () => {
      const xml = '<invalid></invalid>'
      const user = parser.parseUser(xml)
      expect(user).toBeNull()
    })
  })

  describe('parseCollection', () => {
    it('should parse collection items', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
        <items totalitems="2" page="1">
          <item objecttype="thing" objectid="13" collid="1">
            <name>Catan</name>
            <yearpublished>1995</yearpublished>
            <stats>
              <rating>7.5</rating>
              <numplays>10</numplays>
            </stats>
          </item>
          <item objecttype="thing" objectid="14" collid="2">
            <name>Carcassonne</name>
          </item>
        </items>`

      const collection = parser.parseCollection(xml)

      expect(collection.total).toBe(2)
      expect(collection.items).toHaveLength(2)
      expect(collection.items[0].objectid).toBe(13)
      expect(collection.items[0].stats?.rating).toBe(7.5)
      expect(collection.items[0].stats?.numplays).toBe(10)
    })

    it('should return total -1 when BGG returns 202 message', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
        <message>Your request has been queued and will be processed in due course.</message>`

      const collection = parser.parseCollection(xml)
      expect(collection.total).toBe(-1)
    })
  })

  describe('parseHot', () => {
    it('should parse hot items', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
        <items>
          <item id="13" type="boardgame" rank="1">
            <name>Catan</name>
            <yearpublished>1995</yearpublished>
            <thumbnail>https://example.com/thumb.jpg</thumbnail>
          </item>
          <item id="14" type="boardgame" rank="2">
            <name>Carcassonne</name>
          </item>
        </items>`

      const hot = parser.parseHot(xml)

      expect(hot.total).toBe(2)
      expect(hot.items[0].rank).toBe(1)
      expect(hot.items[0].name).toBe('Catan')
      expect(hot.items[1].rank).toBe(2)
    })
  })

  describe('parseHotFromAPI', () => {
    it('should parse hot items from API response', () => {
      const apiData = {
        items: {
          item: [
            {
              id: 13,
              type: 'boardgame',
              rank: 1,
              name: { _text: 'Catan' },
              yearpublished: 1995,
              thumbnail: 'https://example.com/thumb.jpg'
            },
            {
              id: 14,
              type: 'boardgame',
              rank: 2,
              name: { _text: 'Carcassonne' },
              yearpublished: 2000
            }
          ]
        }
      }

      const hot = parser.parseHotFromAPI(apiData)

      expect(hot.total).toBe(2)
      expect(hot.items[0].id).toBe(13)
      expect(hot.items[0].rank).toBe(1)
      expect(hot.items[0].name).toBe('Catan')
      expect(hot.items[0].yearpublished).toBe(1995)
      expect(hot.items[1].rank).toBe(2)
      expect(hot.items[1].name).toBe('Carcassonne')
    })

    it('should handle empty hot items', () => {
      const apiData = { items: {} }
      const hot = parser.parseHotFromAPI(apiData)

      expect(hot.total).toBe(0)
      expect(hot.items).toHaveLength(0)
    })

    it('should handle single hot item', () => {
      const apiData = {
        items: {
          item: {
            id: 13,
            type: 'boardgame',
            rank: 1,
            name: { _text: 'Catan' }
          }
        }
      }

      const hot = parser.parseHotFromAPI(apiData)

      expect(hot.total).toBe(1)
      expect(hot.items[0].name).toBe('Catan')
    })
  })

  describe('parsePlays', () => {
    it('should parse plays data', () => {
      const xml = `<?xml version="1.0" encoding="utf-8"?>
        <plays total="2" page="1">
          <play id="123" quantity="1" date="2024-01-15">
            <game objectid="13" name="Catan"></game>
            <location>My House</location>
            <users>
              <user username="testuser"></user>
            </users>
            <comment>Great game!</comment>
          </play>
          <play id="124" quantity="2" date="2024-01-16">
            <game objectid="14" name="Carcassonne"></game>
          </play>
        </plays>`

      const plays = parser.parsePlays(xml)

      expect(plays.total).toBe(2)
      expect(plays.page).toBe(1)
      expect(plays.plays).toHaveLength(2)
      expect(plays.plays[0].id).toBe(123)
      expect(plays.plays[0].game.id).toBe(13)
      expect(plays.plays[0].location).toBe('My House')
      expect(plays.plays[0].comment).toBe('Great game!')
    })
  })
})
