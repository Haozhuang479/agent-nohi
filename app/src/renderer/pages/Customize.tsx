import React, { useState, useEffect } from 'react'
import './Customize.css'

// ─── Icons ────────────────────────────────────────────────────────────────────

const IconFolder = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1.5 4.5A1 1 0 012.5 3.5h3.586a1 1 0 01.707.293L7.5 5h6a1 1 0 011 1v6.5a1 1 0 01-1 1h-11a1 1 0 01-1-1V4.5z"/>
  </svg>
)

const IconFile = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2.5" y="1.5" width="11" height="13" rx="1.5"/>
    <path d="M5.5 5.5h5M5.5 8h5M5.5 10.5h3"/>
  </svg>
)

const IconSkillsNav = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1"/>
    <rect x="9" y="1.5" width="5.5" height="5.5" rx="1"/>
    <rect x="1.5" y="9" width="5.5" height="5.5" rx="1"/>
    <rect x="9" y="9" width="5.5" height="5.5" rx="1"/>
  </svg>
)

const IconConnectors = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="4" cy="8" r="2"/>
    <circle cx="12" cy="4" r="2"/>
    <circle cx="12" cy="12" r="2"/>
    <path d="M6 8h2.5M8.5 4.8L6.2 7.2M8.5 11.2L6.2 8.8"/>
  </svg>
)

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="6.5" cy="6.5" r="4"/>
    <path d="M11 11l3 3"/>
  </svg>
)

const IconPlus = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M7 1v12M1 7h12"/>
  </svg>
)

const IconInfo = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="8" cy="8" r="6.5"/>
    <path d="M8 7.5v4M8 5.5v.5"/>
  </svg>
)

const IconCheck = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7l3 3 6-6"/>
  </svg>
)

// Toolbox icon for landing page
const IconToolbox = () => (
  <svg viewBox="0 0 80 80" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="cdetail-landing-icon">
    <rect x="10" y="32" width="60" height="38" rx="5"/>
    <path d="M26 32V22a14 14 0 0128 0v10"/>
    <path d="M10 50h60"/>
    <rect x="30" y="44" width="20" height="12" rx="2"/>
  </svg>
)

const IconConnectTools = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="6" width="6" height="6" rx="1.5"/>
    <rect x="13" y="3" width="6" height="6" rx="1.5"/>
    <rect x="13" y="11" width="6" height="6" rx="1.5"/>
    <path d="M7 9h3.5M10.5 6l2.5 3-2.5 3"/>
  </svg>
)

const IconCreateSkills = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="7" height="7" rx="1.5"/>
    <rect x="11" y="2" width="7" height="7" rx="1.5"/>
    <rect x="2" y="11" width="7" height="7" rx="1.5"/>
    <path d="M14.5 11.5v6M11.5 14.5h6"/>
  </svg>
)

const IconBrowsePlugins = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="16" height="12" rx="2"/>
    <path d="M6 5V4a2 2 0 014 0v1M10 5V4a2 2 0 014 0v1"/>
    <path d="M6 11h8M6 14h5"/>
  </svg>
)

// ─── Connector Definitions ────────────────────────────────────────────────────

interface ConnectorField {
  key: string
  label: string
  placeholder: string
  type: 'text' | 'password' | 'textarea' | 'url'
  hint?: string
  hintUrl?: string
  hintLabel?: string
}

interface ConnectorDef {
  id: string
  name: string
  group: string
  color: string
  initials: string
  description: string
  fields: ConnectorField[]
  badge?: string
  isMcp?: boolean
  mcpCommand?: string
  mcpArgs?: string[]
}

const CONNECTOR_DEFS: ConnectorDef[] = [
  {
    id: 'saleor',
    name: 'Saleor',
    group: 'E-commerce',
    color: '#2c2c54',
    initials: 'SL',
    description: 'Connect your Saleor GraphQL storefront to manage products, orders, and customers directly from Nohi.',
    fields: [
      { key: 'url', label: 'API URL', placeholder: 'https://your-store.saleor.cloud/graphql/', type: 'url',
        hint: 'Find it in your Saleor Dashboard → API', hintUrl: 'https://docs.saleor.io/api-reference', hintLabel: 'Saleor API docs' },
      { key: 'token', label: 'Auth Token', placeholder: 'your-api-token', type: 'password',
        hint: 'Create a token in Dashboard → Settings → Staff Members' },
    ],
  },
  {
    id: 'shopify',
    name: 'Shopify',
    group: 'E-commerce',
    color: '#96bf48',
    initials: 'SH',
    description: 'Connect to Shopify Storefront API to browse products, check inventory, and manage the cart/checkout flow. Install the Headless channel in your Shopify Admin to get a Storefront access token.',
    fields: [
      { key: 'domain', label: 'Store Domain', placeholder: 'mystore.myshopify.com', type: 'text',
        hint: 'Your Shopify store URL (without https://)' },
      { key: 'storefront_token', label: 'Storefront Access Token', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', type: 'password',
        hint: 'Get this from Shopify Admin → Sales channels → Headless → Create storefront', hintUrl: 'https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/getting-started', hintLabel: 'Storefront API guide' },
    ],
  },
  {
    id: 'stripe',
    name: 'Stripe',
    group: 'Payments',
    color: '#635bff',
    initials: 'ST',
    description: 'Connect Stripe to manage payments, customers, subscriptions, and financial reports.',
    fields: [
      { key: 'secret_key', label: 'Secret Key', placeholder: 'sk_live_xxxxxxxx or sk_test_xxxxxxxx', type: 'password',
        hint: 'Find your API keys in the Stripe Dashboard', hintUrl: 'https://dashboard.stripe.com/apikeys', hintLabel: 'Stripe API keys' },
    ],
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    group: 'Analytics',
    color: '#f9ab00',
    initials: 'GA',
    description: 'Connect Google Analytics (GA4) to query traffic, conversion, and engagement data via MCP (mcp-google-analytics).',
    fields: [
      { key: 'property_id', label: 'GA4 Property ID', placeholder: '123456789', type: 'text',
        hint: 'Find it in GA4 Admin → Property Settings', hintUrl: 'https://support.google.com/analytics/answer/10447272', hintLabel: 'Find Property ID' },
      { key: 'credentials_json', label: 'Service Account JSON', placeholder: '{\n  "type": "service_account",\n  "project_id": "...",\n  ...\n}', type: 'textarea',
        hint: 'Create a service account in Google Cloud Console and download the JSON key', hintUrl: 'https://cloud.google.com/iam/docs/service-accounts-create', hintLabel: 'Create service account' },
    ],
    isMcp: true,
    mcpCommand: 'npx',
    mcpArgs: ['-y', 'mcp-google-analytics'],
  },
  {
    id: 'google_workspace',
    name: 'Google Workspace',
    group: 'Productivity',
    color: '#4285f4',
    initials: 'GW',
    description: 'Connect Google Workspace to manage Gmail, Calendar, Drive, and Docs via service account.',
    fields: [
      { key: 'credentials_json', label: 'Service Account JSON', placeholder: '{\n  "type": "service_account",\n  "project_id": "...",\n  ...\n}', type: 'textarea',
        hint: 'Create a service account with domain-wide delegation in Google Admin Console', hintUrl: 'https://developers.google.com/workspace/guides/create-credentials', hintLabel: 'Create credentials' },
    ],
  },
  {
    id: 'feishu',
    name: 'Feishu / Lark',
    group: 'Productivity',
    color: '#3370ff',
    initials: 'FS',
    description: 'Connect Feishu (Lark) to send messages, manage documents, bots, and team workflows.',
    fields: [
      { key: 'app_id', label: 'App ID', placeholder: 'cli_xxxxxxxxxxxxxxxx', type: 'text',
        hint: 'Find in Feishu Open Platform → App Credentials', hintUrl: 'https://open.feishu.cn/app', hintLabel: 'Feishu Open Platform' },
      { key: 'app_secret', label: 'App Secret', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', type: 'password',
        hint: 'Found in the same App Credentials page' },
    ],
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    group: 'Marketing',
    color: '#222222',
    initials: 'KL',
    description: 'Connect Klaviyo to manage email flows, segments, campaigns, and customer profiles.',
    fields: [
      { key: 'api_key', label: 'Private API Key', placeholder: 'pk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', type: 'password',
        hint: 'Create a Private API Key in your Klaviyo Account Settings', hintUrl: 'https://www.klaviyo.com/settings/account/api-keys', hintLabel: 'Klaviyo API keys' },
    ],
  },
]

// Legacy / desktop connectors (non-commerce)
const LEGACY_CONNECTOR_GROUPS: Record<string, { id: string; name: string; badge?: string; color: string; initials: string }[]> = {
  Web: [
    { id: 'github', name: 'GitHub', color: '#24292e', initials: 'GH' },
  ],
  Desktop: [
    { id: 'chrome', name: 'Claude in Chrome', badge: 'INCLUDED', color: '#ea4335', initials: 'CC' },
  ],
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const EXAMPLE_SKILLS = [
  'skill-creator',
  'algorithmic-art',
  'brand-guidelines',
  'canvas-design',
  'doc-coauthoring',
  'internal-comms',
  'mcp-builder',
  'slack-gif-creator',
  'theme-factory',
  'web-artifacts-builder',
]

// ─── Component ────────────────────────────────────────────────────────────────

interface CustomizeProps {
  workDir?: string
}

type TestState = 'idle' | 'testing' | 'ok' | 'error'

export default function Customize({ workDir }: CustomizeProps) {
  const [subPage, setSubPage] = useState<'skills' | 'connectors' | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [selectedConnectorId, setSelectedConnectorId] = useState<string | null>(null)
  const [customSkills, setCustomSkills] = useState<CustomSkill[]>([])
  const [enabledSkills, setEnabledSkills] = useState<string[]>([])
  const [connections, setConnections] = useState<Record<string, string>>({})
  const [listSearch, setListSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  // Multi-field draft state per connector
  const [draftFields, setDraftFields] = useState<Record<string, string>>({})
  const [testState, setTestState] = useState<TestState>('idle')
  const [testMessage, setTestMessage] = useState('')

  // GitHub legacy connector state
  const [connectingGh, setConnectingGh] = useState(false)
  const [ghDraft, setGhDraft] = useState('')

  useEffect(() => {
    window.nohi.getCustomSkills().then(setCustomSkills).catch(() => {})
    window.nohi.getSettings().then((s) => {
      setEnabledSkills(s.enabledSkills ?? [])
      setConnections(s.connections ?? {})
    }).catch(() => {})
  }, [])

  // Reset draft when connector changes
  useEffect(() => {
    if (!selectedConnectorId) return
    setDraftFields({})
    setTestState('idle')
    setTestMessage('')
    setConnectingGh(false)
    setGhDraft('')
  }, [selectedConnectorId])

  const isSkillEnabled = (name: string) => {
    return enabledSkills.length === 0 || enabledSkills.includes(name)
  }

  const toggleSkill = async (name: string) => {
    const allNames = [
      ...customSkills.map((s) => s.name),
      ...EXAMPLE_SKILLS,
    ]
    let next: string[]
    if (enabledSkills.length === 0) {
      next = allNames.filter((n) => n !== name)
    } else if (enabledSkills.includes(name)) {
      next = enabledSkills.filter((n) => n !== name)
    } else {
      next = [...enabledSkills, name]
    }
    setEnabledSkills(next)
    const s = await window.nohi.getSettings()
    await window.nohi.saveSettings({ ...s, enabledSkills: next }).catch(() => {})
  }

  const saveConnection = async (id: string, value: string, mcpEntry?: { name: string; command: string; args?: string[]; env?: Record<string, string> }) => {
    const s = await window.nohi.getSettings()
    const nextConns = { ...(s.connections ?? {}), [id]: value }
    let nextMcp = s.mcpServers ?? []
    if (mcpEntry) {
      nextMcp = nextMcp.filter((m) => m.name !== mcpEntry.name)
      nextMcp.push(mcpEntry)
    }
    await window.nohi.saveSettings({ ...s, connections: nextConns, mcpServers: nextMcp })
    setConnections(nextConns)
  }

  const removeConnection = async (id: string, mcpName?: string) => {
    const s = await window.nohi.getSettings()
    const nextConns = { ...(s.connections ?? {}) }
    delete nextConns[id]
    let nextMcp = s.mcpServers ?? []
    if (mcpName) nextMcp = nextMcp.filter((m) => m.name !== mcpName)
    await window.nohi.saveSettings({ ...s, connections: nextConns, mcpServers: nextMcp })
    setConnections(nextConns)
  }

  const isConnected = (id: string) => !!connections[id]

  const folderName = workDir ? workDir.split('/').filter(Boolean).pop() ?? workDir : 'Downloads'

  const handleSelectSubPage = (p: 'skills' | 'connectors') => {
    setSubPage(p)
    setSelectedSkill(null)
    setSelectedConnectorId(null)
    setListSearch('')
    setShowSearch(false)
  }

  // ── Connector test & save ─────────────────────────────────────────────────

  const handleTestAndConnect = async (def: ConnectorDef) => {
    setTestState('testing')
    setTestMessage('')

    try {
      // For GA/Workspace: write credentials file first
      let credsForTest = { ...draftFields }
      let savedCredPath: string | null = null

      if ((def.id === 'google_analytics' || def.id === 'google_workspace') && draftFields.credentials_json) {
        const filename = `${def.id}.json`
        savedCredPath = await window.nohi.writeCredentialsFile(filename, draftFields.credentials_json)
        if (!savedCredPath) {
          setTestState('error')
          setTestMessage('Failed to save credentials file — check disk permissions')
          return
        }
        credsForTest = { ...credsForTest, credentials_path: savedCredPath }
      }

      const result = await window.nohi.testConnection(def.id, credsForTest)

      if (!result.ok) {
        setTestState('error')
        setTestMessage(result.error ?? 'Connection failed')
        return
      }

      // Build the connection value (store all creds as JSON)
      const connValue: Record<string, string> = { ...credsForTest }
      if (savedCredPath) connValue.credentials_path = savedCredPath

      // Build MCP entry if needed (only google_analytics currently uses MCP)
      let mcpEntry: { name: string; command: string; args?: string[]; env?: Record<string, string> } | undefined
      if (def.isMcp && def.mcpCommand) {
        const env: Record<string, string> = {}
        if (def.id === 'google_analytics') {
          if (savedCredPath) env.GA_SERVICE_ACCOUNT_JSON = savedCredPath
          env.GA_PROPERTY_ID = draftFields.property_id ?? ''
        }
        mcpEntry = {
          name: def.name,
          command: def.mcpCommand,
          args: def.mcpArgs ?? [],
          env,
        }
      }

      await saveConnection(def.id, JSON.stringify(connValue), mcpEntry)
      setTestState('ok')
      setTestMessage('Connected successfully')
    } catch (e) {
      setTestState('error')
      setTestMessage(String(e))
    }
  }

  // ── Right detail content ──────────────────────────────────────────────────

  const renderConnectorDetail = () => {
    const def = CONNECTOR_DEFS.find((d) => d.id === selectedConnectorId)
    if (!def) return null

    const connected = isConnected(def.id)
    let existingCreds: Record<string, string> = {}
    try { existingCreds = JSON.parse(connections[def.id] ?? '{}') } catch {}

    if (connected) {
      return (
        <div className="cdetail-connector-detail">
          <div className="cdetail-connector-hdr">
            <div className="cdetail-connector-logo" style={{ background: def.color }}>
              {def.initials}
            </div>
            <span className="cdetail-connector-name">{def.name}</span>
            {def.isMcp && <span className="cdetail-badge-mcp">MCP</span>}
          </div>
          <div className="cdetail-connected-status">
            <span className="cdetail-connected-check"><IconCheck /></span>
            <span>Connected</span>
          </div>
          <p className="cdetail-connected-msg">{def.description}</p>
          {def.fields.some((f) => f.key !== 'credentials_json' && existingCreds[f.key]) && (
            <div className="cdetail-creds-summary">
              {def.fields
                .filter((f) => f.key !== 'credentials_json' && f.type !== 'password' && existingCreds[f.key])
                .map((f) => (
                  <div key={f.key} className="cdetail-cred-row">
                    <span className="cdetail-cred-label">{f.label}</span>
                    <span className="cdetail-cred-value">{existingCreds[f.key]}</span>
                  </div>
                ))}
            </div>
          )}
          <button
            className="cdetail-connector-btn-danger"
            onClick={() => removeConnection(def.id, def.isMcp ? def.name : undefined)}
          >
            Disconnect
          </button>
        </div>
      )
    }

    const canSubmit = def.fields.every((f) => (draftFields[f.key] ?? '').trim().length > 0)

    return (
      <div className="cdetail-connector-detail">
        <div className="cdetail-connector-hdr">
          <div className="cdetail-connector-logo" style={{ background: def.color }}>
            {def.initials}
          </div>
          <span className="cdetail-connector-name">{def.name}</span>
          {def.isMcp && <span className="cdetail-badge-mcp">MCP</span>}
        </div>
        <p className="cdetail-connector-desc">{def.description}</p>

        <div className="cdetail-token-form">
          {def.fields.map((field) => (
            <div key={field.key} className="cdetail-field-group">
              <label className="cdetail-field-label">{field.label}</label>
              {field.type === 'textarea' ? (
                <textarea
                  className="cdetail-field-textarea"
                  placeholder={field.placeholder}
                  value={draftFields[field.key] ?? ''}
                  onChange={(e) => setDraftFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  rows={5}
                  spellCheck={false}
                />
              ) : (
                <input
                  className="cdetail-token-input"
                  type={field.type === 'password' ? 'password' : 'text'}
                  placeholder={field.placeholder}
                  value={draftFields[field.key] ?? ''}
                  onChange={(e) => setDraftFields((prev) => ({ ...prev, [field.key]: e.target.value }))}
                  autoComplete="off"
                />
              )}
              {field.hint && (
                <p className="cdetail-token-hint">
                  {field.hint}
                  {field.hintUrl && (
                    <> — <button className="cdetail-link-btn" onClick={() => window.nohi.openExternal(field.hintUrl!)}>{field.hintLabel ?? 'Learn more'} ↗</button></>
                  )}
                </p>
              )}
            </div>
          ))}

          {testState === 'error' && (
            <div className="cdetail-test-error">{testMessage}</div>
          )}
          {testState === 'ok' && (
            <div className="cdetail-test-ok">{testMessage}</div>
          )}

          <div className="cdetail-token-actions">
            <button
              className="cdetail-connector-btn"
              disabled={!canSubmit || testState === 'testing'}
              onClick={() => handleTestAndConnect(def)}
            >
              {testState === 'testing' ? 'Testing…' : 'Test & Connect'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderDetail = () => {
    if (subPage === 'skills' && selectedSkill) {
      const isCustom = customSkills.some((s) => s.name === selectedSkill)
      const custom = customSkills.find((s) => s.name === selectedSkill)
      const enabled = isSkillEnabled(selectedSkill)
      return (
        <div className="cdetail-skill-body">
          <div className="cdetail-skill-header">
            <span className="cdetail-skill-name">{selectedSkill}</span>
            <button
              className={`cdetail-toggle ${enabled ? 'on' : 'off'}`}
              title={enabled ? 'Enabled — click to disable' : 'Disabled — click to enable'}
              onClick={() => toggleSkill(selectedSkill)}
            />
            <button className="cdetail-menu-btn" title="More options">···</button>
          </div>
          <div className="cdetail-meta-grid">
            <div className="cdetail-meta-cell">
              <span className="cdetail-meta-label">Added by</span>
              <span className="cdetail-meta-value">{isCustom ? 'You' : 'Anthropic'}</span>
            </div>
            <div className="cdetail-meta-cell">
              <span className="cdetail-meta-label">Invoked by</span>
              <span className="cdetail-meta-value">User or Claude</span>
            </div>
          </div>
          <div className="cdetail-section">
            <div className="cdetail-section-label">
              Description <IconInfo />
            </div>
            <div className="cdetail-content-card">
              {custom?.description
                ? custom.description
                : `name: ${selectedSkill} description: This skill provides specialized capabilities for ${selectedSkill.replace(/-/g, ' ')}. Use this when users request tasks related to this skill's domain.`}
            </div>
          </div>
        </div>
      )
    }

    if (subPage === 'connectors' && selectedConnectorId) {
      // Commerce / platform connectors
      const def = CONNECTOR_DEFS.find((d) => d.id === selectedConnectorId)
      if (def) return renderConnectorDetail()

      // Chrome connector (built-in)
      if (selectedConnectorId === 'chrome') {
        return (
          <div className="cdetail-chrome-guide">
            <div className="cdetail-connector-hdr">
              <div className="cdetail-connector-logo" style={{ background: '#ea4335' }}>CC</div>
              <span className="cdetail-connector-name">Claude in Chrome</span>
              <span className="cdetail-badge-included">INCLUDED</span>
            </div>
            <p className="cdetail-guide-desc">
              Claude in Chrome lets Nohi read and interact with your browser. It's built in — just enable it in Settings.
            </p>
            <ol className="cdetail-guide-steps">
              <li>Open <strong>Settings → Advanced</strong> and toggle <strong>Browser control</strong> on</li>
              <li>Restart Nohi if prompted</li>
              <li>In your next chat, ask Nohi to "open Chrome and search for…"</li>
            </ol>
            <button className="cdetail-connector-btn" onClick={() => window.nohi.openExternal('https://nohi.so/docs#chrome')}>
              View docs ↗
            </button>
          </div>
        )
      }

      // GitHub connector
      if (selectedConnectorId === 'github') {
        const connected = isConnected('github')
        return (
          <div className="cdetail-connector-detail">
            <div className="cdetail-connector-hdr">
              <div className="cdetail-connector-logo" style={{ background: '#24292e' }}>GH</div>
              <span className="cdetail-connector-name">GitHub</span>
              {connected && (
                <button className="cdetail-connector-btn-danger" onClick={() => removeConnection('github')}>Disconnect</button>
              )}
            </div>
            {connected ? (
              <p className="cdetail-connected-msg">✓ Connected — Nohi can access GitHub on your behalf.</p>
            ) : connectingGh ? (
              <div className="cdetail-token-form">
                <p className="cdetail-token-label">Paste your GitHub Personal Access Token:</p>
                <input className="cdetail-token-input" type="password" placeholder="ghp_xxxxxxxxxxxx" value={ghDraft} onChange={(e) => setGhDraft(e.target.value)} />
                <p className="cdetail-token-hint">
                  Create one at <button className="cdetail-link-btn" onClick={() => window.nohi.openExternal('https://github.com/settings/tokens')}>github.com/settings/tokens</button> with <code>repo</code> scope.
                </p>
                <div className="cdetail-token-actions">
                  <button className="cdetail-connector-btn" onClick={async () => {
                    if (ghDraft.trim()) { await saveConnection('github', ghDraft.trim()); setConnectingGh(false); setGhDraft('') }
                  }}>Save token</button>
                  <button className="cdetail-connector-btn-ghost" onClick={() => { setConnectingGh(false); setGhDraft('') }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button className="cdetail-connector-btn" onClick={() => setConnectingGh(true)}>Connect</button>
            )}
          </div>
        )
      }

      return (
        <div className="cdetail-connector-detail">
          <div className="cdetail-connector-hdr">
            <div className="cdetail-connector-logo" style={{ background: '#4285f4' }}>??</div>
            <span className="cdetail-connector-name">Coming soon</span>
          </div>
          <p className="cdetail-coming-soon">OAuth integration coming soon.</p>
        </div>
      )
    }

    // Landing
    return (
      <div className="cdetail-landing">
        <IconToolbox />
        <p className="cdetail-landing-tagline">
          Customize and manage the context and tools you are giving Claude.
        </p>
        <div className="cdetail-cta-list">
          <button className="cdetail-cta-row" onClick={() => handleSelectSubPage('connectors')}>
            <span className="cdetail-cta-icon"><IconConnectTools /></span>
            <span className="cdetail-cta-text">
              <span className="cdetail-cta-title">Connect your tools</span>
              <span className="cdetail-cta-desc">Integrate with the tools you use to complete your tasks</span>
            </span>
            <span className="cdetail-cta-arrow">→</span>
          </button>
          <button className="cdetail-cta-row" onClick={() => handleSelectSubPage('skills')}>
            <span className="cdetail-cta-icon"><IconCreateSkills /></span>
            <span className="cdetail-cta-text">
              <span className="cdetail-cta-title">Create new skills</span>
              <span className="cdetail-cta-desc">Teach Claude your processes, team norms, and expertise</span>
            </span>
            <span className="cdetail-cta-arrow">→</span>
          </button>
          <button className="cdetail-cta-row" onClick={() => window.nohi.openExternal('https://nohi.so/plugins')}>
            <span className="cdetail-cta-icon"><IconBrowsePlugins /></span>
            <span className="cdetail-cta-text">
              <span className="cdetail-cta-title">Browse plugins</span>
              <span className="cdetail-cta-desc">Tailor Claude to a specific subject</span>
            </span>
            <span className="cdetail-cta-arrow">↗</span>
          </button>
        </div>
      </div>
    )
  }

  // ── Middle list content ───────────────────────────────────────────────────

  const renderList = () => {
    if (!subPage) return null

    const q = listSearch.toLowerCase()

    if (subPage === 'skills') {
      const filteredCustom = customSkills.filter((s) => !q || s.name.toLowerCase().includes(q))
      const filteredExample = EXAMPLE_SKILLS.filter((n) => !q || n.toLowerCase().includes(q))
      return (
        <>
          {filteredCustom.length > 0 && (
            <>
              <div className="clist-group-label">Your skills</div>
              {filteredCustom.map((s) => (
                <button
                  key={s.name}
                  className={`clist-item ${selectedSkill === s.name ? 'selected' : ''} ${!isSkillEnabled(s.name) ? 'disabled-skill' : ''}`}
                  onClick={() => setSelectedSkill(s.name)}
                >
                  <IconFile />
                  <span className="clist-item-name">{s.name}</span>
                  {!isSkillEnabled(s.name) && <span className="clist-skill-off">off</span>}
                </button>
              ))}
            </>
          )}
          {filteredExample.length > 0 && (
            <>
              <div className="clist-group-label">Examples</div>
              {filteredExample.map((name) => (
                <button
                  key={name}
                  className={`clist-item ${selectedSkill === name ? 'selected' : ''} ${!isSkillEnabled(name) ? 'disabled-skill' : ''}`}
                  onClick={() => setSelectedSkill(name)}
                >
                  <IconFile />
                  <span className="clist-item-name">{name}</span>
                  {!isSkillEnabled(name) && <span className="clist-skill-off">off</span>}
                </button>
              ))}
            </>
          )}
          {q && filteredCustom.length === 0 && filteredExample.length === 0 && (
            <div className="clist-empty">No skills match "{listSearch}"</div>
          )}
        </>
      )
    }

    // Connectors list
    const commerceGroups: Record<string, ConnectorDef[]> = {}
    for (const def of CONNECTOR_DEFS) {
      if (!q || def.name.toLowerCase().includes(q)) {
        if (!commerceGroups[def.group]) commerceGroups[def.group] = []
        commerceGroups[def.group].push(def)
      }
    }

    return (
      <>
        {Object.entries(commerceGroups).map(([group, defs]) => (
          <React.Fragment key={group}>
            <div className="clist-group-label">{group}</div>
            {defs.map((d) => (
              <button
                key={d.id}
                className={`clist-item ${selectedConnectorId === d.id ? 'selected' : ''}`}
                onClick={() => { setSelectedConnectorId(d.id); setSelectedSkill(null) }}
              >
                <div className="clist-logo" style={{ background: d.color }}>{d.initials}</div>
                <span className="clist-item-name">{d.name}</span>
                {isConnected(d.id) && <span className="clist-badge clist-badge-connected">✓</span>}
              </button>
            ))}
          </React.Fragment>
        ))}

        {Object.entries(LEGACY_CONNECTOR_GROUPS).map(([group, connectors]) => {
          const filtered = connectors.filter((c) => !q || c.name.toLowerCase().includes(q))
          if (filtered.length === 0) return null
          return (
            <React.Fragment key={group}>
              <div className="clist-group-label">{group}</div>
              {filtered.map((c) => (
                <button
                  key={c.id}
                  className={`clist-item ${selectedConnectorId === c.id ? 'selected' : ''}`}
                  onClick={() => { setSelectedConnectorId(c.id); setSelectedSkill(null) }}
                >
                  <div className="clist-logo" style={{ background: c.color }}>{c.initials}</div>
                  <span className="clist-item-name">{c.name}</span>
                  {c.badge && <span className="clist-badge">{c.badge}</span>}
                  {!c.badge && isConnected(c.id) && <span className="clist-badge clist-badge-connected">✓</span>}
                </button>
              ))}
            </React.Fragment>
          )
        })}

        {q && CONNECTOR_DEFS.every((d) => !d.name.toLowerCase().includes(q)) &&
          Object.values(LEGACY_CONNECTOR_GROUPS).flat().every((c) => !c.name.toLowerCase().includes(q)) && (
            <div className="clist-empty">No connectors match "{listSearch}"</div>
          )}
      </>
    )
  }

  return (
    <div className="customize-page">
      {/* ── Left sub-sidebar ── */}
      <div className="csub">
        <button className="csub-folder-chip">
          <IconFolder />
          <span className="csub-folder-name">{folderName}</span>
        </button>

        <button
          className={`csub-item ${subPage === 'skills' ? 'active' : ''}`}
          onClick={() => handleSelectSubPage('skills')}
        >
          <IconSkillsNav /> Skills
        </button>
        <button
          className={`csub-item ${subPage === 'connectors' ? 'active' : ''}`}
          onClick={() => handleSelectSubPage('connectors')}
        >
          <IconConnectors /> Connectors
        </button>

        <div className="csub-divider" />

        <div className="csub-promo">
          <p className="csub-promo-text">Give Claude role-level expertise with Plugins</p>
          <button
            className="csub-promo-btn"
            onClick={() => window.nohi.openExternal('https://nohi.so/plugins')}
          >Browse plugins</button>
        </div>
      </div>

      {/* ── Middle list panel ── */}
      {subPage && (
        <div className="clist">
          <div className="clist-header">
            <span className="clist-title">{subPage === 'skills' ? 'Skills' : 'Connectors'}</span>
            <button
              className={`clist-icon-btn ${showSearch ? 'active' : ''}`}
              title="Search"
              onClick={() => { setShowSearch((v) => !v); if (showSearch) setListSearch('') }}
            ><IconSearch /></button>
            {subPage === 'skills' && (
              <button
                className="clist-icon-btn"
                title="Open skills folder"
                onClick={() => window.nohi.openDirDialog()}
              ><IconPlus /></button>
            )}
          </div>
          {showSearch && (
            <div className="clist-search-wrap">
              <input
                className="clist-search-input"
                placeholder={`Search ${subPage}…`}
                value={listSearch}
                onChange={(e) => setListSearch(e.target.value)}
                autoFocus
              />
            </div>
          )}
          <div className="clist-body">
            {renderList()}
          </div>
        </div>
      )}

      {/* ── Right detail panel ── */}
      <div className="cdetail">
        {renderDetail()}
      </div>
    </div>
  )
}
