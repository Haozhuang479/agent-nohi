import fs from 'fs'
import path from 'path'
import os from 'os'

export interface ScheduledTask {
  id: string
  name: string
  prompt: string
  schedule: string       // cron expression e.g. "0 8 * * *"
  scheduleLabel: string  // human-readable e.g. "每天 08:00"
  enabled: boolean
  createdAt: string
  lastRun?: string       // ISO timestamp
  lastResult?: string    // truncated output from last run
}

const DATA_DIR = path.join(os.homedir(), '.nohi')
const TASKS_FILE = path.join(DATA_DIR, 'scheduled.json')

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

export function getTasks(): ScheduledTask[] {
  try {
    if (!fs.existsSync(TASKS_FILE)) return []
    const raw = fs.readFileSync(TASKS_FILE, 'utf-8')
    return JSON.parse(raw) as ScheduledTask[]
  } catch {
    return []
  }
}

export function saveTask(task: ScheduledTask): void {
  ensureDir()
  const tasks = getTasks()
  const idx = tasks.findIndex((t) => t.id === task.id)
  if (idx >= 0) {
    tasks[idx] = task
  } else {
    tasks.push(task)
  }
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8')
}

export function deleteTask(id: string): void {
  ensureDir()
  const tasks = getTasks().filter((t) => t.id !== id)
  fs.writeFileSync(TASKS_FILE, JSON.stringify(tasks, null, 2), 'utf-8')
}
