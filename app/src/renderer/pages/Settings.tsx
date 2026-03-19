import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { setLanguage as i18nSetLanguage } from '../i18n'
import './Settings.css'

// Provider SVG icons
const IconAnthropic = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3L3 20h3.5l1.7-4h7.6l1.7 4H21L12 3zm-2.5 10l2.5-6 2.5 6h-5z"/>
  </svg>
)

const IconOpenAI = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 4v8m-4-4h8"/>
  </svg>
)

const IconGoogle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.3 12.2c0-.6-.1-1.3-.2-1.8H12v3.4h4.7a4 4 0 01-1.7 2.6v2.2h2.8c1.6-1.5 2.5-3.7 2.5-6.4z"/>
    <path d="M12 21c2.4 0 4.4-.8 5.8-2.1l-2.8-2.2c-.8.5-1.8.8-3 .8-2.3 0-4.3-1.6-5-3.7H4.1v2.3A9 9 0 0012 21z"/>
    <path d="M7 13.8a5.4 5.4 0 010-3.6V7.9H4.1a9 9 0 000 8.2L7 13.8z"/>
    <path d="M12 6.5c1.3 0 2.5.4 3.4 1.3l2.5-2.5A9 9 0 004.1 7.9L7 10.2c.7-2.1 2.7-3.7 5-3.7z"/>
  </svg>
)

const IconDeepSeek = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3c-2.5 0-4.5 1-6 2.5S4 9 4 11.5c0 2 .6 3.8 1.8 5.2L4 21h4l1.5-2c.8.3 1.6.5 2.5.5 4.4 0 8-3.4 8-7.5S16.4 3 12 3z"/>
    <path d="M9 12l2 2 4-4"/>
  </svg>
)

const IconCustom = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/>
  </svg>
)

const MODELS: Record<string, string[]> = {
  anthropic: ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-haiku-4-5-20251001'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini'],
  google: ['gemini-2.0-flash', 'gemini-2.5-pro'],
  deepseek: ['deepseek-chat', 'deepseek-reasoner'],
  'openai-compatible': [],
}

type Provider = 'anthropic' | 'openai' | 'google' | 'deepseek' | 'openai-compatible'

interface McpServer { name: string; command: string; args?: string[] }

interface Props {
  onSaved: () => void
}

export default function Settings({ onSaved }: Props) {
  const { t } = useTranslation()
  const [provider, setProvider] = useState<Provider>('anthropic')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('claude-sonnet-4-6')
  const [customModel, setCustomModel] = useState('')
  const [skillsDir, setSkillsDir] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [saved, setSaved] = useState(false)

  // Advanced settings
  const [autoUpdate, setAutoUpdate] = useState(true)
  const [browserEnabled, setBrowserEnabled] = useState(false)
  const [remoteEnabled, setRemoteEnabled] = useState(false)
  const [remotePort, setRemotePort] = useState(3847)
  const [remoteInfo, setRemoteInfo] = useState<{ port: number; token: string } | null>(null)
  const [language, setLanguage] = useState('en')
  const [mcpServers, setMcpServers] = useState<McpServer[]>([])

  // MCP form
  const [mcpName, setMcpName] = useState('')
  const [mcpCmd, setMcpCmd] = useState('')
  const [mcpArgs, setMcpArgs] = useState('')

  // Copy feedback
  const [tokenCopied, setTokenCopied] = useState(false)

  useEffect(() => {
    window.nohi.getSettings().then((s) => {
      setProvider((s.provider as Provider) || 'anthropic')
      setApiKey(s.apiKey || '')
      setModel(s.model || 'claude-sonnet-4-6')
      setSkillsDir(s.skillsDir || '')
      setBaseUrl(s.baseUrl || '')
      setAutoUpdate(s.autoUpdate !== false)
      setBrowserEnabled(s.browserEnabled === true)
      setRemoteEnabled(s.remoteEnabled === true)
      setRemotePort(s.remotePort || 3847)
      setLanguage(s.language || 'en')
      setMcpServers((s.mcpServers as McpServer[]) || [])
      if (s.provider === 'openai-compatible') setCustomModel(s.model || '')
    })
    window.nohi.getRemoteInfo().then(setRemoteInfo)
  }, [])

  const handleProviderChange = (p: Provider) => {
    setProvider(p)
    if (p !== 'openai-compatible') setModel(MODELS[p][0] || '')
  }

  const effectiveModel = provider === 'openai-compatible' ? customModel : model

  const handleSave = async () => {
    const s = await window.nohi.getSettings()
    await window.nohi.saveSettings({
      ...s,
      provider,
      apiKey,
      model: effectiveModel,
      skillsDir,
      baseUrl: provider === 'openai-compatible' ? baseUrl : undefined,
      autoUpdate,
      browserEnabled,
      remoteEnabled,
      remotePort,
      language,
      mcpServers,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    // Refresh remote info after save
    setTimeout(() => window.nohi.getRemoteInfo().then(setRemoteInfo), 500)
    onSaved()
  }

  const addMcpServer = () => {
    if (!mcpName.trim() || !mcpCmd.trim()) return
    const args = mcpArgs.trim() ? mcpArgs.split(',').map((a) => a.trim()).filter(Boolean) : []
    setMcpServers((prev) => [...prev, { name: mcpName.trim(), command: mcpCmd.trim(), args }])
    setMcpName(''); setMcpCmd(''); setMcpArgs('')
  }

  const removeMcpServer = (idx: number) => {
    setMcpServers((prev) => prev.filter((_, i) => i !== idx))
  }

  const copyToken = () => {
    if (remoteInfo?.token) {
      navigator.clipboard.writeText(remoteInfo.token)
      setTokenCopied(true)
      setTimeout(() => setTokenCopied(false), 2000)
    }
  }

  const keyPlaceholder =
    provider === 'anthropic' ? 'sk-ant-...' :
    provider === 'openai' ? 'sk-...' :
    provider === 'google' ? 'AIza...' :
    provider === 'deepseek' ? 'sk-...' : 'API key'

  const keyLink =
    provider === 'anthropic' ? 'https://console.anthropic.com/keys' :
    provider === 'openai' ? 'https://platform.openai.com/api-keys' :
    provider === 'google' ? 'https://aistudio.google.com/apikey' :
    provider === 'deepseek' ? 'https://platform.deepseek.com/api_keys' : ''

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>{t('Settings')}</h1>
        <p>Connect your AI provider and configure Nohi for your store</p>
      </div>

      <div className="settings-body">
        {/* ── AI Provider ── */}
        <section className="settings-section">
          <h2>{t('AI Provider')}</h2>
          <div className="provider-grid">
            {(['anthropic', 'openai', 'google', 'deepseek', 'openai-compatible'] as Provider[]).map((p) => (
              <button
                key={p}
                className={`provider-card ${provider === p ? 'active' : ''}`}
                onClick={() => handleProviderChange(p)}
              >
                <span className="provider-icon">
                  {p === 'anthropic' ? <IconAnthropic /> :
                   p === 'openai' ? <IconOpenAI /> :
                   p === 'google' ? <IconGoogle /> :
                   p === 'deepseek' ? <IconDeepSeek /> :
                   <IconCustom />}
                </span>
                <span className="provider-name">
                  {p === 'anthropic' ? 'Anthropic' :
                   p === 'openai' ? 'OpenAI' :
                   p === 'google' ? 'Google' :
                   p === 'deepseek' ? 'DeepSeek' : 'Custom'}
                </span>
              </button>
            ))}
          </div>
          {provider === 'openai-compatible' && (
            <input
              type="text"
              className="settings-input mt-8"
              placeholder="Base URL (e.g. http://localhost:11434/v1)"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
            />
          )}
        </section>

        {/* ── API Key ── */}
        <section className="settings-section">
          <h2>{t('API Key')}</h2>
          <p className="hint">
            Stored locally in ~/.nohi/config.json — never sent to Nohi servers.
          </p>
          <input
            type="password"
            className="settings-input"
            placeholder={keyPlaceholder}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          {keyLink && (
            <a className="get-key-link" onClick={() => window.nohi.openExternal(keyLink)}>
              Get an API key →
            </a>
          )}
        </section>

        {/* ── Model ── */}
        <section className="settings-section">
          <h2>{t('Model')}</h2>
          {provider === 'openai-compatible' ? (
            <input
              type="text"
              className="settings-input"
              placeholder="Model name (e.g. llama3, mistral)"
              value={customModel}
              onChange={(e) => setCustomModel(e.target.value)}
            />
          ) : (
            <select
              className="settings-input"
              value={model}
              onChange={(e) => setModel(e.target.value)}
            >
              {MODELS[provider].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
        </section>

        {/* ── Skills Directory ── */}
        <section className="settings-section">
          <h2>{t('Skills Directory')} <span className="optional">(optional)</span></h2>
          <p className="hint">
            Skills teach Nohi your store's context. Built-in e-commerce skills load automatically. Add custom <code>.md</code> skills here. Default: <code>~/.nohi/skills/</code>
          </p>
          <input
            type="text"
            className="settings-input"
            placeholder="/Users/you/my-skills"
            value={skillsDir}
            onChange={(e) => setSkillsDir(e.target.value)}
          />
        </section>

        {/* ── MCP Servers ── */}
        <section className="settings-section">
          <h2>{t('MCP Servers')} <span className="optional">(optional)</span></h2>
          <p className="hint">Connect Model Context Protocol servers to extend Nohi with additional tools.</p>
          {mcpServers.length > 0 && (
            <div className="mcp-list">
              {mcpServers.map((srv, i) => (
                <div key={i} className="mcp-item">
                  <div className="mcp-item-info">
                    <span className="mcp-item-name">{srv.name}</span>
                    <span className="mcp-item-cmd">{srv.command}{srv.args?.length ? ' ' + srv.args.join(' ') : ''}</span>
                  </div>
                  <button className="mcp-item-remove" onClick={() => removeMcpServer(i)} title="Remove">×</button>
                </div>
              ))}
            </div>
          )}
          <div className="mcp-add-form">
            <input
              type="text"
              className="settings-input mcp-input"
              placeholder="Name (e.g. filesystem)"
              value={mcpName}
              onChange={(e) => setMcpName(e.target.value)}
            />
            <input
              type="text"
              className="settings-input mcp-input"
              placeholder="Command (e.g. npx -y @modelcontextprotocol/server-filesystem)"
              value={mcpCmd}
              onChange={(e) => setMcpCmd(e.target.value)}
            />
            <input
              type="text"
              className="settings-input mcp-input"
              placeholder="Args (comma-separated, optional)"
              value={mcpArgs}
              onChange={(e) => setMcpArgs(e.target.value)}
            />
            <button
              className="mcp-add-btn"
              onClick={addMcpServer}
              disabled={!mcpName.trim() || !mcpCmd.trim()}
            >
              {t('Add server')}
            </button>
          </div>
        </section>

        {/* ── Remote Access ── */}
        <section className="settings-section">
          <h2>{t('Remote Access')} <span className="optional">(optional)</span></h2>
          <p className="hint">Access Nohi from a browser on your local network.</p>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={remoteEnabled}
              onChange={(e) => setRemoteEnabled(e.target.checked)}
            />
            <span>{t('Enable remote access')}</span>
          </label>
          {remoteEnabled && (
            <div className="remote-config">
              <div className="settings-row">
                <label className="settings-label">{t('Port')}</label>
                <input
                  type="number"
                  className="settings-input settings-input-sm"
                  value={remotePort}
                  onChange={(e) => setRemotePort(Number(e.target.value))}
                  min={1024}
                  max={65535}
                />
              </div>
              {remoteInfo && (
                <div className="remote-token-row">
                  <span className="hint">Token (share with remote browsers):</span>
                  <div className="remote-token-wrap">
                    <code className="remote-token">{remoteInfo.token}</code>
                    <button className="remote-copy-btn" onClick={copyToken}>
                      {tokenCopied ? '✓' : 'Copy'}
                    </button>
                  </div>
                  <span className="hint">URL: http://localhost:{remoteInfo.port}</span>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Language ── */}
        <section className="settings-section">
          <h2>{t('Language')}</h2>
          <div className="lang-grid">
            {[['en', t('English')], ['zh', '中文']].map(([code, label]) => (
              <button
                key={code}
                className={`lang-btn ${language === code ? 'active' : ''}`}
                onClick={() => { setLanguage(code); i18nSetLanguage(code) }}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {/* ── Advanced ── */}
        <section className="settings-section">
          <h2>{t('Advanced')}</h2>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={autoUpdate}
              onChange={(e) => setAutoUpdate(e.target.checked)}
            />
            <span>Auto-update Nohi when new versions are available</span>
          </label>
          <label className="settings-toggle mt-8">
            <input
              type="checkbox"
              checked={browserEnabled}
              onChange={(e) => setBrowserEnabled(e.target.checked)}
            />
            <span>{t('Enable AI Browser tools')} (Playwright — allows agent to browse the web)</span>
          </label>
        </section>

        <button className="save-btn" onClick={handleSave} disabled={!apiKey.trim()}>
          {saved ? `✓ ${t('Saved!')}` : t('Save Settings')}
        </button>
      </div>
    </div>
  )
}
