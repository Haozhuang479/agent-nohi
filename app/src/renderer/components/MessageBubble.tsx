import { useState } from 'react'
import './MessageBubble.css'

interface Props {
  role: 'user' | 'assistant'
  text: string
  streaming?: boolean
}

// ── Markdown renderer ─────────────────────────────────────────────────────────

function renderMarkdown(raw: string): string {
  // 1. Extract fenced code blocks first to avoid mangling them
  const codeBlocks: string[] = []
  let html = raw.replace(/```(\w*)\n?([\s\S]*?)```/g, (_m, lang, code) => {
    const langLabel = lang ? `<span class="code-lang">${lang}</span>` : ''
    const safe = code.trimEnd()
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    codeBlocks.push(`<div class="code-block">${langLabel}<pre><code>${safe}</code></pre></div>`)
    return `\x00CODE${codeBlocks.length - 1}\x00`
  })

  // 2. Escape HTML in non-code text
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // 3. Inline elements
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>')
  html = html.replace(/`([^`\n]+?)`/g, '<code>$1</code>')
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="md-link" target="_blank" rel="noopener noreferrer">$1</a>')

  // 4. Block elements (process line-by-line)
  const lines = html.split('\n')
  const out: string[] = []
  let inUl = false
  let inOl = false

  for (const line of lines) {
    // Horizontal rule
    if (/^---+$/.test(line)) {
      if (inUl) { out.push('</ul>'); inUl = false }
      if (inOl) { out.push('</ol>'); inOl = false }
      out.push('<hr/>')
      continue
    }
    // Headers
    const h3 = line.match(/^### (.+)$/)
    const h2 = line.match(/^## (.+)$/)
    const h1 = line.match(/^# (.+)$/)
    if (h3 || h2 || h1) {
      if (inUl) { out.push('</ul>'); inUl = false }
      if (inOl) { out.push('</ol>'); inOl = false }
      if (h3) out.push(`<h3>${h3[1]}</h3>`)
      else if (h2) out.push(`<h2>${h2[1]}</h2>`)
      else if (h1) out.push(`<h1>${h1[1]}</h1>`)
      continue
    }
    // Blockquote
    const bq = line.match(/^&gt; (.+)$/)
    if (bq) {
      if (inUl) { out.push('</ul>'); inUl = false }
      if (inOl) { out.push('</ol>'); inOl = false }
      out.push(`<blockquote>${bq[1]}</blockquote>`)
      continue
    }
    // Unordered list item
    const ul = line.match(/^[-*] (.+)$/)
    if (ul) {
      if (inOl) { out.push('</ol>'); inOl = false }
      if (!inUl) { out.push('<ul>'); inUl = true }
      out.push(`<li>${ul[1]}</li>`)
      continue
    }
    // Ordered list item
    const ol = line.match(/^\d+\. (.+)$/)
    if (ol) {
      if (inUl) { out.push('</ul>'); inUl = false }
      if (!inOl) { out.push('<ol>'); inOl = true }
      out.push(`<li>${ol[1]}</li>`)
      continue
    }
    // Close any open list
    if (inUl) { out.push('</ul>'); inUl = false }
    if (inOl) { out.push('</ol>'); inOl = false }
    // Empty line → paragraph break
    if (line.trim() === '') {
      out.push('<br/>')
    } else {
      out.push(line)
    }
  }
  if (inUl) out.push('</ul>')
  if (inOl) out.push('</ol>')

  html = out.join('\n')
  // Join non-block lines with <br>
  html = html.replace(/([^\n>])\n([^\n<])/g, '$1<br/>$2')

  // 5. Restore code blocks
  codeBlocks.forEach((block, i) => {
    html = html.replace(`\x00CODE${i}\x00`, block)
  })

  return html
}

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconCopy = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4.5" y="4.5" width="8" height="9" rx="1.2"/>
    <path d="M2 9.5V2.5a1 1 0 011-1h7"/>
  </svg>
)

const IconCopied = () => (
  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2.5 7l3.5 3.5 5.5-6"/>
  </svg>
)

// ── Component ─────────────────────────────────────────────────────────────────

export default function MessageBubble({ role, text, streaming }: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    })
  }

  const bodyHtml = renderMarkdown(text)
  const htmlWithCursor = streaming
    ? bodyHtml + '<span class="cursor">▋</span>'
    : bodyHtml

  return (
    <div className={`message ${role}`}>
      {role === 'assistant' && <div className="avatar">N</div>}
      <div className="bubble-wrap">
        <div
          className={`bubble${streaming ? ' streaming' : ''}`}
          dangerouslySetInnerHTML={{ __html: htmlWithCursor }}
        />
        {/* Copy button — revealed on hover via CSS */}
        {!streaming && text && (
          <button
            className={`copy-btn${copied ? ' copied' : ''}`}
            onClick={handleCopy}
            title={copied ? 'Copied!' : 'Copy message'}
          >
            {copied ? <IconCopied /> : <IconCopy />}
          </button>
        )}
      </div>
    </div>
  )
}
