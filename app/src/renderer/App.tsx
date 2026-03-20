import React, { useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import Chat from './pages/Chat'
import Settings from './pages/Settings'
import Scheduled from './pages/Scheduled'
import Customize from './pages/Customize'
import FolderPicker from './components/FolderPicker'
import './App.css'

// ─── SVG Icon Components ──────────────────────────────────────────────────────

const IconPlus = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M6 1v10M1 6h10"/>
  </svg>
)

const IconChat = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3a1 1 0 011-1h8a1 1 0 011 1v5a1 1 0 01-1 1H8L5.5 11V9H3a1 1 0 01-1-1V3z"/>
  </svg>
)


const IconSettings = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
    <circle cx="7" cy="7" r="1.8"/>
    <path d="M7 1.5v1.2M7 11.3v1.2M1.5 7h1.2M11.3 7h1.2M3.2 3.2l.85.85M9.95 9.95l.85.85M3.2 10.8l.85-.85M9.95 4.05l.85-.85"/>
  </svg>
)

const IconSchedule = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="2.5" width="11" height="10" rx="1.5"/>
    <path d="M4.5 1.5v2M9.5 1.5v2M1.5 6.5h11"/>
  </svg>
)

const IconDocs = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 1.5h5.5L11 4v8.5H3V1.5z"/>
    <path d="M8.5 1.5v3H11M5 6.5h4M5 9h2.5"/>
  </svg>
)

const IconTrash = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 3h9M4 3V2h4v1M2.5 3l.7 7.5h5.6L9.5 3"/>
  </svg>
)

const IconChevronSmall = () => (
  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 3.5L5 6.5l2.5-3"/>
  </svg>
)

const IconFolder = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 4.5a1 1 0 011-1H5l1.5 1.5h5a1 1 0 011 1v5a1 1 0 01-1 1h-9a1 1 0 01-1-1V4.5z"/>
  </svg>
)

const IconSearch = () => (
  <svg width="11" height="11" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="5.5" r="4"/>
    <path d="M8.5 8.5l2.5 2.5"/>
  </svg>
)

const IconExport = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 8.5V10h8V8.5M6 1.5v6M3.5 5l2.5 2.5L8.5 5"/>
  </svg>
)

const IconBug = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <ellipse cx="7" cy="8" rx="3.5" ry="4"/>
    <path d="M4 4.5A3 3 0 0110 4.5M1.5 7h2M10.5 7h2M2.5 5l1.5 1M10 6l1.5-1M2.5 10l1.5-1M10 9l1.5 1"/>
  </svg>
)

const IconChevronUp = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7.5L6 4l3.5 3.5"/>
  </svg>
)

const IconKey = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="6" r="3"/>
    <path d="M8 8l4.5 4.5M9.5 9.5l1.5-1.5"/>
  </svg>
)

const IconLogOut = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5.5 2H2.5a1 1 0 00-1 1v8a1 1 0 001 1h3M9.5 4.5L12 7l-2.5 2.5M12 7H5.5"/>
  </svg>
)

const IconUpgrade = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 2.5L10.5 6H8V11H6V6H3.5L7 2.5z"/>
    <path d="M2 12h10"/>
  </svg>
)

const IconKeyboard = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="3.5" width="11" height="7" rx="1.2"/>
    <path d="M4 6h.01M7 6h.01M10 6h.01M4 8.5h.01M5.5 8.5h3M10 8.5h.01"/>
  </svg>
)

const IconCustomize = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="1.5" width="4" height="4" rx="1"/>
    <rect x="8.5" y="1.5" width="4" height="4" rx="1"/>
    <rect x="1.5" y="8.5" width="4" height="4" rx="1"/>
    <path d="M8.5 10.5h4M10.5 8.5v4"/>
  </svg>
)

const IconArchive = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="1.5" width="10" height="2.5" rx="0.8"/>
    <path d="M1.5 4v5.5a1 1 0 001 1h7a1 1 0 001-1V4"/>
    <path d="M4.5 7h3"/>
  </svg>
)

const IconFilter = () => (
  <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3.5h10M4 7h6M6 10.5h2"/>
  </svg>
)

const IconPlan = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="1.5" width="10" height="11" rx="1.2"/>
    <path d="M4.5 4.5h5M4.5 7h5M4.5 9.5h3"/>
  </svg>
)

const IconSun = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
    <circle cx="7" cy="7" r="2.5"/>
    <path d="M7 1.5v1M7 11.5v1M1.5 7h1M11.5 7h1M3.2 3.2l.7.7M10.1 10.1l.7.7M3.2 10.8l.7-.7M10.1 3.9l.7-.7"/>
  </svg>
)

const IconMoon = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
    <path d="M11.5 9A6 6 0 015 2.5a6 6 0 100 9 6 6 0 006.5-2.5z"/>
  </svg>
)

const IconCheckMark = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6l3 3 5-5"/>
  </svg>
)

// ─── Plan Viewer ──────────────────────────────────────────────────────────────

interface PlanFile {
  name: string
  content: string
}

interface PlanViewerProps {
  files: PlanFile[]
  activeIdx: number
  onChangeIdx: (i: number) => void
  onClose: () => void
  workDir: string
  onFilesChange: (files: PlanFile[]) => void
}

function PlanViewer({ files, activeIdx, onChangeIdx, onClose, workDir, onFilesChange }: PlanViewerProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [creating, setCreating] = React.useState(false)
  const [newPlanName, setNewPlanName] = React.useState('')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  const handleCreate = async () => {
    const name = newPlanName.trim()
    if (!name) return
    const file = await window.nohi.createPlanFile(workDir, name, `# ${name}\n\n`)
    onFilesChange([...files, file])
    onChangeIdx(files.length)
    setCreating(false)
    setNewPlanName('')
  }

  const handleDelete = async (idx: number) => {
    const file = files[idx]
    if (!confirm(`Delete "${file.name}"?`)) return
    await window.nohi.deletePlanFile(workDir, file.name)
    const next = files.filter((_, i) => i !== idx)
    onFilesChange(next)
    onChangeIdx(Math.min(activeIdx, next.length - 1))
  }

  return (
    <div
      className="plan-viewer-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="plan-viewer" ref={ref}>
        <div className="plan-viewer-header">
          <div className="plan-viewer-tabs">
            {files.length === 0 ? (
              <span className="plan-viewer-empty-tab">No plans</span>
            ) : (
              files.map((f, i) => (
                <span key={f.name} className={`plan-tab-wrap ${i === activeIdx ? 'active' : ''}`}>
                  <button
                    className={`plan-tab ${i === activeIdx ? 'active' : ''}`}
                    onClick={() => onChangeIdx(i)}
                  >
                    {f.name}
                  </button>
                  {i === activeIdx && (
                    <button className="plan-tab-delete" onClick={() => handleDelete(i)} title="Delete this plan">✕</button>
                  )}
                </span>
              ))
            )}
            {creating ? (
              <span className="plan-tab-new-row">
                <input
                  className="plan-tab-new-input"
                  placeholder="plan-name"
                  value={newPlanName}
                  autoFocus
                  onChange={(e) => setNewPlanName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate()
                    if (e.key === 'Escape') { setCreating(false); setNewPlanName('') }
                  }}
                />
                <button className="plan-tab-new-confirm" onClick={handleCreate}>✓</button>
                <button className="plan-tab-new-cancel" onClick={() => { setCreating(false); setNewPlanName('') }}>✕</button>
              </span>
            ) : (
              <button className="plan-viewer-new-btn" onClick={() => setCreating(true)}>+ New</button>
            )}
          </div>
          <button className="plan-viewer-close" onClick={onClose}>✕</button>
        </div>
        <div className="plan-viewer-body">
          {files.length === 0 && !creating ? (
            <p className="plan-viewer-none">No plan files found in .claude/plans/ — click "+ New" to create one.</p>
          ) : (
            <pre className="plan-viewer-content">{files[activeIdx]?.content ?? ''}</pre>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Page = 'chat' | 'scheduled' | 'settings' | 'customize'
type AgentMode = 'ask' | 'auto' | 'plan' | 'bypass'

// bypass is disabled; Shift+Tab cycles only through these three
const MODES: AgentMode[] = ['ask', 'auto', 'plan']

function statusbarModeLabel(mode: AgentMode): string {
  if (mode === 'ask') return 'Ask'
  if (mode === 'auto') return 'Auto'
  if (mode === 'plan') return 'Plan'
  return 'Bypass'
}

function isToday(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  )
}

function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr)
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  weekStart.setHours(0, 0, 0, 0)
  return date >= weekStart && !isToday(dateStr)
}

function relativeTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ago`
  const diffD = Math.floor(diffH / 24)
  if (diffD === 1) return 'Yesterday'
  if (diffD < 7) return `${diffD} days ago`
  if (diffD < 14) return 'Last week'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// ─── App ──────────────────────────────────────────────────────────────────────

// ─── Search Modal ─────────────────────────────────────────────────────────────

const IconChatSmall = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3a1 1 0 011-1h8a1 1 0 011 1v5a1 1 0 01-1 1H8L5.5 11V9H3a1 1 0 01-1-1V3z"/>
  </svg>
)

interface SearchModalProps {
  sessions: NohiSession[]
  onSelect: (id: string) => void
  onClose: () => void
}

function SearchModal({ sessions, onSelect, onClose }: SearchModalProps) {
  const [query, setQuery] = React.useState('')
  const [highlighted, setHighlighted] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  // Escape closes
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlighted((h) => Math.min(h + 1, filtered.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlighted((h) => Math.max(h - 1, 0))
      }
      if (e.key === 'Enter') {
        if (filtered[highlighted]) { onSelect(filtered[highlighted].id); onClose() }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  })

  const q = query.trim().toLowerCase()
  const filtered = q
    ? sessions.filter((s) => s.title.toLowerCase().includes(q))
    : sessions

  // Reset highlight when query changes
  useEffect(() => { setHighlighted(0) }, [query])

  // Scroll highlighted item into view
  useEffect(() => {
    const item = listRef.current?.querySelector(`[data-idx="${highlighted}"]`) as HTMLElement
    item?.scrollIntoView({ block: 'nearest' })
  }, [highlighted])

  return (
    <div className="search-modal-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="search-modal">
        <div className="search-modal-input-row">
          <IconSearch />
          <input
            ref={inputRef}
            className="search-modal-input"
            placeholder="Search projects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button className="search-modal-clear" onClick={() => setQuery('')}>✕</button>
          )}
          <kbd className="search-modal-esc">esc</kbd>
        </div>

        <div className="search-modal-list" ref={listRef}>
          {filtered.length === 0 ? (
            <div className="search-modal-empty">No projects match "{query}"</div>
          ) : (
            filtered.map((s, idx) => (
              <button
                key={s.id}
                data-idx={idx}
                className={`search-modal-item${idx === highlighted ? ' highlighted' : ''}`}
                onMouseEnter={() => setHighlighted(idx)}
                onClick={() => { onSelect(s.id); onClose() }}
              >
                <span className="search-modal-item-icon"><IconChatSmall /></span>
                <span className="search-modal-item-title">{s.title}</span>
                <span className="search-modal-item-time">{relativeTime(s.createdAt)}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── About Dropdown ───────────────────────────────────────────────────────────

function AboutDropdown({ onClose }: { onClose: () => void }) {
  const ref = React.useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div className="about-dropdown" ref={ref}>
      <div className="about-dropdown-header">
        <span className="about-logo-icon">N</span>
        <div>
          <div className="about-name">Nohi Desktop</div>
          <div className="about-version">v0.1.0-demo</div>
        </div>
      </div>
      <div className="about-divider" />
      <div className="about-section-label">Keyboard shortcuts</div>
      <div className="about-shortcut-row">
        <span className="about-shortcut-key">⌘K</span>
        <span className="about-shortcut-desc">Search sessions</span>
      </div>
      <div className="about-shortcut-row">
        <span className="about-shortcut-key">⌘,</span>
        <span className="about-shortcut-desc">Open Settings</span>
      </div>
      <div className="about-shortcut-row">
        <span className="about-shortcut-key">Enter</span>
        <span className="about-shortcut-desc">Send message</span>
      </div>
      <div className="about-shortcut-row">
        <span className="about-shortcut-key">Shift+Enter</span>
        <span className="about-shortcut-desc">New line</span>
      </div>
      <div className="about-shortcut-row">
        <span className="about-shortcut-key">Shift+Tab</span>
        <span className="about-shortcut-desc">Cycle agent mode</span>
      </div>
      <div className="about-divider" />
      <button
        className="about-docs-btn"
        onClick={() => { window.nohi.openExternal('https://nohi.so/docs'); onClose() }}
      >
        <IconDocs /> Open Docs ↗
      </button>
    </div>
  )
}

// ─── User Menu Dropdown ───────────────────────────────────────────────────────

interface UserMenuProps {
  provider: string
  model: string
  userName: string
  onClose: () => void
  onGoSettings: () => void
  onShowShortcuts: () => void
  onClearKey: () => void
}

function UserMenuDropdown({ provider, model, userName, onClose, onGoSettings, onShowShortcuts, onClearKey }: UserMenuProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const providerLabel = provider === 'anthropic' ? 'Anthropic' : provider === 'openai' ? 'OpenAI' : 'Google'

  return (
    <div className="user-menu-dropdown" ref={ref}>
      {/* Account header */}
      <div className="user-menu-header">
        <div className="user-menu-avatar">{userName.charAt(0).toUpperCase()}</div>
        <div className="user-menu-header-info">
          <span className="user-menu-name">{userName}</span>
          <span className="user-menu-sub">{providerLabel} · {model}</span>
        </div>
      </div>

      <div className="user-menu-divider" />

      <button className="user-menu-item" onClick={() => { onGoSettings(); onClose() }}>
        <IconSettings />
        <span>Settings</span>
        <span className="user-menu-shortcut">⌘,</span>
      </button>
      <button className="user-menu-item" onClick={() => { onShowShortcuts(); onClose() }}>
        <IconKeyboard />
        <span>Keyboard shortcuts</span>
      </button>
      <button className="user-menu-item" onClick={() => { window.nohi.openExternal('https://nohi.so/docs'); onClose() }}>
        <IconDocs />
        <span>Get help</span>
      </button>

      <div className="user-menu-divider" />

      <button className="user-menu-item" onClick={() => { window.nohi.openExternal('https://nohi.so/upgrade'); onClose() }}>
        <IconUpgrade />
        <span>Upgrade plan</span>
      </button>
      <button className="user-menu-item" onClick={() => { window.nohi.openExternal('https://github.com/nohi-ai/nohi/issues'); onClose() }}>
        <IconBug />
        <span>Report a bug</span>
      </button>

      <div className="user-menu-divider" />

      <button className="user-menu-item user-menu-item-destructive" onClick={() => { onClearKey(); onClose() }}>
        <IconLogOut />
        <span>Clear API key</span>
      </button>
    </div>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const { t } = useTranslation()
  const [page, setPage] = useState<Page>('chat')
  const [hasKey, setHasKey] = useState(false)
  const [skillsDir, setSkillsDir] = useState('~/.nohi/skills')
  const [sessions, setSessions] = useState<NohiSession[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const [hoveredSessionId, setHoveredSessionId] = useState<string>('')
  const [agentMode, setAgentMode] = useState<AgentMode>('ask')
  const [showAbout, setShowAbout] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [sessionDirs, setSessionDirs] = useState<Record<string, string>>({})
  const [currentProvider, setCurrentProvider] = useState('anthropic')
  const [currentModel, setCurrentModel] = useState('claude-sonnet-4-6')
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleDraft, setTitleDraft] = useState('')
  const [showFilter, setShowFilter] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('active')
  const [envFilter, setEnvFilter] = useState<'all' | 'local' | 'cloud' | 'remote'>('all')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [updateDownloaded, setUpdateDownloaded] = useState(false)
  const [showPlanViewer, setShowPlanViewer] = useState(false)
  const [planFiles, setPlanFiles] = useState<PlanFile[]>([])
  const [activePlanIdx, setActivePlanIdx] = useState(0)
  const [userName, setUserName] = useState('Nohi')
  const [editingUserName, setEditingUserName] = useState(false)
  const [userNameDraft, setUserNameDraft] = useState('')

  // Load sessions from disk on mount
  useEffect(() => {
    window.nohi.getSettings().then((s) => {
      if (!s.apiKey) setPage('settings')
      else setHasKey(true)
      if (s.skillsDir) setSkillsDir(s.skillsDir)
      if (s.provider) setCurrentProvider(s.provider)
      if (s.model) setCurrentModel(s.model)
      if (s.userName) setUserName(s.userName)
      const t = s.theme ?? 'light'
      setTheme(t)
      document.documentElement.setAttribute('data-theme', t)
    })
    window.nohi.getSessions().then((saved) => {
      if (saved.length > 0) {
        setSessions(saved)
        setActiveId(saved[0].id)
      } else {
        // Create first session in memory (will be persisted on first message)
        const first: NohiSession = {
          id: crypto.randomUUID(),
          title: 'New project',
          createdAt: new Date().toISOString(),
          history: [],
        }
        setSessions([first])
        setActiveId(first.id)
      }
    })
  }, [])

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Shift+Tab — cycle agent mode (mirrors Claude Code behavior)
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault()
        setAgentMode((prev) => {
          const idx = MODES.indexOf(prev)
          return MODES[(idx + 1) % MODES.length]
        })
      }
      // ⌘, (Cmd+Comma) — open Settings
      if (e.key === ',' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setPage('settings')
      }
      // ⌘K — open search modal
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setShowSearch((v) => !v)
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  // Cycle through ask → auto → plan (bypass excluded)
  const cycleMode = () => {
    setAgentMode((prev) => {
      const idx = MODES.indexOf(prev)
      return MODES[(idx + 1) % MODES.length]
    })
  }

  // Exposed for Chat component to call (e.g. from PermissionsDropdown)
  const setMode = (mode: AgentMode) => setAgentMode(mode)

  // Per-session working directory
  const currentDir = sessionDirs[activeId] ?? '~/'
  const setWorkDir = (dir: string) => {
    setSessionDirs((prev) => ({ ...prev, [activeId]: dir }))
  }

  const onSettingsSaved = () => {
    setHasKey(true)
    setPage('chat')
    // Refresh displayed provider/model
    window.nohi.getSettings().then((s) => {
      if (s.provider) setCurrentProvider(s.provider)
      if (s.model) setCurrentModel(s.model)
    })
  }

  const clearApiKey = async () => {
    const s = await window.nohi.getSettings()
    await window.nohi.saveSettings({ ...s, apiKey: '' })
    setHasKey(false)
    setPage('settings')
  }

  const saveUserName = async (name: string) => {
    const trimmed = name.trim() || 'Nohi'
    setUserName(trimmed)
    const s = await window.nohi.getSettings()
    window.nohi.saveSettings({ ...s, userName: trimmed })
  }

  const toggleTheme = async () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    const s = await window.nohi.getSettings()
    window.nohi.saveSettings({ ...s, theme: next })
  }

  // GAP 6: auto-update listeners
  useEffect(() => {
    const unsubDownloaded = window.nohi.onUpdateDownloaded(() => setUpdateDownloaded(true))
    return () => { unsubDownloaded() }
  }, [])

  const newSession = () => {
    const id = crypto.randomUUID()
    const s: NohiSession = {
      id,
      title: 'New project',
      createdAt: new Date().toISOString(),
      history: [],
    }
    setSessions((prev) => [s, ...prev])
    setActiveId(id)
    setPage('chat')
  }

  const handleSessionUpdate = useCallback(
    (updatedHistory: SessionMessage[], title?: string) => {
      setSessions((prev) => {
        const updated = prev.map((s) =>
          s.id === activeId
            ? { ...s, history: updatedHistory, title: title ?? s.title }
            : s
        )
        // Persist the updated session
        const session = updated.find((s) => s.id === activeId)
        if (session && session.history.length > 0) {
          window.nohi.saveSession(session)
        }
        return updated
      })
    },
    [activeId]
  )

  const deleteSession = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    await window.nohi.deleteSession(id)
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id)
      if (id === activeId) {
        if (next.length > 0) setActiveId(next[0].id)
        else {
          const fresh: NohiSession = {
            id: crypto.randomUUID(),
            title: 'New project',
            createdAt: new Date().toISOString(),
            history: [],
          }
          setSessions([fresh])
          setActiveId(fresh.id)
          return [fresh]
        }
      }
      return next
    })
  }

  const renameSession = (id: string, newTitle: string) => {
    const title = newTitle.trim() || 'New project'
    setSessions((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, title } : s))
      const session = updated.find((s) => s.id === id)
      if (session && session.history.length > 0) window.nohi.saveSession(session)
      return updated
    })
  }

  const exportSession = (s: NohiSession, e: React.MouseEvent) => {
    e.stopPropagation()
    const lines: string[] = [
      `# ${s.title}`,
      `> Created: ${new Date(s.createdAt).toLocaleString()}`,
      '',
    ]
    for (const msg of s.history) {
      lines.push(`**${msg.role === 'user' ? 'User' : 'Assistant'}:**`)
      lines.push(msg.content, '')
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${s.title.replace(/[^a-z0-9\u4e00-\u9fa5]/gi, '-').slice(0, 60)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const activeSession = sessions.find((s) => s.id === activeId)

  const archiveSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSessions((prev) => {
      const updated = prev.map((s) => s.id === id ? { ...s, archived: !s.archived } : s)
      const session = updated.find((s) => s.id === id)
      if (session) window.nohi.saveSession(session)
      return updated
    })
  }

  // Apply status + env filters
  const filteredSessions = sessions
    .filter((s) => {
      if (statusFilter === 'active') return !s.archived && s.history.length > 0
      if (statusFilter === 'archived') return s.archived === true
      return true // 'all'
    })
    .filter(() => envFilter === 'all' || envFilter === 'local')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const todaySessions = filteredSessions.filter((s) => isToday(s.createdAt))
  const weekSessions = filteredSessions.filter((s) => isThisWeek(s.createdAt))
  const olderSessions = filteredSessions.filter(
    (s) => !isToday(s.createdAt) && !isThisWeek(s.createdAt)
  )

  const renderSessionGroup = (label: string, group: NohiSession[]) =>
    group.length > 0 ? (
      <div className="session-group" key={label}>
        <div className="session-date-label">{label}</div>
        {group.map((s) => (
          <div
            key={s.id}
            className={`session-item-wrap ${s.id === activeId ? 'active' : ''}`}
            onMouseEnter={() => setHoveredSessionId(s.id)}
            onMouseLeave={() => setHoveredSessionId('')}
          >
            <button
              className="session-item"
              onClick={() => { setActiveId(s.id); setPage('chat') }}
            >
              {s.title}
            </button>
            {hoveredSessionId === s.id && (
              <div className="session-action-btns">
                <button
                  className="session-action-btn"
                  onClick={(e) => archiveSession(s.id, e)}
                  title={s.archived ? 'Unarchive project' : 'Archive project'}
                >
                  <IconArchive />
                </button>
                <button
                  className="session-action-btn"
                  onClick={(e) => exportSession(s, e)}
                  title="Export as Markdown"
                >
                  <IconExport />
                </button>
                <button
                  className="session-action-btn session-delete-btn"
                  onClick={(e) => deleteSession(s.id, e)}
                  title="Delete project"
                >
                  <IconTrash />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    ) : null

  return (
    <div className="app">
      <div className="app-body">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <button className="new-session-btn" onClick={newSession} disabled={!hasKey}>
            <IconPlus /> {t('New project')}
          </button>
        </div>

        <div className="sidebar-nav">
          <button
            className={`sidebar-nav-btn ${page === 'scheduled' ? 'active' : ''}`}
            onClick={() => setPage('scheduled')}
            disabled={!hasKey}
          >
            <IconSchedule /> {t('Scheduled')}
          </button>
          <button
            className={`sidebar-nav-btn ${page === 'customize' ? 'active' : ''}`}
            onClick={() => setPage('customize')}
          >
            <IconCustomize /> {t('Customize')}
          </button>
        </div>

        {/* ── Projects header + filter ── */}
        <div className="projects-header">
          <button className="projects-label-btn" onClick={() => setShowSearch(true)} disabled={!hasKey}>
            {t('All projects')}
            <IconChevronSmall />
          </button>
          <div className="projects-header-actions">
            <button
              className="projects-icon-btn"
              title="Search projects (⌘K)"
              onClick={() => setShowSearch(true)}
              disabled={!hasKey}
            >
              <IconSearch />
            </button>
            <button
              className={`projects-icon-btn ${showFilter ? 'active' : ''}`}
              title="Filter"
              onClick={() => setShowFilter((v) => !v)}
              disabled={!hasKey}
            >
              <IconFilter />
            </button>
          </div>
        </div>

        {/* ── Filter panel ── */}
        {showFilter && (
          <div className="projects-filter-panel">
            <div className="pf-col">
              <div className="pf-col-header">{t('Status')}</div>
              {([['active', t('Active')], ['archived', t('Archived')], ['all', t('All')]] as const).map(([v, label]) => (
                <button
                  key={v}
                  className={`pf-item ${statusFilter === v ? 'selected' : ''}`}
                  onClick={() => setStatusFilter(v)}
                >
                  <span>{label}</span>
                  {statusFilter === v && <IconCheckMark />}
                </button>
              ))}
            </div>
            <div className="pf-divider" />
            <div className="pf-col">
              <div className="pf-col-header">{t('Environment')}</div>
              {([['local', t('Local')], ['cloud', t('Cloud')], ['remote', t('Remote Control')], ['all', t('All')]] as const).map(([v, label]) => (
                <button
                  key={v}
                  className={`pf-item ${envFilter === v ? 'selected' : ''}`}
                  onClick={() => setEnvFilter(v)}
                >
                  <span>{label}</span>
                  {envFilter === v && <IconCheckMark />}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="session-list-area">
          {filteredSessions.length === 0 ? (
            <div className="session-empty">
              {statusFilter === 'active' ? t('No active projects yet') : statusFilter === 'archived' ? t('No archived projects') : t('No projects yet')}
            </div>
          ) : (
            <>
              {renderSessionGroup(t('Today'), todaySessions)}
              {renderSessionGroup(t('This Week'), weekSessions)}
              {renderSessionGroup(t('Older'), olderSessions)}
            </>
          )}
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-bottom-row">
            <div className="user-info-wrap">
              <div className="user-info" onClick={() => setShowUserMenu((v) => !v)}>
                <div className="user-avatar">{userName.charAt(0).toUpperCase()}</div>
                <div className="user-details">
                  {editingUserName ? (
                    <input
                      className="user-name-input"
                      value={userNameDraft}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => setUserNameDraft(e.target.value)}
                      onBlur={() => { saveUserName(userNameDraft); setEditingUserName(false) }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { saveUserName(userNameDraft); setEditingUserName(false) }
                        if (e.key === 'Escape') setEditingUserName(false)
                        e.stopPropagation()
                      }}
                    />
                  ) : (
                    <span
                      className="user-name"
                      onDoubleClick={(e) => { e.stopPropagation(); setUserNameDraft(userName); setEditingUserName(true) }}
                      title="Double-click to edit name"
                    >{userName}</span>
                  )}
                  <span className="user-plan">Free plan</span>
                </div>
              </div>
            </div>
            <div className="user-menu-wrap">
              {showUserMenu && (
                <UserMenuDropdown
                  provider={currentProvider}
                  model={currentModel}
                  userName={userName}
                  onClose={() => setShowUserMenu(false)}
                  onGoSettings={() => setPage('settings')}
                  onShowShortcuts={() => setShowAbout(true)}
                  onClearKey={clearApiKey}
                />
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="content">
        <div className="content-tabs">
          {page === 'chat' ? (
            editingTitle ? (
              <input
                className="project-title-input"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={() => { renameSession(activeId, titleDraft); setEditingTitle(false) }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { renameSession(activeId, titleDraft); setEditingTitle(false) }
                  if (e.key === 'Escape') setEditingTitle(false)
                }}
                autoFocus
              />
            ) : (
              <button
                className="project-title-btn"
                onClick={() => { setTitleDraft(activeSession?.title ?? 'New project'); setEditingTitle(true) }}
                title="Click to rename"
              >
                {activeSession?.title ?? 'New project'}
              </button>
            )
          ) : (
            <span className="page-title-label">
              {page === 'scheduled' ? t('Scheduled') : page === 'customize' ? t('Customize') : t('Settings')}
            </span>
          )}
        </div>

        <div className="content-body">
          {page === 'chat' && (
            <Chat
              key={activeId}
              initialHistory={activeSession?.history ?? []}
              onSessionUpdate={handleSessionUpdate}
              agentMode={agentMode}
              onModeChange={setMode}
              workDir={currentDir === '~/' ? undefined : currentDir}
              onSetWorkDir={setWorkDir}
            />
          )}
          {page === 'scheduled' && <Scheduled />}
          {page === 'customize' && <Customize workDir={currentDir} />}
          {page === 'settings' && <Settings onSaved={onSettingsSaved} />}
        </div>
      </main>
      </div>{/* end app-body */}

      {/* ── Status bar ── */}
      {hasKey && (
        <div className={`app-statusbar mode-${agentMode}`}>
          <div className="statusbar-left">
            <FolderPicker
              value={currentDir === '~/' ? undefined : currentDir}
              onChange={setWorkDir}
              placeholder={currentDir}
              className="fp-statusbar"
            />
          </div>
          <div className="statusbar-right">
            <button
              className="statusbar-mode-btn"
              onClick={async () => {
                const files = await window.nohi.readPlanFiles(currentDir)
                setPlanFiles(files)
                setActivePlanIdx(0)
                setShowPlanViewer(true)
              }}
              title="View current plan (.claude/plans/)"
            >
              <IconPlan /> {statusbarModeLabel(agentMode)}
            </button>
            <button
              className="statusbar-theme-btn"
              onClick={toggleTheme}
              title="Toggle theme"
            >
              <span className={`theme-icon ${theme === 'light' ? 'active' : ''}`}><IconSun /></span>
              <span className={`theme-icon ${theme === 'dark' ? 'active' : ''}`}><IconMoon /></span>
            </button>
            <div className="statusbar-info-wrap">
              <button
                className="statusbar-info-btn"
                onClick={() => setShowAbout((v) => !v)}
                title="About Nohi"
              >
                N <IconChevronSmall />
              </button>
              {showAbout && <AboutDropdown onClose={() => setShowAbout(false)} />}
            </div>
          </div>
        </div>
      )}

      {/* ── Update banner ── */}
      {updateDownloaded && (
        <div className="update-banner">
          {t('Update ready')} —{' '}
          <button className="update-banner-btn" onClick={() => window.nohi.installUpdate()}>
            {t('Restart & install')}
          </button>
          <button className="update-banner-dismiss" onClick={() => setUpdateDownloaded(false)}>✕</button>
        </div>
      )}

      {/* ── Plan Viewer ── */}
      {showPlanViewer && (
        <PlanViewer
          files={planFiles}
          activeIdx={activePlanIdx}
          onChangeIdx={setActivePlanIdx}
          onClose={() => setShowPlanViewer(false)}
          workDir={currentDir}
          onFilesChange={setPlanFiles}
        />
      )}

      {/* ── ⌘K Search Modal ── */}
      {showSearch && (
        <SearchModal
          sessions={sessions}
          onSelect={(id) => { setActiveId(id); setPage('chat') }}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  )
}
