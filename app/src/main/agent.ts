import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'
import { getSettings } from './settings'
import { filesystemTools, executeFilesystem } from './tools/filesystem'
import { bashTools, executeBash } from './tools/bash'
import { browserTools, executeBrowser } from './tools/browser'
import { loadSkills } from './skills'
import { getMCPTools, callMCPTool } from './mcp'
import type { Client } from '@modelcontextprotocol/sdk/client/index.js'

// Registry of all active MCP clients so they can be closed on shutdown
const activeMCPClients = new Set<Map<string, Client>>()

export async function closeAllMCPClients(): Promise<void> {
  for (const clientMap of activeMCPClients) {
    for (const client of clientMap.values()) {
      try { await client.close() } catch {}
    }
  }
  activeMCPClients.clear()
}

export interface AgentMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AgentChunk {
  type: 'text' | 'tool_call' | 'tool_result' | 'done' | 'error'
  text?: string
  toolName?: string
  toolInput?: unknown
  toolResult?: string
}

export type AgentMode = 'ask' | 'auto' | 'plan' | 'bypass'

export interface AgentOptions {
  mode?: AgentMode
  model?: string      // override global settings model
  workDir?: string    // inject working directory into system prompt
}

const BASE_TOOLS = [...filesystemTools, ...bashTools]

interface AnyTool {
  name: string
  description: string
  input_schema: { type: 'object'; properties: Record<string, unknown>; required: string[] }
}

function getActiveTools(): AnyTool[] {
  const settings = getSettings()
  const tools: AnyTool[] = [...BASE_TOOLS] as AnyTool[]
  if (settings.browserEnabled) tools.push(...(browserTools as AnyTool[]))
  return tools
}

async function executeTool(name: string, input: Record<string, string>, mcpClients?: Map<string, Client>): Promise<string> {
  const fsTools = ['read_file', 'write_file', 'list_dir']
  if (fsTools.includes(name)) return executeFilesystem(name, input)
  if (name === 'run_bash') return executeBash(input as { command: string })

  const browserToolNames = ['browser_navigate', 'browser_screenshot', 'browser_click', 'browser_type', 'browser_get_content']
  if (browserToolNames.includes(name)) return executeBrowser(name, input)

  // MCP tool
  if (mcpClients && name.includes('__')) {
    const [serverName, toolName] = name.split('__', 2)
    return callMCPTool(mcpClients, serverName, toolName, input)
  }

  return 'Unknown tool'
}

function injectConnectionEnvVars(): void {
  const settings = getSettings()
  const conns = settings.connections ?? {}
  const parseCreds = (id: string): Record<string, string> => {
    try { return JSON.parse(conns[id] ?? '{}') } catch { return {} }
  }
  if (conns['shopify']) {
    const c = parseCreds('shopify')
    if (c.storefront_token) process.env.SHOPIFY_STOREFRONT_TOKEN = c.storefront_token
    if (c.domain) process.env.SHOPIFY_STORE_DOMAIN = c.domain
  }
  if (conns['saleor']) {
    const c = parseCreds('saleor')
    if (c.token) process.env.SALEOR_API_TOKEN = c.token
    if (c.url) process.env.SALEOR_API_URL = c.url
  }
  if (conns['stripe']) {
    const c = parseCreds('stripe')
    if (c.secret_key) process.env.STRIPE_SECRET_KEY = c.secret_key
  }
  if (conns['google_analytics']) {
    const c = parseCreds('google_analytics')
    if (c.credentials_path) process.env.GA_SERVICE_ACCOUNT_JSON = c.credentials_path
    if (c.property_id) process.env.GA_PROPERTY_ID = c.property_id
  }
  if (conns['google_workspace']) {
    const c = parseCreds('google_workspace')
    if (c.credentials_path) process.env.GOOGLE_APPLICATION_CREDENTIALS = c.credentials_path
  }
  if (conns['feishu']) {
    const c = parseCreds('feishu')
    if (c.app_id) process.env.FEISHU_APP_ID = c.app_id
    if (c.app_secret) process.env.FEISHU_APP_SECRET = c.app_secret
  }
  if (conns['klaviyo']) {
    const c = parseCreds('klaviyo')
    if (c.api_key) process.env.KLAVIYO_API_KEY = c.api_key
  }
}

function buildSystemPrompt(userMessage: string, mode?: AgentMode, workDir?: string): string {
  const settings = getSettings()
  const base = `You are Agent Nohi, a helpful local AI assistant with access to the user's computer.
You can read/write files, list directories, and run shell commands.
Always ask for confirmation before deleting files or running dangerous commands.
Be concise and helpful.`
  const dirNote = workDir ? `\n\nWorking directory for this task: ${workDir}` : ''
  const skills = loadSkills(userMessage, settings.skillsDir || undefined, settings.enabledSkills)
  const modePrefix = mode === 'plan'
    ? `You are in plan mode. Describe exactly what steps you would take and what tools you would call, but do NOT execute any tools. Use future tense ("I would...", "I will..."). Output your plan as a numbered list.\n\n`
    : ''
  return modePrefix + base + dirNote + skills
}

// Anthropic path
async function runAnthropic(
  messages: AgentMessage[],
  onChunk: (c: AgentChunk) => void,
  options?: AgentOptions
): Promise<void> {
  const settings = getSettings()
  const client = new Anthropic({ apiKey: settings.apiKey })
  const userMessage = messages[messages.length - 1]?.content || ''
  const mode = options?.mode
  const workDir = options?.workDir
  const modelOverride = options?.model
  const systemPrompt = buildSystemPrompt(userMessage, mode, workDir)

  // Gather tools (base + MCP)
  const { tools: mcpTools, clients: mcpClients } = await getMCPTools(settings.mcpServers ?? [])
  activeMCPClients.add(mcpClients)
  const baseTools = mode === 'plan' ? [] : getActiveTools()
  const tools = [...baseTools, ...mcpTools]

  const history: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }))

  let continueLoop = true
  while (continueLoop) {
    const response = await client.messages.create({
      model: modelOverride || settings.model,
      max_tokens: 4096,
      system: systemPrompt,
      tools: tools as Anthropic.Tool[],
      messages: history,
    })

    let assistantText = ''
    for (const block of response.content) {
      if (block.type === 'text') {
        assistantText += block.text
        onChunk({ type: 'text', text: block.text })
      }
    }

    if (response.stop_reason === 'tool_use') {
      const toolUseBlocks = response.content.filter(
        (b): b is Anthropic.ToolUseBlock => b.type === 'tool_use'
      )

      history.push({ role: 'assistant', content: response.content })

      const toolResults: Anthropic.ToolResultBlockParam[] = []
      for (const tool of toolUseBlocks) {
        onChunk({ type: 'tool_call', toolName: tool.name, toolInput: tool.input })
        const result = await executeTool(tool.name, tool.input as Record<string, string>, mcpClients)
        onChunk({ type: 'tool_result', toolName: tool.name, toolResult: result })
        toolResults.push({ type: 'tool_result', tool_use_id: tool.id, content: result })
      }

      history.push({ role: 'user', content: toolResults })
    } else {
      if (assistantText) {
        history.push({ role: 'assistant', content: assistantText })
      }
      continueLoop = false
    }
  }
  activeMCPClients.delete(mcpClients)
}

// OpenAI-compatible path (OpenAI + Google + DeepSeek + custom via OpenAI SDK)
async function runOpenAI(
  messages: AgentMessage[],
  onChunk: (c: AgentChunk) => void,
  options?: AgentOptions
): Promise<void> {
  const settings = getSettings()

  const baseURLMap: Record<string, string | undefined> = {
    google:             'https://generativelanguage.googleapis.com/v1beta/openai',
    deepseek:           'https://api.deepseek.com/v1',
    'openai-compatible': settings.baseUrl,
  }

  const client = new OpenAI({
    apiKey: settings.apiKey,
    baseURL: baseURLMap[settings.provider],
  })

  const userMessage = messages[messages.length - 1]?.content || ''
  const mode = options?.mode
  const workDir = options?.workDir
  const modelOverride = options?.model
  const systemPrompt = buildSystemPrompt(userMessage, mode, workDir)
  const { tools: mcpTools, clients: mcpClients } = await getMCPTools(settings.mcpServers ?? [])
  activeMCPClients.add(mcpClients)
  const baseTools = mode === 'plan' ? [] : getActiveTools()
  const tools = [...baseTools, ...mcpTools]

  const history: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  ]

  const oaiTools: OpenAI.ChatCompletionTool[] = tools.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.input_schema as OpenAI.FunctionParameters,
    },
  }))

  let continueLoop = true
  while (continueLoop) {
    const response = await client.chat.completions.create({
      model: modelOverride || settings.model,
      messages: history,
      tools: oaiTools,
    })

    const choice = response.choices[0]
    if (!choice) { continueLoop = false; continue }
    const msg = choice.message

    if (msg.content) onChunk({ type: 'text', text: msg.content })

    history.push(msg)

    if (choice.finish_reason === 'tool_calls' && msg.tool_calls) {
      const toolResults: OpenAI.ChatCompletionToolMessageParam[] = []
      for (const tc of msg.tool_calls) {
        const fn = (tc as unknown as { function: { name: string; arguments: string }; id: string })
        const input = JSON.parse(fn.function.arguments)
        onChunk({ type: 'tool_call', toolName: fn.function.name, toolInput: input })
        const result = await executeTool(fn.function.name, input, mcpClients)
        onChunk({ type: 'tool_result', toolName: fn.function.name, toolResult: result })
        toolResults.push({ role: 'tool', tool_call_id: fn.id, content: result })
      }
      history.push(...toolResults)
    } else {
      continueLoop = false
    }
  }
  activeMCPClients.delete(mcpClients)
}

export async function runAgent(
  messages: AgentMessage[],
  onChunk: (c: AgentChunk) => void,
  options?: AgentOptions
): Promise<void> {
  injectConnectionEnvVars()
  const settings = getSettings()
  try {
    if (settings.provider === 'anthropic') {
      await runAnthropic(messages, onChunk, options)
    } else {
      await runOpenAI(messages, onChunk, options)
    }
    onChunk({ type: 'done' })
  } catch (e: unknown) {
    onChunk({ type: 'error', text: (e as Error).message })
  }
}
