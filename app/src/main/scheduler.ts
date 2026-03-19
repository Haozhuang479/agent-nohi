/**
 * scheduler.ts — background cron runner for Nohi scheduled tasks
 *
 * Maintains a registry of node-cron jobs (one per enabled task).
 * Call refreshScheduler() any time tasks are saved or deleted so the
 * registry stays in sync with the persisted task list.
 */

import cron from 'node-cron'
import type { ScheduledTask as CronTask } from 'node-cron'
import { getTasks, saveTask } from './scheduled'
import { runAgent } from './agent'

// Map of taskId → active CronJob
const jobs = new Map<string, CronTask>()

/** Start the scheduler on app launch. */
export function startScheduler(): void {
  refreshScheduler()
}

/**
 * Rebuild the cron job registry from the current task list.
 * Called on startup and after every save-task / delete-task IPC.
 */
export function refreshScheduler(): void {
  // Stop and remove all existing jobs
  jobs.forEach((job) => job.stop())
  jobs.clear()

  const tasks = getTasks()

  for (const task of tasks) {
    if (!task.enabled) continue
    if (!cron.validate(task.schedule)) {
      console.warn(`[scheduler] Invalid cron expression for task "${task.name}": ${task.schedule}`)
      continue
    }

    const job = cron.schedule(task.schedule, async () => {
      console.log(`[scheduler] Running task "${task.name}" (${task.id})`)
      let result = ''
      try {
        await runAgent(
          [{ role: 'user', content: task.prompt }],
          (chunk: { type: string; text?: string }) => {
            if (chunk.type === 'text') result += chunk.text || ''
          }
        )
      } catch (err) {
        result = `Error: ${String(err)}`
      }

      // Persist last-run metadata (truncate result to 1 KB)
      try {
        saveTask({
          ...task,
          lastRun: new Date().toISOString(),
          lastResult: result.trim().slice(0, 1024),
        })
      } catch (e) {
        console.error(`[scheduler] Failed to save task result for "${task.name}":`, e)
      }
    })

    jobs.set(task.id, job)
  }

  console.log(`[scheduler] ${jobs.size} job(s) scheduled.`)
}

/** Gracefully stop all jobs (called on app quit). */
export function stopScheduler(): void {
  jobs.forEach((job) => job.stop())
  jobs.clear()
}
