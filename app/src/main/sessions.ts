import fs from 'fs'
import path from 'path'
import os from 'os'

export interface SessionMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface Session {
  id: string
  title: string
  createdAt: string
  history: SessionMessage[]
  archived?: boolean
}

const DATA_DIR = path.join(os.homedir(), '.nohi')
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

export function getSessions(): Session[] {
  try {
    if (!fs.existsSync(SESSIONS_FILE)) return []
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf-8')
    return JSON.parse(raw) as Session[]
  } catch {
    return []
  }
}

export function saveSession(session: Session): void {
  ensureDir()
  const sessions = getSessions()
  const idx = sessions.findIndex((s) => s.id === session.id)
  if (idx >= 0) {
    sessions[idx] = session
  } else {
    sessions.unshift(session)
  }
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8')
}

export function deleteSession(id: string): void {
  ensureDir()
  const sessions = getSessions().filter((s) => s.id !== id)
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2), 'utf-8')
}
