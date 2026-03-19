import { useState } from 'react'
import './ArtifactRail.css'

export interface Artifact {
  id: string
  path: string
  name: string
  ext: string
  content?: string
}

function fileIcon(ext: string): string {
  const map: Record<string, string> = {
    ts: '󰛦', tsx: '󰛦', js: '󰌞', jsx: '󰌞',
    py: '󰌠', rs: '󰙩', go: '󰟓', rb: '󰴭',
    json: '󰘦', yaml: '󰈙', yml: '󰈙', toml: '󰈙',
    md: '󰍔', txt: '󰈙', csv: '󱐏',
    html: '󰌝', css: '󰌝', scss: '󰌝',
    sh: '󰲋', bash: '󰲋', zsh: '󰲋',
    png: '󰈹', jpg: '󰈹', jpeg: '󰈹', gif: '󰈹', svg: '󰜡',
    pdf: '󰈦', zip: '󰛫', tar: '󰛫',
  }
  return map[ext.toLowerCase()] ?? '󰈙'
}

interface Props {
  artifacts: Artifact[]
  onClose: () => void
}

export default function ArtifactRail({ artifacts, onClose }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null)

  return (
    <div className="artifact-rail">
      <div className="artifact-rail-header">
        <span className="artifact-rail-title">Artifacts ({artifacts.length})</span>
        <button className="artifact-rail-close" onClick={onClose} title="Close artifacts">×</button>
      </div>

      <div className="artifact-rail-list">
        {artifacts.length === 0 ? (
          <div className="artifact-rail-empty">No files created yet.</div>
        ) : (
          artifacts.map((a) => (
            <div key={a.id} className="artifact-item">
              <button
                className={`artifact-item-header ${expanded === a.id ? 'open' : ''}`}
                onClick={() => setExpanded(expanded === a.id ? null : a.id)}
              >
                <span className="artifact-icon">{fileIcon(a.ext)}</span>
                <span className="artifact-name">{a.name}</span>
                <span className="artifact-ext">.{a.ext}</span>
                <span className="artifact-chevron">{expanded === a.id ? '▲' : '▼'}</span>
              </button>
              <div className="artifact-path" title={a.path}>{a.path}</div>
              {expanded === a.id && a.content !== undefined && (
                <pre className="artifact-preview">{a.content}</pre>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
