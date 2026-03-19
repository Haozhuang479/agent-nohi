import fs from 'fs'
import path from 'path'

export const filesystemTools = [
  {
    name: 'read_file',
    description: 'Read the contents of a file at the given path.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Absolute or relative file path' },
      },
      required: ['path'],
    },
  },
  {
    name: 'write_file',
    description: 'Write content to a file (creates or overwrites).',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'File path to write' },
        content: { type: 'string', description: 'Content to write' },
      },
      required: ['path', 'content'],
    },
  },
  {
    name: 'list_dir',
    description: 'List files and folders in a directory.',
    input_schema: {
      type: 'object' as const,
      properties: {
        path: { type: 'string', description: 'Directory path (default: home directory)' },
      },
      required: [],
    },
  },
]

export function executeFilesystem(name: string, input: Record<string, string>): string {
  try {
    if (name === 'read_file') {
      const content = fs.readFileSync(input.path, 'utf-8')
      return content.length > 10000
        ? content.slice(0, 10000) + '\n... [truncated]'
        : content
    }

    if (name === 'write_file') {
      const dir = path.dirname(input.path)
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
      fs.writeFileSync(input.path, input.content, 'utf-8')
      return `Written to ${input.path}`
    }

    if (name === 'list_dir') {
      const target = input.path || require('os').homedir()
      const entries = fs.readdirSync(target, { withFileTypes: true })
      return entries
        .map((e) => (e.isDirectory() ? `📁 ${e.name}/` : `📄 ${e.name}`))
        .join('\n')
    }

    return 'Unknown tool'
  } catch (e: unknown) {
    return `Error: ${(e as Error).message}`
  }
}
