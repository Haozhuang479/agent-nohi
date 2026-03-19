import fs from 'fs'
import path from 'path'
import os from 'os'

export interface McpServer {
  name: string
  command: string
  args?: string[]
  env?: Record<string, string>
}

export interface Settings {
  provider: 'anthropic' | 'openai' | 'google' | 'deepseek' | 'openai-compatible'
  apiKey: string
  model: string
  skillsDir: string
  // GAP 1: theme
  theme?: 'light' | 'dark'
  // GAP 2: custom provider base URL
  baseUrl?: string
  // GAP 3: skills toggle
  enabledSkills?: string[]
  // GAP 5: MCP servers
  mcpServers?: McpServer[]
  // GAP 6: auto-update
  autoUpdate?: boolean
  // GAP 7: remote access
  remoteEnabled?: boolean
  remotePort?: number
  // GAP 8: language
  language?: string
  // GAP 9: AI browser
  browserEnabled?: boolean
}

const CONFIG_DIR = path.join(os.homedir(), '.nohi')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')

const DEFAULTS: Settings = {
  provider: 'anthropic',
  apiKey: '',
  model: 'claude-sonnet-4-6',
  skillsDir: '',
  theme: 'light',
  enabledSkills: [],
  mcpServers: [],
  autoUpdate: true,
  remoteEnabled: false,
  remotePort: 3847,
  language: 'en',
  browserEnabled: false,
}

export function getSettings(): Settings {
  try {
    if (!fs.existsSync(CONFIG_FILE)) return { ...DEFAULTS }
    const raw = fs.readFileSync(CONFIG_FILE, 'utf-8')
    return { ...DEFAULTS, ...JSON.parse(raw) }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(s: Settings): void {
  if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true })
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(s, null, 2), 'utf-8')
}
