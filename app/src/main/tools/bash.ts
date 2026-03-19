import { execSync } from 'child_process'

const DANGEROUS = [
  'rm -rf /',
  'rm -rf ~',
  ':(){:|:&};:',
  'mkfs',
  'dd if=',
  '> /dev/sda',
]

export const bashTools = [
  {
    name: 'run_bash',
    description: 'Execute a shell command and return stdout/stderr. Avoid destructive commands.',
    input_schema: {
      type: 'object' as const,
      properties: {
        command: { type: 'string', description: 'Shell command to execute' },
      },
      required: ['command'],
    },
  },
]

export function executeBash(input: { command: string }): string {
  const cmd = input.command.trim()

  if (DANGEROUS.some((d) => cmd.includes(d))) {
    return 'Blocked: this command is too dangerous to execute.'
  }

  try {
    const out = execSync(cmd, {
      timeout: 15000,
      maxBuffer: 1024 * 1024,
      encoding: 'utf-8',
    })
    return out || '(no output)'
  } catch (e: unknown) {
    const err = e as { stdout?: string; stderr?: string; message?: string }
    return err.stderr || err.stdout || err.message || 'Command failed'
  }
}
