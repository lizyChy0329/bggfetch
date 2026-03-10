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
  if (Array.isArray(data) && data.length > 0) {
    const items = data as Record<string, unknown>[]
    const headers = Object.keys(items[0])
    const rows = items.map(item => headers.map(h => {
      const val = item[h]
      if (val === null || val === undefined) return ''
      return String(val).replace(/"/g, '""')
    }))

    const csvLines = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ]
    console.log(csvLines.join('\n'))
  } else if (data && typeof data === 'object') {
    const item = data as Record<string, unknown>
    const headers = Object.keys(item)
    const values = headers.map(h => {
      const val = item[h]
      if (val === null || val === undefined) return ''
      return String(val).replace(/"/g, '""')
    })
    console.log(values.map(v => `"${v}"`).join(','))
  }
}
