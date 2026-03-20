import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('nohi', {
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (s: unknown) => ipcRenderer.invoke('save-settings', s),

  // Agent
  runAgent: (messages: unknown[], mode?: string) => ipcRenderer.invoke('run-agent', { messages, mode }),
  onAgentChunk: (cb: (chunk: unknown) => void) => {
    const listener = (_e: Electron.IpcRendererEvent, chunk: unknown) => cb(chunk)
    ipcRenderer.on('agent-chunk', listener)
    return () => ipcRenderer.removeListener('agent-chunk', listener)
  },

  // Sessions
  getSessions: () => ipcRenderer.invoke('get-sessions'),
  saveSession: (session: unknown) => ipcRenderer.invoke('save-session', session),
  deleteSession: (id: string) => ipcRenderer.invoke('delete-session', id),

  // Scheduled tasks
  getTasks: () => ipcRenderer.invoke('get-tasks'),
  saveTask: (task: unknown) => ipcRenderer.invoke('save-task', task),
  deleteTask: (id: string) => ipcRenderer.invoke('delete-task', id),
  runTaskNow: (prompt: string) => ipcRenderer.invoke('run-task-now', prompt),

  // Shell
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),

  // Dir dialog
  openDirDialog: () => ipcRenderer.invoke('open-dir-dialog'),

  // Custom skills
  getCustomSkills: () => ipcRenderer.invoke('get-custom-skills'),

  // GAP 6: Auto-update
  onUpdateAvailable: (cb: () => void) => {
    const listener = () => cb()
    ipcRenderer.on('update-available', listener)
    return () => ipcRenderer.removeListener('update-available', listener)
  },
  onUpdateDownloaded: (cb: () => void) => {
    const listener = () => cb()
    ipcRenderer.on('update-downloaded', listener)
    return () => ipcRenderer.removeListener('update-downloaded', listener)
  },
  installUpdate: () => ipcRenderer.invoke('install-update'),

  // GAP 7: Remote access info
  getRemoteInfo: () => ipcRenderer.invoke('get-remote-info'),

  // Plan files
  readPlanFiles: (dir: string) => ipcRenderer.invoke('read-plan-files', dir),
  createPlanFile: (dir: string, name: string, content: string) => ipcRenderer.invoke('create-plan-file', dir, name, content),
  deletePlanFile: (dir: string, name: string) => ipcRenderer.invoke('delete-plan-file', dir, name),
})
