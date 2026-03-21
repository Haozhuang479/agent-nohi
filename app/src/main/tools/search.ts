export const searchTools = [
  {
    name: 'search_web',
    description: 'Search the web for current information. Returns summaries and links. Use for recent news, prices, competitor research, or anything requiring up-to-date knowledge.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'The search query' },
      },
      required: ['query'],
    },
  },
]

export async function executeSearch(input: { query: string }): Promise<string> {
  try {
    // DuckDuckGo Instant Answer API — no key required
    const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(input.query)}&format=json&no_html=1&skip_disambig=1`
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Nohi/1.0' },
    })
    const data = await resp.json() as {
      AbstractText?: string
      AbstractURL?: string
      Answer?: string
      RelatedTopics?: Array<{ Text?: string; FirstURL?: string; Topics?: Array<{ Text?: string; FirstURL?: string }> }>
      Results?: Array<{ Text?: string; FirstURL?: string }>
    }

    const lines: string[] = []

    if (data.Answer) lines.push(`Answer: ${data.Answer}`)
    if (data.AbstractText) lines.push(`${data.AbstractText}\nSource: ${data.AbstractURL}`)

    const results = data.Results ?? []
    const related = (data.RelatedTopics ?? []).flatMap((t) =>
      t.Topics ? t.Topics : [t]
    )

    const items = [...results, ...related].slice(0, 6)
    for (const item of items) {
      if (item.Text && item.FirstURL) {
        lines.push(`• ${item.Text}\n  ${item.FirstURL}`)
      }
    }

    return lines.length > 0 ? lines.join('\n\n') : `No results found for: ${input.query}`
  } catch (e) {
    return `Search failed: ${String(e)}`
  }
}
