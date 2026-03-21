import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import MessageBubble from '../components/MessageBubble'
import ToolCallBlock from '../components/ToolCallBlock'
import FolderPicker, { addRecentDir } from '../components/FolderPicker'
import ArtifactRail, { Artifact } from '../components/ArtifactRail'
import './Chat.css'

interface ChatItem {
  id: string
  kind: 'user' | 'assistant' | 'tool_call' | 'tool_result' | 'screenshot'
  text?: string
  toolName?: string
  toolInput?: unknown
  toolResult?: string
  streaming?: boolean
  imageBase64?: string
  pending?: boolean   // tool_call is executing (between call and result)
}

interface Props {
  initialHistory?: SessionMessage[]
  onSessionUpdate?: (history: SessionMessage[], title?: string) => void
  agentMode?: AgentMode
  onModeChange?: (mode: AgentMode) => void
  workDir?: string
  onSetWorkDir?: (dir: string) => void
}

// Reconstruct display items from persisted history
function historyToItems(history: SessionMessage[]): ChatItem[] {
  return history.map((msg) => ({
    id: crypto.randomUUID(),
    kind: msg.role === 'user' ? 'user' : 'assistant',
    text: msg.content,
  }))
}

// ── Model helpers ────────────────────────────────────────────────────────────

const MODELS_BY_PROVIDER: Record<string, string[]> = {
  anthropic: ['claude-sonnet-4-6', 'claude-haiku-4-5', 'claude-opus-4-5'],
  openai: ['gpt-4o', 'gpt-4o-mini'],
  google: ['gemini-2.0-flash', 'gemini-1.5-pro'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  'openai-compatible': [],
}

function shortModelName(model: string): string {
  if (!model) return '…'
  // claude-sonnet-4-6 → Sonnet 4.6
  const m = model.replace(/^claude-/, '').replace(/-(\d)/, ' $1')
  return m.charAt(0).toUpperCase() + m.slice(1)
}

// ── Agent mode config (mirrors Claude Code) ──────────────────────────────────

const IconPermAsk = () => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 1.5a3.5 3.5 0 011 6.85V10M7 12.5v.5"/>
  </svg>
)
const IconPermAuto = () => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 2L3 7.5h4L4.5 12 11 6.5H7L9.5 2z"/>
  </svg>
)
const IconPermPlan = () => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 1.5h5.5L11 4v8.5H3V1.5z"/>
    <path d="M8.5 1.5v3H11M5 6.5h4M5 9h2.5"/>
  </svg>
)
const IconPermBypass = () => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 2L1.5 12h11L7 2z"/>
    <path d="M7 6v3M7 10.5v.5"/>
  </svg>
)

const PERMISSION_MODES: {
  mode: AgentMode
  icon: React.ReactNode
  title: string
  desc: string
  disabled?: boolean
}[] = [
  { mode: 'ask',    icon: <IconPermAsk />,    title: 'Ask permissions',    desc: 'Always ask before making changes' },
  { mode: 'auto',   icon: <IconPermAuto />,   title: 'Auto accept edits',  desc: 'Automatically accept all file edits' },
  { mode: 'plan',   icon: <IconPermPlan />,   title: 'Plan mode',          desc: 'Create a plan before making changes' },
  { mode: 'bypass', icon: <IconPermBypass />, title: 'Bypass permissions', desc: 'Accepts all permissions', disabled: true },
]

function permModeLabel(mode: AgentMode): string {
  const m = PERMISSION_MODES.find((p) => p.mode === mode)
  return m ? m.title : 'Ask permissions'
}

// ── SVG Icons ────────────────────────────────────────────────────────────────

const IconStop = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
    <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    <rect x="5.5" y="5.5" width="5" height="5" rx="1"/>
  </svg>
)

const IconChevron = () => (
  <svg width="9" height="9" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 3.5L5 6.5l2.5-3"/>
  </svg>
)

const IconCheck = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 6l3 3 5-5"/>
  </svg>
)

const IconFolderOpen = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 4.5a1 1 0 011-1H5l1.5 1.5H11a1 1 0 011 1v1M1.5 7.5l1 4h9l1-4H1.5z"/>
  </svg>
)

const IconPlanFile = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 1.5h5.5L11 4v8.5H3V1.5z"/>
    <path d="M8.5 1.5v3H11M5 6.5h4M5 9h4M5 7.5h2"/>
  </svg>
)

const IconArtifacts = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3.5h10M2 7h10M2 10.5h6"/>
    <circle cx="11" cy="10.5" r="1.5" fill="currentColor" stroke="none"/>
  </svg>
)

// ── PermissionsDropdown ───────────────────────────────────────────────────────

function PermissionsDropdown({
  current,
  onSelect,
  onClose,
}: {
  current: AgentMode
  onSelect: (m: AgentMode) => void
  onClose: () => void
}) {
  const { t } = useTranslation()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div className="permissions-dropdown" ref={ref}>
      {PERMISSION_MODES.map((p) => (
        <button
          key={p.mode}
          className={`perm-item ${p.mode === current ? 'current' : ''} ${p.disabled ? 'disabled' : ''}`}
          onClick={() => { if (!p.disabled) { onSelect(p.mode); onClose() } }}
          disabled={p.disabled}
        >
          <span className="perm-item-icon">{p.icon}</span>
          <div className="perm-item-text">
            <span className="perm-item-title">{t(p.title)}</span>
            <span className="perm-item-desc">{p.desc}</span>
          </div>
          {p.mode === current && <span className="perm-item-check"><IconCheck /></span>}
        </button>
      ))}
    </div>
  )
}

// ── ModelDropdown ─────────────────────────────────────────────────────────────

function ModelDropdown({
  provider,
  current,
  onSelect,
  onClose,
}: {
  provider: string
  current: string
  onSelect: (m: string) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const models = MODELS_BY_PROVIDER[provider] ?? MODELS_BY_PROVIDER.anthropic

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  return (
    <div className="toolbar-dropdown model-dropdown" ref={ref}>
      <div className="toolbar-dropdown-header">{provider}</div>
      {models.map((m) => (
        <button
          key={m}
          className={`model-dropdown-item ${m === current ? 'active' : ''}`}
          onClick={() => onSelect(m)}
        >
          <span>{shortModelName(m)}</span>
          {m === current && <IconCheck />}
        </button>
      ))}
    </div>
  )
}

// ── Chat ──────────────────────────────────────────────────────────────────────

export default function Chat({ initialHistory = [], onSessionUpdate, agentMode = 'ask', onModeChange, workDir, onSetWorkDir }: Props) {
  const { t } = useTranslation()
  const [items, setItems] = useState<ChatItem[]>(() => historyToItems(initialHistory))
  const [history, setHistory] = useState<SessionMessage[]>(initialHistory)
  const [input, setInput] = useState('')
  const [running, setRunning] = useState(false)
  const [currentModel, setCurrentModel] = useState('')
  const [provider, setProvider] = useState<'anthropic' | 'openai' | 'google' | 'deepseek' | 'openai-compatible'>('anthropic')
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [showArtifacts, setShowArtifacts] = useState(false)
  const [showPermissionsMenu, setShowPermissionsMenu] = useState(false)
  const [showModelMenu, setShowModelMenu] = useState(false)
  const [waitingFirstToken, setWaitingFirstToken] = useState(false)
  const [streamElapsed, setStreamElapsed] = useState(0)
  const [streamPhase, setStreamPhase] = useState<'thinking' | 'writing' | 'running'>('thinking')
  const [planContent, setPlanContent] = useState<string>('')
  const [attachedFile, setAttachedFile] = useState<{ name: string; content: string } | null>(null)
  const streamStartRef = useRef<number | null>(null)
  const elapsedIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const unsubRef = useRef<(() => void) | null>(null)
  const firstMessageFiredRef = useRef(initialHistory.length > 0)

  useEffect(() => {
    window.nohi.getSettings().then((s) => {
      setCurrentModel(s.model)
      setProvider(s.provider)
    })
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [items])

  useEffect(() => {
    return () => { unsubRef.current?.() }
  }, [])

  // Stream elapsed timer
  useEffect(() => {
    if (running) {
      streamStartRef.current = Date.now()
      elapsedIntervalRef.current = setInterval(() => {
        setStreamElapsed(Math.floor((Date.now() - (streamStartRef.current ?? Date.now())) / 1000))
      }, 1000)
    } else {
      if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current)
      setStreamElapsed(0)
      setStreamPhase('thinking')
      streamStartRef.current = null
    }
    return () => { if (elapsedIntervalRef.current) clearInterval(elapsedIntervalRef.current) }
  }, [running])

  const stopAgent = () => {
    unsubRef.current?.()
    setRunning(false)
  }

  const switchModel = async (model: string) => {
    const s = await window.nohi.getSettings()
    await window.nohi.saveSettings({ ...s, model })
    setCurrentModel(model)
    setShowModelMenu(false)
  }

  const send = async () => {
    const text = input.trim()
    if ((!text && !attachedFile) || running) return

    setInput('')
    setAttachedFile(null)
    setRunning(true)
    setWaitingFirstToken(true)

    const userItem: ChatItem = {
      id: crypto.randomUUID(),
      kind: 'user',
      text,
    }
    setItems((prev) => [...prev, userItem])

    const fileBlock = attachedFile
      ? `\n\n<attached_file name="${attachedFile.name}">\n${attachedFile.content}\n</attached_file>`
      : ''
    const newHistory: SessionMessage[] = [
      ...history,
      { role: 'user', content: text + fileBlock },
    ]
    setHistory(newHistory)

    // First message → update session title
    const isFirst = !firstMessageFiredRef.current
    if (isFirst) {
      firstMessageFiredRef.current = true
      onSessionUpdate?.(newHistory, text.slice(0, 42))
    }

    let currentAssistantId: string | null = null
    let assistantText = ''

    unsubRef.current?.()  // unsubscribe any previous listener before registering a new one
    unsubRef.current = window.nohi.onAgentChunk((raw) => {
      const chunk = raw as {
        type: string
        text?: string
        toolName?: string
        toolInput?: unknown
        toolResult?: string
      }

      if (chunk.type === 'text') {
        setWaitingFirstToken(false)
        setStreamPhase('writing')
        if (!currentAssistantId) {
          currentAssistantId = crypto.randomUUID()
          setItems((prev) => [
            ...prev,
            { id: currentAssistantId!, kind: 'assistant', text: chunk.text, streaming: true },
          ])
        } else {
          setItems((prev) =>
            prev.map((item) =>
              item.id === currentAssistantId
                ? { ...item, text: (item.text || '') + (chunk.text || '') }
                : item
            )
          )
        }
        assistantText += chunk.text || ''
      }

      if (chunk.type === 'tool_call') {
        currentAssistantId = null
        setStreamPhase('running')
        const itemId = crypto.randomUUID()
        setItems((prev) => [
          ...prev,
          {
            id: itemId,
            kind: 'tool_call',
            toolName: chunk.toolName,
            toolInput: chunk.toolInput,
            pending: true,
          },
        ])
        // Track write_file calls as artifacts
        if (chunk.toolName === 'write_file' && chunk.toolInput) {
          const inp = chunk.toolInput as { path?: string; content?: string }
          if (inp.path) {
            const filePath = inp.path
            const fileName = filePath.split('/').pop() ?? filePath
            const dotIdx = fileName.lastIndexOf('.')
            const ext = dotIdx >= 0 ? fileName.slice(dotIdx + 1) : ''
            const name = dotIdx >= 0 ? fileName.slice(0, dotIdx) : fileName
            setArtifacts((prev) => {
              const existing = prev.findIndex((a) => a.path === filePath)
              const artifact: Artifact = { id: itemId, path: filePath, name, ext, content: inp.content }
              if (existing >= 0) {
                const updated = [...prev]
                updated[existing] = artifact
                return updated
              }
              return [...prev, artifact]
            })
            setShowArtifacts(true)
          }
        }
      }

      if (chunk.type === 'tool_result') {
        setStreamPhase('writing')
        const isScreenshotResult =
          chunk.toolName === 'browser_screenshot' &&
          typeof chunk.toolResult === 'string' &&
          chunk.toolResult.length > 200

        if (isScreenshotResult) {
          // Mark pending tool_call done, then append screenshot
          setItems((prev) => {
            let foundIdx = -1
            for (let i = prev.length - 1; i >= 0; i--) {
              if (prev[i].kind === 'tool_call' && prev[i].toolName === chunk.toolName && prev[i].pending) {
                foundIdx = i; break
              }
            }
            const updated = foundIdx >= 0
              ? prev.map((item, i) => i === foundIdx ? { ...item, pending: false } : item)
              : prev
            return [
              ...updated,
              {
                id: crypto.randomUUID(),
                kind: 'screenshot' as const,
                toolName: chunk.toolName,
                imageBase64: chunk.toolResult,
              },
            ]
          })
        } else {
          // Merge result into the pending tool_call item
          setItems((prev) => {
            let foundIdx = -1
            for (let i = prev.length - 1; i >= 0; i--) {
              if (prev[i].kind === 'tool_call' && prev[i].toolName === chunk.toolName && prev[i].pending) {
                foundIdx = i; break
              }
            }
            if (foundIdx >= 0) {
              return prev.map((item, i) =>
                i === foundIdx ? { ...item, pending: false, toolResult: chunk.toolResult } : item
              )
            }
            // Fallback: no matching pending item found, push standalone
            return [
              ...prev,
              {
                id: crypto.randomUUID(),
                kind: 'tool_call' as const,
                toolName: chunk.toolName,
                toolResult: chunk.toolResult,
                pending: false,
              },
            ]
          })
        }
      }

      if (chunk.type === 'done') {
        setWaitingFirstToken(false)
        setItems((prev) =>
          prev.map((item) =>
            item.id === currentAssistantId ? { ...item, streaming: false } : item
          )
        )
        const finalHistory: SessionMessage[] = assistantText
          ? [...newHistory, { role: 'assistant', content: assistantText }]
          : newHistory
        setHistory(finalHistory)
        onSessionUpdate?.(finalHistory)
        // In plan mode, capture the response as the plan document
        if (agentMode === 'plan' && assistantText) {
          setPlanContent(assistantText)
        }
        setRunning(false)
        unsubRef.current?.()
        inputRef.current?.focus()
      }

      if (chunk.type === 'error') {
        setWaitingFirstToken(false)
        setItems((prev) => [
          ...prev,
          { id: crypto.randomUUID(), kind: 'assistant', text: `Error: ${chunk.text}` },
        ])
        setRunning(false)
        unsubRef.current?.()
      }
    })

    await window.nohi.runAgent(newHistory, agentMode, workDir)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 180) + 'px'
  }

  const showPlanPanel = agentMode === 'plan' && planContent !== ''
  const showArtifactRail = showArtifacts && artifacts.length > 0

  return (
    <div className={`chat${showPlanPanel ? ' chat-plan-split' : ''}${showArtifactRail ? ' chat-artifact-split' : ''}`}>
    <div className="chat-main">
      <div className="messages">
        {items.length === 0 && (
          <div className="empty-state">
            <h2>{t('Ready to sell smarter.')}</h2>
            <p>Ask about your orders, customers, or inventory. Nohi can run tasks, draft emails, and surface insights — 24/7.</p>

            {/* Working directory for this project */}
            <FolderPicker
              value={workDir}
              onChange={(dir) => { addRecentDir(dir); onSetWorkDir?.(dir) }}
              placeholder={t('Select working folder…')}
            />
          </div>
        )}

        {items.map((item) => {
          if (item.kind === 'user' || item.kind === 'assistant') {
            return (
              <MessageBubble
                key={item.id}
                role={item.kind}
                text={item.text || ''}
                streaming={item.streaming}
              />
            )
          }
          if (item.kind === 'screenshot') {
            return (
              <div key={item.id} className="screenshot-item">
                  <img
                  src={`data:image/png;base64,${item.imageBase64}`}
                  alt="Browser screenshot"
                  className="screenshot-img"
                />
              </div>
            )
          }
          if ((item.kind === 'tool_call' || item.kind === 'tool_result') && !(item.toolName === 'browser_screenshot' && !item.pending)) {
            return (
              <ToolCallBlock
                key={item.id}
                toolName={item.toolName || ''}
                toolInput={item.toolInput}
                toolResult={item.toolResult}
                pending={item.pending}
              />
            )
          }
          return null
        })}
        {/* Thinking indicator: pulsing dots while waiting for first token */}
        {waitingFirstToken && (
          <div className="thinking-indicator">
            <div className="thinking-avatar">N</div>
            <div className="thinking-dots">
              <span /><span /><span />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* ── Input area ── */}
      <div className="input-area">
      <div className="input-card">
        {/* Row 1: textarea + send/stop */}
        <div className="input-row">
          <button
            className="attach-btn"
            title="Attach file"
            disabled={running}
            onClick={async () => {
              const file = await window.nohi.openFileDialog()
              if (file) setAttachedFile(file)
            }}
          >+</button>
          <div className="input-col">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder={items.length > 0 ? t('Reply…') : t('Ask Nohi about your store…')}
              value={input}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={running}
            />
          </div>
          {attachedFile && (
            <div className="attached-file-badge">
              <span className="attached-file-name">{attachedFile.name}</span>
              <button className="attached-file-remove" onClick={() => setAttachedFile(null)}>×</button>
            </div>
          )}
          {running ? (
            <button className="stop-btn" onClick={stopAgent} title="Stop generation">
              <IconStop />
            </button>
          ) : input.trim() ? (
            <button className="send-btn" onClick={send}>
              ↑
            </button>
          ) : null}
        </div>

        {/* Row 2: Claude Code-style toolbar */}
        <div className="input-toolbar">
          <div className="toolbar-left">
            {/* Artifacts toggle */}
            {artifacts.length > 0 && (
              <button
                className={`toolbar-btn artifacts-btn ${showArtifacts ? 'active' : ''}`}
                onClick={() => setShowArtifacts((v) => !v)}
                title="Toggle artifacts"
              >
                <IconArtifacts />
                <span>{artifacts.length}</span>
              </button>
            )}
            {/* Permissions / mode selector */}
            <div className="permissions-btn-wrap">
              <button
                className={`toolbar-btn permissions-btn ${showPermissionsMenu ? 'active' : ''}`}
                onClick={() => { setShowPermissionsMenu((v) => !v); setShowModelMenu(false) }}
              >
                <span className="permissions-btn-icon">
                  {PERMISSION_MODES.find((p) => p.mode === agentMode)?.icon}
                </span>
                <span>{t(permModeLabel(agentMode))}</span>
                <IconChevron />
              </button>
              {showPermissionsMenu && (
                <PermissionsDropdown
                  current={agentMode}
                  onSelect={(m) => onModeChange?.(m)}
                  onClose={() => setShowPermissionsMenu(false)}
                />
              )}
            </div>
          </div>

          <div className="toolbar-right">
            {/* Stream stats */}
            {running && (
              <span className="stream-stats">
                {streamElapsed}s · {streamPhase === 'running' ? 'using tools' : streamPhase === 'writing' ? 'writing' : 'thinking'}
              </span>
            )}

            {/* Model selector */}
            <div className="model-selector-wrap">
              <button
                className={`toolbar-btn model-btn ${showModelMenu ? 'active' : ''}`}
                onClick={() => { setShowModelMenu((v) => !v); setShowPermissionsMenu(false) }}
              >
                <span>{shortModelName(currentModel)}</span>
                <IconChevron />
              </button>
              {showModelMenu && (
                <ModelDropdown
                  provider={provider}
                  current={currentModel}
                  onSelect={switchModel}
                  onClose={() => setShowModelMenu(false)}
                />
              )}
            </div>

          </div>
        </div>
      </div>{/* end input-card */}
      </div>
    </div>{/* end chat-main */}

    {/* ── Artifact Rail ── */}
    {showArtifactRail && (
      <ArtifactRail
        artifacts={artifacts}
        onClose={() => setShowArtifacts(false)}
      />
    )}

    {/* ── Plan panel (shown in plan mode after first run) ── */}
    {showPlanPanel && (
      <div className="plan-panel">
        <div className="plan-panel-header">
          <IconPlanFile />
          <span className="plan-filename">plan.md</span>
          <button
            className="plan-close-btn"
            onClick={() => setPlanContent('')}
            title="Close plan"
          >
            ×
          </button>
        </div>
        <div className="plan-panel-body">
          <pre className="plan-content">{planContent}</pre>
        </div>
      </div>
    )}
    </div>
  )
}
