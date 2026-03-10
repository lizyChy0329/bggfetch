import { stringify as csvStringify } from 'csv-stringify'

export async function output(data: unknown, format: string): Promise<void> {
  switch (format) {
    case 'json':
      console.log(JSON.stringify(data, null, 2))
      break
    case 'jsonl':
      if (Array.isArray(data)) {
        for (const item of data) {
          console.log(JSON.stringify(item))
        }
      } else {
        console.log(JSON.stringify(data))
      }
      break
    case 'csv':
      await outputCsv(data)
      break
    default:
      console.log(JSON.stringify(data, null, 2))
  }
}

async function outputCsv(data: unknown): Promise<void> {
  if (Array.isArray(data)) {
    if (data.length === 0) return
    const items = data as Record<string, unknown>[]
    const headers = Object.keys(items[0])
    const rows = items.map(item => headers.map(h => String(item[h] ?? '')))

    const stringifier = csvStringify()
    stringifier.on('readable', () => {
      let row
      while ((row = stringifier.read()) !== null) {
        process.stdout.write(row)
      }
    })
    stringifier.write([...headers, ...rows.flat()])
    stringifier.end()
  } else if (data && typeof data === 'object') {
    const item = data as Record<string, unknown>
    const headers = Object.keys(item)
    const rows = [headers.map(h => String(item[h] ?? ''))]

    const stringifier = csvStringify()
    stringifier.on('readable', () => {
      let row
      while ((row = stringifier.read()) !== null) {
        process.stdout.write(row)
      }
    })
    stringifier.write(rows.flat())
    stringifier.end()
  }
}
