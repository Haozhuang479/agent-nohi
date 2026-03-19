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

interface Connector {
  id: string
  name: string
  badge?: string
  color: string
  initials: string
}

const CONNECTOR_GROUPS: Record<string, Connector[]> = {
  Web: [
    { id: 'github', name: 'GitHub', color: '#24292e', initials: 'GH' },
    { id: 'gdrive', name: 'Google Drive', color: '#4285f4', initials: 'GD' },
  ],
  Desktop: [
    { id: 'chrome', name: 'Claude in Chrome', badge: 'INCLUDED', color: '#ea4335', initials: 'CC' },
  ],
  'Not connected': [
    { id: 'gmail', name: 'Gmail', color: '#ea4335', initials: 'GM' },
    { id: 'gcal', name: 'Google Calendar', color: '#1a73e8', initials: 'GC' },
  ],
}

// ─── Component ────────────────────────────────────────────────────────────────

interface CustomizeProps {
  workDir?: string
}

export default function Customize({ workDir }: CustomizeProps) {
  const [subPage, setSubPage] = useState<'skills' | 'connectors' | null>(null)
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null)
  const [customSkills, setCustomSkills] = useState<CustomSkill[]>([])
  const [enabledSkills, setEnabledSkills] = useState<string[]>([])

  useEffect(() => {
    window.nohi.getCustomSkills().then(setCustomSkills).catch(() => {})
    window.nohi.getSettings().then((s) => {
      setEnabledSkills(s.enabledSkills ?? [])
    }).catch(() => {})
  }, [])

  const isSkillEnabled = (name: string) => {
    // empty enabledSkills means all enabled
    return enabledSkills.length === 0 || enabledSkills.includes(name)
  }

  const toggleSkill = async (name: string) => {
    const allNames = [
      ...customSkills.map((s) => s.name),
      ...EXAMPLE_SKILLS,
    ]
    let next: string[]
    if (enabledSkills.length === 0) {
      // All enabled → disable this one (enable all others)
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

  const folderName = workDir ? workDir.split('/').filter(Boolean).pop() ?? workDir : 'Downloads'

  const handleSelectSubPage = (p: 'skills' | 'connectors') => {
    setSubPage(p)
    setSelectedSkill(null)
    setSelectedConnector(null)
  }

  // ── Right detail content ──────────────────────────────────────────────────

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

    if (subPage === 'connectors' && selectedConnector) {
      const connected = !CONNECTOR_GROUPS['Not connected'].some((c) => c.id === selectedConnector.id)
      return (
        <div>
          <div className="cdetail-connector-hdr">
            <div className="cdetail-connector-logo" style={{ background: selectedConnector.color }}>
              {selectedConnector.initials}
            </div>
            <span className="cdetail-connector-name">{selectedConnector.name}</span>
            <button className="cdetail-connector-btn">
              {connected ? 'Disconnect' : 'Connect'}
            </button>
          </div>
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
          <button className="cdetail-cta-row">
            <span className="cdetail-cta-icon"><IconBrowsePlugins /></span>
            <span className="cdetail-cta-text">
              <span className="cdetail-cta-title">Browse plugins</span>
              <span className="cdetail-cta-desc">Tailor Claude to a specific subject</span>
            </span>
            <span className="cdetail-cta-arrow">→</span>
          </button>
        </div>
      </div>
    )
  }

  // ── Middle list content ───────────────────────────────────────────────────

  const renderList = () => {
    if (!subPage) return null

    if (subPage === 'skills') {
      return (
        <>
          {customSkills.length > 0 && (
            <>
              <div className="clist-group-label">Your skills</div>
              {customSkills.map((s) => (
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
          <div className="clist-group-label">Examples</div>
          {EXAMPLE_SKILLS.map((name) => (
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
      )
    }

    // Connectors
    return (
      <>
        {Object.entries(CONNECTOR_GROUPS).map(([group, connectors]) => (
          <React.Fragment key={group}>
            <div className="clist-group-label">{group}</div>
            {connectors.map((c) => (
              <button
                key={c.id}
                className={`clist-item ${selectedConnector?.id === c.id ? 'selected' : ''}`}
                onClick={() => setSelectedConnector(c)}
              >
                <div className="clist-logo" style={{ background: c.color }}>{c.initials}</div>
                <span className="clist-item-name">{c.name}</span>
                {c.badge && <span className="clist-badge">{c.badge}</span>}
              </button>
            ))}
          </React.Fragment>
        ))}
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
          <button className="csub-promo-btn">Browse plugins</button>
        </div>
      </div>

      {/* ── Middle list panel ── */}
      {subPage && (
        <div className="clist">
          <div className="clist-header">
            <span className="clist-title">{subPage === 'skills' ? 'Skills' : 'Connectors'}</span>
            <button className="clist-icon-btn" title="Search"><IconSearch /></button>
            <button className="clist-icon-btn" title="Add"><IconPlus /></button>
          </div>
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
