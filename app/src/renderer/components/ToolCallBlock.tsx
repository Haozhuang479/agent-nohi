import { useState } from 'react'
import './ToolCallBlock.css'

interface Props {
  kind: 'tool_call' | 'tool_result'
  toolName: string
  toolInput?: unknown
  toolResult?: string
}

const IconGear = () => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
    <circle cx="7" cy="7" r="1.8"/>
    <path d="M7 1.5v1.2M7 11.3v1.2M1.5 7h1.2M11.3 7h1.2M3.2 3.2l.85.85M9.95 9.95l.85.85M3.2 10.8l.85-.85M9.95 4.05l.85-.85"/>
  </svg>
)

const IconDone = () => (
  <svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7l3.5 3.5 5.5-6"/>
  </svg>
)

const IconChevronUp = () => (
  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 6.5L5 3.5l2.5 3"/>
  </svg>
)

const IconChevronDown = () => (
  <svg width="8" height="8" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 3.5L5 6.5l2.5-3"/>
  </svg>
)

export default function ToolCallBlock({ kind, toolName, toolInput, toolResult }: Props) {
  const [open, setOpen] = useState(false)

  if (kind === 'tool_call') {
    return (
      <div className="tool-block call" onClick={() => setOpen(!open)}>
        <div className="tool-header">
          <span className="tool-icon"><IconGear /></span>
          <span className="tool-name">{toolName}</span>
          <span className="tool-chevron">{open ? <IconChevronUp /> : <IconChevronDown />}</span>
        </div>
        {open && (
          <pre className="tool-body">{JSON.stringify(toolInput, null, 2)}</pre>
        )}
      </div>
    )
  }

  const isScreenshot = toolName === 'browser_screenshot' && toolResult && toolResult.length > 200

  return (
    <div className="tool-block result" onClick={() => setOpen(!open)}>
      <div className="tool-header">
        <span className="tool-icon result-icon"><IconDone /></span>
        <span className="tool-name">{toolName} result</span>
        <span className="tool-chevron">{open ? <IconChevronUp /> : <IconChevronDown />}</span>
      </div>
      {open && (
        isScreenshot ? (
          <div className="tool-body tool-screenshot">
            <img src={`data:image/png;base64,${toolResult}`} alt="Browser screenshot" className="tool-screenshot-img" />
          </div>
        ) : (
          <pre className="tool-body">{toolResult}</pre>
        )
      )}
    </div>
  )
}
