import prisma from '@/lib/db';

export type ErrorSeverity = 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
export type ErrorSource = 'API' | 'CRON' | 'DB' | 'EMAIL' | 'AFFILIATE' | 'PRICE_SYNC' | 'AUTH' | 'SEO' | 'SYSTEM';

export interface LogErrorOptions {
  severity: ErrorSeverity;
  source: ErrorSource;
  message: string;
  error?: any;
  requestPath?: string;
  runId?: string;
}

/**
 * Strips secrets, passwords, Bearer tokens, DB connection strings, and private keys.
 */
export function sanitizeErrorMessage(input: string): string {
  if (!input) return '';
  return input
    .replace(/(?:postgres(?:ql)?:\/\/[^:]+:)([^@]+)(?:@[^\s]+)/gi, 'postgresql://[REDACTED_USER]:[REDACTED_PASSWORD]@[REDACTED_HOST]')
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, 'Bearer [REDACTED_TOKEN]')
    .replace(/(?:password|secret|api_key|token|auth)\s*[:=]\s*["']?([^"',;\s]+)["']?/gi, '$1=[REDACTED_SECRET]')
    .replace(/-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+ PRIVATE KEY-----/g, '[REDACTED_PRIVATE_KEY]')
    .slice(0, 1000);
}

export async function logSystemError(options: LogErrorOptions): Promise<void> {
  try {
    const cleanMessage = sanitizeErrorMessage(options.message || (options.error ? String(options.error.message || options.error) : 'Unknown system error'));
    let cleanStack: string | null = null;

    if (options.error && options.error.stack) {
      cleanStack = sanitizeErrorMessage(String(options.error.stack)).slice(0, 2000);
    }

    await prisma.systemErrorLog.create({
      data: {
        severity: options.severity,
        source: options.source,
        message: cleanMessage,
        stack: cleanStack,
        status: 'OPEN',
        requestPath: options.requestPath ? options.requestPath.slice(0, 200) : null,
        runId: options.runId ? options.runId.slice(0, 100) : null,
      },
    });
  } catch (err) {
    console.error('[SystemErrorLog] Failed to persist system error:', err);
  }
}
