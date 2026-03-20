interface NohiSettings {
  provider: 'anthropic' | 'openai' | 'google' | 'deepseek' | 'openai-compatible'
  apiKey: string
  model: string
  skillsDir: string
  theme?: 'light' | 'dark'
  baseUrl?: string
  enabledSkills?: string[]
  mcpServers?: Array<{ name: string; command: string; args?: string[]; env?: Record<string, string> }>
  autoUpdate?: boolean
  remoteEnabled?: boolean
  remotePort?: number
  language?: string
  browserEnabled?: boolean
  userName?: string
  connections?: Record<string, string>
}

interface SessionMessage {
  role: 'user' | 'assistant'
  content: string
}

interface NohiSession {
  id: string
  title: string
  createdAt: string
  history: SessionMessage[]
}

interface ScheduledTask {
  id: string
  name: string
  description: string
  prompt: string
  schedule: 'manual' | 'hourly' | 'daily' | 'weekdays' | 'weekly'
  scheduleTime?: string
  workDir?: string
  worktree?: boolean
  agentMode?: string
  model?: string
  enabled: boolean
  createdAt: string
  lastRun?: string
  lastResult?: string
}

interface CustomSkill {
  name: string
  description: string
  trigger: string
  filePath: string
}

type AgentMode = 'ask' | 'auto' | 'plan' | 'bypass'

interface Window {
  nohi: {
    getSettings(): Promise<NohiSettings>
    saveSettings(s: NohiSettings): Promise<void>
    runAgent(messages: SessionMessage[], mode?: AgentMode): Promise<void>
    onAgentChunk(cb: (chunk: unknown) => void): () => void
    getSessions(): Promise<NohiSession[]>
    saveSession(session: NohiSession): Promise<void>
    deleteSession(id: string): Promise<void>
    getTasks(): Promise<ScheduledTask[]>
    saveTask(task: ScheduledTask): Promise<void>
    deleteTask(id: string): Promise<void>
    runTaskNow(prompt: string): Promise<string>
    openExternal(url: string): Promise<void>
    openDirDialog(): Promise<string | null>
    getCustomSkills(): Promise<CustomSkill[]>
    // GAP 6: auto-update
    onUpdateAvailable(cb: () => void): () => void
    onUpdateDownloaded(cb: () => void): () => void
    installUpdate(): Promise<void>
    // GAP 7: remote access
    getRemoteInfo(): Promise<{ port: number; token: string } | null>
    // Plan files
    readPlanFiles(dir: string): Promise<Array<{ name: string; content: string }>>
    createPlanFile(dir: string, name: string, content: string): Promise<{ name: string; content: string }>
    deletePlanFile(dir: string, name: string): Promise<void>
  }
}
