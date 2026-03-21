import fs from 'fs'
import os from 'os'
import path from 'path'

const MEMORY_FILE = path.join(os.homedir(), '.nohi', 'memory.md')

export function getMemoryContent(): string {
  if (!fs.existsSync(MEMORY_FILE)) return ''
  return fs.readFileSync(MEMORY_FILE, 'utf-8').trim()
}

export const memoryTools = [
  {
    name: 'remember',
    description: "Save a fact or preference to long-term memory. Use this whenever the user shares something important about their business, preferences, or context that should persist across future conversations.",
    input_schema: {
      type: 'object' as const,
      properties: {
        fact: { type: 'string', description: 'The information to remember (one concise sentence or a few lines max)' },
      },
      required: ['fact'],
    },
  },
  {
    name: 'recall',
    description: 'Read all saved long-term memories about this user and their business.',
    input_schema: {
      type: 'object' as const,
      properties: {},
      required: [],
    },
  },
]

export function executeMemory(name: string, input: Record<string, string>): string {
  if (name === 'remember') {
    const dir = path.dirname(MEMORY_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const date = new Date().toISOString().split('T')[0]
    fs.appendFileSync(MEMORY_FILE, `- [${date}] ${input.fact}\n`, 'utf-8')
    return 'Saved to memory.'
  }
  if (name === 'recall') {
    const content = getMemoryContent()
    return content || 'No memories saved yet.'
  }
  return 'Unknown memory tool'
}
