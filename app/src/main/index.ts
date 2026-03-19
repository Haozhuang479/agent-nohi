import { app, BrowserWindow, ipcMain, shell, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import os from 'os'
import { runAgent, closeAllMCPClients, AgentMessage, AgentMode } from './agent'
import { getSettings, saveSettings, Settings } from './settings'
import { getSessions, saveSession, deleteSession, Session } from './sessions'
import { getTasks, saveTask, deleteTask, ScheduledTask } from './scheduled'
import { startScheduler, refreshScheduler, stopScheduler } from './scheduler'
import { startHttpServer, stopHttpServer, getRemoteInfo } from './http-server'
import { closeBrowser } from './tools/browser'

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 750,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#f5f0e8',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  return win
}

app.whenReady().then(async () => {
  const win = createWindow()

  // ── Background scheduler ──────────────────────────────────────────────────
  startScheduler()

  // ── GAP 6: Auto-updater (packaged builds only) ────────────────────────────
  if (!isDev) {
    try {
      const { autoUpdater } = await import('electron-updater')
      const settings = getSettings()
      if (settings.autoUpdate !== false) {
        autoUpdater.checkForUpdatesAndNotify()
        autoUpdater.on('update-available', () => win.webContents.send('update-available'))
        autoUpdater.on('update-downloaded', () => win.webContents.send('update-downloaded'))
      }
      ipcMain.handle('install-update', () => autoUpdater.quitAndInstall())
    } catch { /* electron-updater not configured yet */ }
  } else {
    // Dev stub
    ipcMain.handle('install-update', () => {})
  }

  // ── GAP 7: Remote access ──────────────────────────────────────────────────
  const initialSettings = getSettings()
  if (initialSettings.remoteEnabled) {
    startHttpServer(win, initialSettings.remotePort ?? 3847)
  }

  ipcMain.handle('get-remote-info', () => getRemoteInfo())

  // ── Settings ─────────────────────────────────────────────────────────────
  ipcMain.handle('get-settings', () => getSettings())
  ipcMain.handle('save-settings', (_e, settings: Settings) => {
    const prev = getSettings()
    saveSettings(settings)
    // Start/stop remote server when remoteEnabled changes
    if (settings.remoteEnabled && !prev.remoteEnabled) {
      startHttpServer(win, settings.remotePort ?? 3847)
    } else if (!settings.remoteEnabled && prev.remoteEnabled) {
      stopHttpServer()
    }
  })

  // ── Agent streaming ───────────────────────────────────────────────────────
  ipcMain.handle('run-agent', async (_e, payload: { messages: AgentMessage[]; mode?: AgentMode }) => {
    return runAgent(payload.messages, (chunk) => {
      win.webContents.send('agent-chunk', chunk)
    }, { mode: payload.mode })
  })

  // ── Sessions ──────────────────────────────────────────────────────────────
  ipcMain.handle('get-sessions', () => getSessions())
  ipcMain.handle('save-session', (_e, session: Session) => saveSession(session))
  ipcMain.handle('delete-session', (_e, id: string) => deleteSession(id))

  // ── Scheduled tasks ───────────────────────────────────────────────────────
  ipcMain.handle('get-tasks', () => getTasks())
  ipcMain.handle('save-task', (_e, task: ScheduledTask) => {
    const result = saveTask(task)
    refreshScheduler()
    return result
  })
  ipcMain.handle('delete-task', (_e, id: string) => {
    const result = deleteTask(id)
    refreshScheduler()
    return result
  })

  // Run task immediately — returns full agent response text
  ipcMain.handle('run-task-now', async (_e, prompt: string) => {
    let result = ''
    await runAgent(
      [{ role: 'user', content: prompt }],
      (chunk: { type: string; text?: string }) => {
        if (chunk.type === 'text') result += chunk.text || ''
      }
    )
    return result.trim()
  })

  ipcMain.handle('open-external', (_e, url: string) => shell.openExternal(url))

  // ── Custom skills ─────────────────────────────────────────────────────────
  ipcMain.handle('get-custom-skills', () => {
    const settings = getSettings()
    const dirs = [path.join(os.homedir(), '.nohi', 'skills')]
    if (settings.skillsDir) dirs.push(settings.skillsDir)

    const skills: { name: string; description: string; trigger: string; filePath: string }[] = []

    for (const dir of dirs) {
      if (!fs.existsSync(dir)) continue
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))
      for (const file of files) {
        const filePath = path.join(dir, file)
        const raw = fs.readFileSync(filePath, 'utf-8')
        const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
        if (!match) continue
        const front = match[1]
        const get = (key: string) => {
          const m = front.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'))
          return m ? m[1].trim() : ''
        }
        skills.push({
          name: get('name') || path.basename(file, '.md'),
          description: get('description'),
          trigger: get('trigger'),
          filePath,
        })
      }
    }
    return skills
  })

  // ── Plan files ────────────────────────────────────────────────────────────
  ipcMain.handle('read-plan-files', async (_e, dir: string) => {
    const resolved = dir.startsWith('~') ? dir.replace('~', os.homedir()) : dir
    const plansDir = path.join(resolved, '.claude', 'plans')
    try {
      const files = await fs.promises.readdir(plansDir)
      const mdFiles = files.filter((f) => f.endsWith('.md'))
      const results = await Promise.all(
        mdFiles.map(async (f) => ({
          name: f,
          content: await fs.promises.readFile(path.join(plansDir, f), 'utf-8'),
        }))
      )
      return results
    } catch {
      return []
    }
  })

  // ── Directory dialog ──────────────────────────────────────────────────────
  ipcMain.handle('open-dir-dialog', async () => {
    const result = await dialog.showOpenDialog(win, {
      properties: ['openDirectory'],
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', async () => {
  stopScheduler()
  stopHttpServer()
  await closeAllMCPClients()
  await closeBrowser()
  if (process.platform !== 'darwin') app.quit()
})
