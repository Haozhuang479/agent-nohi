import fs from 'fs'
import os from 'os'
import path from 'path'

const MEMORY_FILE = path.join(os.homedir(), '.nohi', 'memory.md')
const MAX_ENTRIES = 100          // hard cap on stored entries
const MAX_INJECT_CHARS = 2000    // max chars injected into system prompt

// ── Helpers ─────────────────────────────────────────────────────────────────

function readEntries(): string[] {
  if (!fs.existsSync(MEMORY_FILE)) return []
  return fs.readFileSync(MEMORY_FILE, 'utf-8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('- '))
}

function writeEntries(entries: string[]): void {
  const dir = path.dirname(MEMORY_FILE)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(MEMORY_FILE, entries.join('\n') + (entries.length ? '\n' : ''), 'utf-8')
}

// Simple similarity: new fact overlaps >60% of words with an existing entry
function isSimilar(a: string, b: string): boolean {
  const words = (s: string) =>
    new Set(s.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(Boolean))
  const wa = words(a)
  const wb = words(b)
  const intersection = [...wa].filter((w) => wb.has(w)).length
  const smaller = Math.min(wa.size, wb.size)
  return smaller > 0 && intersection / smaller > 0.6
}

// Strip date prefix for comparison: "- [2024-01-01] foo" → "foo"
function factText(entry: string): string {
  return entry.replace(/^-\s*\[\d{4}-\d{2}-\d{2}\]\s*/, '').trim()
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Returns memory content capped at MAX_INJECT_CHARS (most-recent entries first). */
export function getMemoryContent(): string {
  const entries = readEntries()
  if (!entries.length) return ''
  const recent = [...entries].reverse()
  let out = ''
  for (const e of recent) {
    if ((out + e + '\n').length > MAX_INJECT_CHARS) break
    out += e + '\n'
  }
  return out.trim()
}

export const memoryTools = [
  {
    name: 'remember',
    description: [
      'Save an important fact to long-term memory so it persists across all future conversations.',
      'Call this proactively whenever the user mentions: store name, location, target market,',
      'business goals, product categories, team size, preferences, recurring processes, or any fact',
      'they would expect you to know next session. Do NOT save transient or trivial information.',
    ].join(' '),
    input_schema: {
      type: 'object' as const,
      properties: {
        fact: { type: 'string', description: 'One concise sentence describing the fact to save.' },
      },
      required: ['fact'],
    },
  },
  {
    name: 'forget',
    description: 'Delete a saved memory by its 1-based index. Call recall first to see the numbered list, then call forget with the correct index. Use when a memory is outdated or the user asks to remove it.',
    input_schema: {
      type: 'object' as const,
      properties: {
        index: { type: 'string', description: '1-based index of the memory entry to delete.' },
      },
      required: ['index'],
    },
  },
  {
    name: 'recall',
    description: 'List all saved long-term memories with their index numbers. Use before calling forget so you know which index to target.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
]

export function executeMemory(name: string, input: Record<string, string>): string {
  try {
    if (name === 'remember') {
      const fact = (input.fact ?? '').trim()
      if (!fact) return 'Error: fact cannot be empty.'

      const entries = readEntries()

      // Dedup: skip if a similar entry already exists
      for (const e of entries) {
        if (isSimilar(fact, factText(e))) {
          return `Already have a similar memory: "${factText(e)}". Use forget + remember if you want to update it.`
        }
      }

      const date = new Date().toISOString().split('T')[0]
      entries.push(`- [${date}] ${fact}`)

      // Enforce cap: drop oldest entries if over MAX_ENTRIES
      const capped = entries.length > MAX_ENTRIES
        ? entries.slice(entries.length - MAX_ENTRIES)
        : entries
      writeEntries(capped)
      return `Remembered: "${fact}"`
    }

    if (name === 'forget') {
      const idx = parseInt(input.index ?? '', 10)
      const entries = readEntries()
      if (isNaN(idx) || idx < 1 || idx > entries.length) {
        return `Invalid index ${idx}. There are ${entries.length} memories (use recall to see them).`
      }
      const removed = entries.splice(idx - 1, 1)[0]
      writeEntries(entries)
      return `Forgotten: "${factText(removed)}"`
    }

    if (name === 'recall') {
      const entries = readEntries()
      if (!entries.length) return 'No memories saved yet.'
      return entries.map((e, i) => `${i + 1}. ${factText(e)}`).join('\n')
    }

    return 'Unknown memory tool'
  } catch (e) {
    return `Memory error: ${String(e)}`
  }
}
