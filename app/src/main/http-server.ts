import express from 'express'
import { WebSocketServer } from 'ws'
import cors from 'cors'
import crypto from 'crypto'
import path from 'path'
import http from 'http'
import type { BrowserWindow } from 'electron'

let remoteToken: string | null = null
let remotePort: number | null = null
let httpServer: http.Server | null = null

export function getRemoteInfo(): { port: number; token: string } | null {
  if (!remoteToken || !remotePort) return null
  return { port: remotePort, token: remoteToken }
}

export function startHttpServer(win: BrowserWindow, port = 3847): { token: string; port: number } {
  if (httpServer) {
    httpServer.close()
    httpServer = null
  }

  remoteToken = crypto.randomBytes(16).toString('hex')
  remotePort = port

  const app = express()
  app.use(cors())
  app.use(express.json())

  // Auth middleware (skip for login)
  app.use((req, res, next) => {
    if (req.path === '/api/login' || req.path === '/api/health') return next()
    const auth = req.headers.authorization
    if (auth !== `Bearer ${remoteToken}`) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    next()
  })

  app.get('/api/health', (_req, res) => res.json({ ok: true }))

  app.post('/api/login', (req, res) => {
    const { token } = req.body as { token?: string }
    if (token === remoteToken) {
      res.json({ ok: true, token: remoteToken })
    } else {
      res.status(401).json({ error: 'Invalid token' })
    }
  })

  // Serve built renderer
  const rendererPath = path.join(__dirname, '../renderer')
  app.use(express.static(rendererPath))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(rendererPath, 'index.html'))
  })

  const server = http.createServer(app)
  httpServer = server

  // WebSocket bridge: forwards IPC ↔ WS
  const wss = new WebSocketServer({ server })

  wss.on('connection', (ws) => {
    // Main → WS: forward agent-chunk events to remote clients
    const ipcListener = (_event: Electron.IpcMainEvent, channel: string, ...args: unknown[]) => {
      if (ws.readyState === ws.OPEN) {
        try {
          ws.send(JSON.stringify({ channel, data: args[0] }))
        } catch (e) {
          console.error('[Remote] ws.send error:', e)
        }
      }
    }

    // Forward agent-chunk events from renderer to WS
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    win.webContents.on('ipc-message' as any, ipcListener as any)

    ws.on('close', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      win.webContents.removeListener('ipc-message' as any, ipcListener as any)
    })

    ws.on('message', (data) => {
      try {
        const { channel, payload } = JSON.parse(data.toString()) as { channel: string; payload: unknown }
        // Forward remote WS message as IPC to main process
        win.webContents.send(channel, payload)
      } catch { /* ignore malformed messages */ }
    })
  })

  server.listen(port, () => {
    console.log(`[Remote] HTTP server listening on port ${port}`)
  })

  return { token: remoteToken, port }
}

export function stopHttpServer(): void {
  httpServer?.close()
  httpServer = null
  remoteToken = null
  remotePort = null
}
