import React, { useState, useRef, useEffect } from 'react'
import './FolderPicker.css'

// ── localStorage helpers ──────────────────────────────────────────────────────

export function getRecentDirs(): string[] {
  try {
    return JSON.parse(localStorage.getItem('nohi-recent-dirs') ?? '[]')
  } catch {
    return []
  }
}

export function addRecentDir(dir: string): void {
  const updated = [dir, ...getRecentDirs().filter((d) => d !== dir)].slice(0, 8)
  localStorage.setItem('nohi-recent-dirs', JSON.stringify(updated))
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconFolder = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4a1 1 0 011-1h3l1.5 1.5H12a1 1 0 011 1V11a1 1 0 01-1 1H2a1 1 0 01-1-1V4z"/>
  </svg>
)

const IconFolderOpen = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 4a1 1 0 011-1h3l1.5 1.5H12a1 1 0 011 1v1H1V4z"/>
    <path d="M1 6.5h12l-1.5 5.5H2.5L1 6.5z"/>
  </svg>
)

// ── Component ─────────────────────────────────────────────────────────────────

interface FolderPickerProps {
  value?: string
  onChange: (dir: string) => void
  placeholder?: string
  className?: string
}

export default function FolderPicker({ value, onChange, placeholder = 'Select folder', className }: FolderPickerProps) {
  const [open, setOpen] = useState(false)
  const [recentDirs, setRecentDirs] = useState<string[]>([])
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setRecentDirs(getRecentDirs())
  }, [open]) // refresh when opening

  // Outside-click to close
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleSelect = (dir: string) => {
    addRecentDir(dir)
    onChange(dir)
    setOpen(false)
  }

  const handleChooseNative = async () => {
    setOpen(false)
    const dir = await window.nohi.openDirDialog()
    if (dir) handleSelect(dir)
  }

  const displayLabel = value
    ? value.split('/').filter(Boolean).pop() ?? value
    : placeholder

  return (
    <div className={`fp-wrap${className ? ` ${className}` : ''}`} ref={wrapRef}>
      <button className="fp-btn" onClick={() => setOpen((v) => !v)} type="button">
        <IconFolder />
        <span className="fp-btn-label">{displayLabel}</span>
      </button>

      {open && (
        <div className="fp-dropdown">
          {recentDirs.length > 0 ? (
            <>
              <div className="fp-section-label">Recent</div>
              {recentDirs.map((dir) => {
                const parts = dir.split('/').filter(Boolean)
                const name = parts[parts.length - 1] ?? dir
                return (
                  <button key={dir} className="fp-item" onClick={() => handleSelect(dir)} type="button">
                    <span className="fp-item-icon"><IconFolder /></span>
                    <span className="fp-item-text">
                      <span className="fp-item-name">{name}</span>
                      <span className="fp-item-path">{dir}</span>
                    </span>
                  </button>
                )
              })}
            </>
          ) : (
            <span className="fp-empty-hint">No recent folders</span>
          )}

          <div className="fp-divider" />
          <button className="fp-item fp-choose" onClick={handleChooseNative} type="button">
            <span className="fp-item-icon"><IconFolderOpen /></span>
            <span className="fp-item-text">
              <span className="fp-item-name">Choose a different folder</span>
            </span>
          </button>
        </div>
      )}
    </div>
  )
}
