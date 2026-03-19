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
    runAgent: async (_messages: SessionMessage[], _mode?: AgentMode) => {},
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
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
