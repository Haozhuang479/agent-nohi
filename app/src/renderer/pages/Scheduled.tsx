import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import FolderPicker from '../components/FolderPicker'
import './Scheduled.css'

interface Task {
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

type Schedule = Task['schedule']

const AGENT_MODES = [
  { value: 'ask', label: 'Ask permissions' },
  { value: 'auto', label: 'Auto accept edits' },
  { value: 'plan', label: 'Plan mode' },
]

const MODELS = ['claude-opus-4-5', 'claude-sonnet-4-6', 'claude-haiku-4-5']

function scheduleToLabel(schedule: Schedule, scheduleTime?: string): string {
  const time = scheduleTime ?? '09:00'
  switch (schedule) {
    case 'manual': return 'Manual'
    case 'hourly': return 'Hourly'
    case 'daily': return `Daily at ${time}`
    case 'weekdays': return `Weekdays at ${time}`
    case 'weekly': return `Weekly at ${time}`
    default: return schedule
  }
}

function getScheduleLabel(schedule: Schedule, t: (k: string) => string, scheduleTime?: string): string {
  const time = scheduleTime ?? '09:00'
  switch (schedule) {
    case 'manual': return t('Manual')
    case 'hourly': return t('Hourly')
    case 'daily': return `${t('Daily')} at ${time}`
    case 'weekdays': return `${t('Weekdays')} at ${time}`
    case 'weekly': return `${t('Weekly')} at ${time}`
    default: return schedule
  }
}

function formatRelativeTime(iso?: string): string {
  if (!iso) return 'Never'
  const date = new Date(iso)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const IconPlus = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M6 1v10M1 6h10"/>
  </svg>
)

const IconPlay = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
    <path d="M3 2.5l7 3.5-7 3.5z"/>
  </svg>
)

const IconEdit = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8.5 1.5l2 2-6 6H2.5v-2l6-6z"/>
  </svg>
)

const IconTrash = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 3h9M4 3V2h4v1M2.5 3l.7 7.5h5.6L9.5 3"/>
  </svg>
)

const IconClock = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="26" cy="28" r="18"/>
    <path d="M26 18v10l6 4"/>
    <path d="M20 8h12M26 4v6"/>
  </svg>
)

const IconClose = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M2 2l8 8M10 2l-8 8"/>
  </svg>
)

const IconChevron = () => (
  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <path d="M2 3.5l3 3 3-3"/>
  </svg>
)

const IconInfo = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="6.5"/>
    <path d="M8 7.5v4M8 5.5v.5"/>
  </svg>
)

// ── Blank form ────────────────────────────────────────────────────────────────

function blankForm() {
  return {
    name: '',
    description: '',
    prompt: '',
    schedule: 'daily' as Schedule,
    scheduleTime: '09:00',
    workDir: '',
    worktree: false,
    agentMode: 'ask',
    model: 'claude-sonnet-4-6',
    enabled: true,
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Scheduled() {
  const { t } = useTranslation()
  const [tasks, setTasks] = useState<Task[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(blankForm())
  const [runningId, setRunningId] = useState<string | null>(null)
  const [runResult, setRunResult] = useState<{ id: string; text: string } | null>(null)
  const [showAgentMenu, setShowAgentMenu] = useState(false)
  const [showModelMenu, setShowModelMenu] = useState(false)
  const [agentMenuStyle, setAgentMenuStyle] = useState<React.CSSProperties>({})
  const [modelMenuStyle, setModelMenuStyle] = useState<React.CSSProperties>({})
  const agentBtnRef = useRef<HTMLButtonElement>(null)
  const modelBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    window.nohi.getTasks().then((saved) => setTasks(saved as Task[]))
  }, [])

  const persistTask = async (task: Task) => {
    await window.nohi.saveTask(task as unknown as ScheduledTask)
  }

  const openNew = () => {
    setEditingId(null)
    setForm(blankForm())
    setShowForm(true)
    setShowAgentMenu(false)
    setShowModelMenu(false)
  }

  const openEdit = (task: Task) => {
    setEditingId(task.id)
    setForm({
      name: task.name,
      description: task.description ?? '',
      prompt: task.prompt,
      schedule: task.schedule as Schedule,
      scheduleTime: task.scheduleTime ?? '09:00',
      workDir: task.workDir ?? '',
      worktree: task.worktree ?? false,
      agentMode: task.agentMode ?? 'ask',
      model: task.model ?? 'claude-sonnet-4-6',
      enabled: task.enabled,
    })
    setShowForm(true)
  }

  const cancelForm = () => {
    setShowForm(false)
    setEditingId(null)
  }

  const canSave = form.name.trim().length > 0 && form.description.trim().length > 0 && form.prompt.trim().length > 0

  const saveForm = async () => {
    if (!canSave) return

    const base: Omit<Task, 'id' | 'createdAt'> = {
      name: form.name.trim(),
      description: form.description.trim(),
      prompt: form.prompt.trim(),
      schedule: form.schedule,
      scheduleTime: ['daily', 'weekdays', 'weekly'].includes(form.schedule) ? form.scheduleTime : undefined,
      workDir: form.workDir || undefined,
      worktree: form.worktree || undefined,
      agentMode: form.agentMode,
      model: form.model,
      enabled: form.enabled,
    }

    if (editingId) {
      const existing = tasks.find((t) => t.id === editingId)!
      const updated: Task = {
        ...base,
        id: editingId,
        createdAt: existing.createdAt,
        lastRun: existing.lastRun,
        lastResult: existing.lastResult,
      }
      await persistTask(updated)
      setTasks((prev) => prev.map((t) => (t.id === editingId ? updated : t)))
    } else {
      const newTask: Task = { ...base, id: crypto.randomUUID(), createdAt: new Date().toISOString() }
      await persistTask(newTask)
      setTasks((prev) => [newTask, ...prev])
    }

    setShowForm(false)
    setEditingId(null)
  }

  const toggleEnabled = async (task: Task) => {
    const updated = { ...task, enabled: !task.enabled }
    await persistTask(updated)
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
  }

  const deleteTask = async (id: string) => {
    await window.nohi.deleteTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }

  const runNow = async (task: Task) => {
    setRunningId(task.id)
    setRunResult(null)
    try {
      const result = await window.nohi.runTaskNow(task.prompt, {
        agentMode: task.agentMode,
        model: task.model,
        workDir: task.workDir,
      })
      const now = new Date().toISOString()
      const updated: Task = { ...task, lastRun: now, lastResult: result as string }
      await persistTask(updated)
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)))
      setRunResult({ id: task.id, text: result as string })
    } catch (err) {
      setRunResult({ id: task.id, text: `Error: ${String(err)}` })
    } finally {
      setRunningId(null)
    }
  }

  const currentModeLabel = t(AGENT_MODES.find((m) => m.value === form.agentMode)?.label ?? 'Ask permissions')
  const shortModel = form.model.replace('claude-', '').replace(/-(\d)/g, ' $1').replace(/-/g, ' ')
    .split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  return (
    <div className="scheduled-page">
      {/* Header */}
      <div className="scheduled-header">
        <div className="scheduled-header-row">
          <div>
            <h1>{t('Scheduled tasks')}</h1>
            <p>Run tasks on a schedule or whenever you need them. Type <code>/schedule</code> in any existing session to set one up.</p>
          </div>
          <button className="sched-new-btn" onClick={openNew}>
            <IconPlus /> {t('New task')}
          </button>
        </div>
      </div>

      {/* ── Modal overlay ── */}
      {showForm && (
        <div className="sched-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) cancelForm() }}>
          <div className="sched-modal" onMouseDown={(e) => e.stopPropagation()}>

            {/* Modal header */}
            <div className="sched-modal-header">
              <span className="sched-modal-title">{editingId ? t('Edit scheduled task') : t('New scheduled task')}</span>
              <button className="sched-form-close" onClick={cancelForm}><IconClose /></button>
            </div>

            {/* Info banner */}
            <div className="sched-modal-banner">
              <IconInfo />
              <span>Local tasks only run while your computer is awake.</span>
            </div>

            {/* Body */}
            <div className="sched-modal-body">

              {/* Name */}
              <div className="sched-field">
                <label>{t('Name')} <span className="sched-required">*</span></label>
                <input
                  type="text"
                  placeholder="daily-code-review"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>

              {/* Description */}
              <div className="sched-field">
                <label>{t('Description')} <span className="sched-required">*</span></label>
                <input
                  type="text"
                  placeholder="Review yesterday's commits and flag anything concerning"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              {/* Prompt card */}
              <div className="sched-prompt-card">
                <textarea
                  className="sched-prompt-textarea"
                  placeholder="Look at the commits from the last 24 hours. Summarize what changed, call out any risky patterns or missing tests, and note anything worth following up on."
                  value={form.prompt}
                  onChange={(e) => setForm((f) => ({ ...f, prompt: e.target.value }))}
                  rows={5}
                />
                <div className="sched-prompt-toolbar">
                  <div className="sched-toolbar-left">

                    {/* Agent mode */}
                    <div style={{ position: 'relative' }}>
                      <button
                        ref={agentBtnRef}
                        className="sched-toolbar-btn"
                        onClick={() => {
                          if (!showAgentMenu && agentBtnRef.current) {
                            const r = agentBtnRef.current.getBoundingClientRect()
                            setAgentMenuStyle({ top: r.bottom + 4, left: r.left })
                          }
                          setShowAgentMenu((v) => !v)
                          setShowModelMenu(false)
                        }}
                        type="button"
                      >
                        <span>{currentModeLabel}</span>
                        <IconChevron />
                      </button>
                      {showAgentMenu && (
                        <div className="sched-mini-dropdown" style={agentMenuStyle}>
                          {AGENT_MODES.map((m) => (
                            <button
                              key={m.value}
                              className={`sched-mini-item ${form.agentMode === m.value ? 'active' : ''}`}
                              onClick={() => { setForm((f) => ({ ...f, agentMode: m.value })); setShowAgentMenu(false) }}
                              type="button"
                            >
                              {t(m.label)}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Folder picker */}
                    <FolderPicker
                      value={form.workDir || undefined}
                      onChange={(dir) => setForm((f) => ({ ...f, workDir: dir }))}
                      placeholder="Select folder"
                    />

                    {/* worktree toggle hidden — backend support pending */}
                  </div>

                  <div style={{ position: 'relative' }}>
                    <button
                      className="sched-toolbar-btn"
                      onClick={() => { setShowModelMenu((v) => !v); setShowAgentMenu(false) }}
                      type="button"
                    >
                      <span>{shortModel}</span>
                      <IconChevron />
                    </button>
                    {showModelMenu && (
                      <div className="sched-mini-dropdown sched-mini-dropdown-right">
                        {MODELS.map((m) => (
                          <button
                            key={m}
                            className={`sched-mini-item ${form.model === m ? 'active' : ''}`}
                            onClick={() => { setForm((f) => ({ ...f, model: m })); setShowModelMenu(false) }}
                            type="button"
                          >
                            {m.replace('claude-', '')}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Frequency */}
              <div className="sched-field">
                <label>{t('Frequency')}</label>
                <select
                  value={form.schedule}
                  onChange={(e) => setForm((f) => ({ ...f, schedule: e.target.value as Schedule }))}
                >
                  <option value="manual">{t('Manual')}</option>
                  <option value="hourly">{t('Hourly')}</option>
                  <option value="daily">{t('Daily')}</option>
                  <option value="weekdays">{t('Weekdays')}</option>
                  <option value="weekly">{t('Weekly')}</option>
                </select>
              </div>

              {/* Time picker */}
              {['daily', 'weekdays', 'weekly'].includes(form.schedule) && (
                <input
                  type="time"
                  className="sched-time-input"
                  value={form.scheduleTime}
                  onChange={(e) => setForm((f) => ({ ...f, scheduleTime: e.target.value }))}
                />
              )}

              {/* Disclaimer */}
              <p className="sched-delay-note">
                Scheduled tasks use a randomized delay of several minutes for server performance.
              </p>
            </div>

            {/* Footer */}
            <div className="sched-modal-footer">
              <button className="sched-btn-ghost" onClick={cancelForm} type="button">{t('Cancel')}</button>
              <button
                className="sched-btn-primary"
                onClick={saveForm}
                disabled={!canSave}
                type="button"
              >
                {editingId ? t('Save task') : t('Create task')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="scheduled-body">
        {tasks.length === 0 ? (
          <div className="sched-empty">
            <div className="sched-empty-icon"><IconClock /></div>
            <p>{t('No scheduled tasks yet.')}</p>
          </div>
        ) : (
          <div className="sched-list">
            {tasks.map((task) => (
              <div key={task.id} className="sched-card">
                <div className="sched-card-top">
                  <div className="sched-card-left">
                    <div className="sched-card-name">{task.name}</div>
                    {task.description && (
                      <div className="sched-card-desc">{task.description}</div>
                    )}
                    <div className="sched-card-meta">
                      <span className="sched-badge">{getScheduleLabel(task.schedule, t, task.scheduleTime)}</span>
                      {task.lastRun && (
                        <span className="sched-last-run">Last run {formatRelativeTime(task.lastRun)}</span>
                      )}
                    </div>
                  </div>

                  <div className="sched-card-actions">
                    <button
                      className={`sched-run-btn ${runningId === task.id ? 'loading' : ''}`}
                      onClick={() => runNow(task)}
                      disabled={runningId !== null}
                      title="Run now"
                    >
                      {runningId === task.id ? <span className="sched-spinner" /> : <><IconPlay /> Run now</>}
                    </button>

                    <button className="sched-icon-btn" onClick={() => openEdit(task)} title="Edit">
                      <IconEdit />
                    </button>

                    <button className="sched-icon-btn danger" onClick={() => deleteTask(task.id)} title="Delete">
                      <IconTrash />
                    </button>

                    <label className="sched-toggle-label" title={task.enabled ? 'Disable' : 'Enable'}>
                      <span className={`sched-toggle ${task.enabled ? 'on' : ''}`} onClick={() => toggleEnabled(task)}>
                        <span className="sched-toggle-thumb" />
                      </span>
                    </label>
                  </div>
                </div>

                <div className="sched-card-prompt">{task.prompt}</div>

                {runResult?.id === task.id && (
                  <div className="sched-result">
                    <div className="sched-result-label">Latest result</div>
                    <div className="sched-result-text">{runResult.text}</div>
                  </div>
                )}

                {task.lastResult && runResult?.id !== task.id && (
                  <details className="sched-last-result">
                    <summary>Previous result</summary>
                    <div className="sched-result-text">{task.lastResult}</div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
