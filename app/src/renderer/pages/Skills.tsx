import { useState, useEffect } from 'react'
import './Skills.css'

interface Skill {
  name: string
  description: string
  trigger: string
  source: 'builtin' | 'custom'
  filePath?: string
}

const BUILTIN_SKILLS: Skill[] = [
  {
    name: 'flash-sale',
    description: '限时促销活动助手 — 帮助规划折扣深度、目标客群和邮件文案',
    trigger: 'flash sale|promotion|discount|促销|折扣',
    source: 'builtin',
  },
  {
    name: 'inventory',
    description: '库存监控与预警 — 识别低库存 SKU 并建议补货策略',
    trigger: 'inventory|stock|reorder|库存|补货',
    source: 'builtin',
  },
  {
    name: 'customer-winback',
    description: '客户召回策略 — 识别流失风险客户并起草个性化唤回内容',
    trigger: 'winback|inactive|churn|召回|流失',
    source: 'builtin',
  },
  {
    name: 'product-listing',
    description: '商品详情页优化 — 改写标题、描述和关键词以提升转化',
    trigger: 'listing|description|seo|标题|详情页',
    source: 'builtin',
  },
]

export default function Skills() {
  const [activeTab, setActiveTab] = useState<'builtin' | 'custom'>('builtin')
  const [customSkills, setCustomSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    window.nohi.getCustomSkills().then((raw) => {
      setCustomSkills(
        raw.map((s) => ({
          name: s.name,
          description: s.description,
          trigger: s.trigger,
          source: 'custom' as const,
          filePath: s.filePath,
        }))
      )
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div className="skills-page">
      <div className="skills-header">
        <h1>Nohi Skills</h1>
        <p>Skills inject domain context into Nohi when your message matches a trigger keyword.</p>
      </div>

      <div className="skills-tabs">
        <button
          className={`skills-tab ${activeTab === 'builtin' ? 'active' : ''}`}
          onClick={() => setActiveTab('builtin')}
        >
          Built-in
          <span className="tab-count">{BUILTIN_SKILLS.length}</span>
        </button>
        <button
          className={`skills-tab ${activeTab === 'custom' ? 'active' : ''}`}
          onClick={() => setActiveTab('custom')}
        >
          Custom
          <span className="tab-count">{customSkills.length}</span>
        </button>
      </div>

      <div className="skills-body">
        {activeTab === 'builtin' && (
          <div className="skills-grid">
            {BUILTIN_SKILLS.map((skill) => (
              <div key={skill.name} className="skill-card">
                <div className="skill-card-header">
                  <span className="skill-name">{skill.name}</span>
                  <span className="skill-badge">Built-in</span>
                </div>
                <p className="skill-description">{skill.description}</p>
                <div className="skill-trigger">
                  <span className="trigger-label">Triggers: </span>
                  {skill.trigger}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'custom' && (
          loading ? (
            <div className="skills-loading">Loading custom skills…</div>
          ) : customSkills.length > 0 ? (
            <div className="skills-grid">
              {customSkills.map((skill) => (
                <div key={skill.filePath ?? skill.name} className="skill-card skill-card-custom">
                  <div className="skill-card-header">
                    <span className="skill-name">{skill.name}</span>
                    <span className="skill-badge skill-badge-custom">Custom</span>
                  </div>
                  {skill.description && (
                    <p className="skill-description">{skill.description}</p>
                  )}
                  {skill.trigger && (
                    <div className="skill-trigger">
                      <span className="trigger-label">Triggers: </span>
                      {skill.trigger}
                    </div>
                  )}
                  {skill.filePath && (
                    <div className="skill-filepath">{skill.filePath}</div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="skills-empty">
              <div className="skills-empty-icon">⚡</div>
              <h3>No custom skills yet</h3>
              <p>
                Create <code>.md</code> files in <code>~/.nohi/skills/</code> or set a custom
                Skills Directory in Settings to teach Nohi your store's specific context.
              </p>
              <button
                className="skills-docs-btn"
                onClick={() => window.nohi.openExternal('https://nohi.so/docs#skills')}
              >
                Learn how to create Skills →
              </button>
            </div>
          )
        )}
      </div>
    </div>
  )
}
