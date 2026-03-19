import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import type { McpServer } from './settings'

interface McpTool {
  name: string
  description: string
  input_schema: unknown
}

export async function getMCPTools(
  servers: McpServer[]
): Promise<{ tools: McpTool[]; clients: Map<string, Client> }> {
  const tools: McpTool[] = []
  const clients = new Map<string, Client>()

  for (const server of servers) {
    let transport: StdioClientTransport | undefined
    try {
      transport = new StdioClientTransport({
        command: server.command,
        args: server.args ?? [],
        env: server.env,
      })
      const client = new Client(
        { name: 'nohi', version: '1.0.0' },
        { capabilities: {} }
      )
      await client.connect(transport)
      const result = await client.listTools()
      for (const t of result.tools) {
        tools.push({
          // prefix tool name with server name to avoid collisions
          name: `${server.name}__${t.name}`,
          description: `[${server.name}] ${t.description ?? ''}`,
          input_schema: t.inputSchema,
        })
      }
      clients.set(server.name, client)
    } catch (e) {
      console.error(`[MCP] Failed to connect to server "${server.name}":`, e)
      try { await transport?.close() } catch {}
    }
  }

  return { tools, clients }
}

export async function callMCPTool(
  clients: Map<string, Client>,
  serverName: string,
  toolName: string,
  input: Record<string, unknown>
): Promise<string> {
  const client = clients.get(serverName)
  if (!client) return `MCP server "${serverName}" not connected`
  try {
    const result = await client.callTool({ name: toolName, arguments: input })
    const content = result.content
    if (Array.isArray(content)) {
      return content
        .map((c: { type: string; text?: string }) => (c.type === 'text' ? c.text ?? '' : ''))
        .join('\n')
    }
    return String(content)
  } catch (e) {
    return `MCP tool error: ${(e as Error).message}`
  }
}
