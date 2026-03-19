import { chromium } from 'playwright'
import type { Browser, Page } from 'playwright'

let browser: Browser | null = null
let page: Page | null = null

async function ensureBrowser(): Promise<Page> {
  if (!browser || !browser.isConnected()) {
    browser = await chromium.launch({ headless: true })
  }
  if (!page || page.isClosed()) {
    page = await browser.newPage()
  }
  return page
}

export const browserTools = [
  {
    name: 'browser_navigate',
    description: 'Navigate the AI browser to a URL',
    input_schema: {
      type: 'object' as const,
      properties: { url: { type: 'string', description: 'The URL to navigate to' } },
      required: ['url'],
    },
  },
  {
    name: 'browser_screenshot',
    description: 'Take a screenshot of the current browser page. Returns base64-encoded PNG.',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
  {
    name: 'browser_click',
    description: 'Click an element on the page using a CSS selector',
    input_schema: {
      type: 'object' as const,
      properties: { selector: { type: 'string', description: 'CSS selector of the element to click' } },
      required: ['selector'],
    },
  },
  {
    name: 'browser_type',
    description: 'Type text into an input element',
    input_schema: {
      type: 'object' as const,
      properties: {
        selector: { type: 'string', description: 'CSS selector of the input element' },
        text: { type: 'string', description: 'Text to type' },
      },
      required: ['selector', 'text'],
    },
  },
  {
    name: 'browser_get_content',
    description: 'Get the visible text content of the current page',
    input_schema: { type: 'object' as const, properties: {}, required: [] },
  },
]

export async function executeBrowser(name: string, input: Record<string, string>): Promise<string> {
  try {
    const p = await ensureBrowser()
    switch (name) {
      case 'browser_navigate':
        await p.goto(input.url, { waitUntil: 'domcontentloaded', timeout: 15000 })
        return `Navigated to ${input.url}`
      case 'browser_screenshot': {
        const buf = await p.screenshot({ type: 'png' })
        return buf.toString('base64')
      }
      case 'browser_click':
        await p.click(input.selector, { timeout: 5000 })
        return `Clicked element: ${input.selector}`
      case 'browser_type':
        await p.fill(input.selector, input.text, { timeout: 5000 })
        return `Typed into ${input.selector}`
      case 'browser_get_content': {
        const text = await p.evaluate(() => document.body.innerText)
        return (text ?? '').slice(0, 8000)
      }
      default:
        return 'Unknown browser tool'
    }
  } catch (e) {
    return `Browser error: ${(e as Error).message}`
  }
}

export async function closeBrowser(): Promise<void> {
  await browser?.close()
  browser = null
  page = null
}
