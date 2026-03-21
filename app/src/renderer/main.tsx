import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import './i18n'

// Browser dev mock — only active outside Electron
if (!window.nohi) {
  window.nohi = {
    getSettings: async () => ({
      provider: 'anthropic' as const,
      apiKey: 'dev-mock-key',
      model: 'claude-sonnet-4-6',
      skillsDir: '',
      theme: 'light',
      enabledSkills: [],
      mcpServers: [],
      remoteEnabled: false,
      remotePort: 3847,
      browserEnabled: false,
      language: 'en',
    }),
    saveSettings: async () => {},
    runAgent: async (_messages: SessionMessage[], _mode?: AgentMode, _workDir?: string) => {},
    onAgentChunk: () => () => {},
    getSessions: async () => [],
    saveSession: async () => {},
    deleteSession: async () => {},
    getTasks: async () => [],
    saveTask: async () => {},
    deleteTask: async () => {},
    runTaskNow: async (prompt: string) => {
      await new Promise((r) => setTimeout(r, 1200))
      return `[Mock] Task completed for prompt: "${prompt.slice(0, 60)}..."`
    },
    openExternal: async () => {},
    openDirDialog: async () => null,
    getCustomSkills: async () => [],
    onUpdateAvailable: () => () => {},
    onUpdateDownloaded: () => () => {},
    installUpdate: async () => {},
    getRemoteInfo: async () => null,
    readPlanFiles: async () => [],
    createPlanFile: async (_dir: string, name: string, content: string) => ({ name: name.endsWith('.md') ? name : `${name}.md`, content }),
    deletePlanFile: async () => {},
    testConnection: async (id: string, _creds: Record<string, string>) => {
      await new Promise((r) => setTimeout(r, 800))
      return { ok: true } as { ok: boolean; error?: string }
    },
    writeCredentialsFile: async (_filename: string, _content: string) => `/Users/mock/.nohi/credentials/${_filename}`,
    openFileDialog: async () => null,
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
