import type { Context } from '../Request/Context'
import logConsole from './ConsoleLogger'
import logFile from './FileLogger'
import logTelegram from './TelegramLogger'

export type LogLevel = 'error' | 'debug' | 'crm' | 'info' | 'warning'

export function log(
  level: LogLevel,
  id: string,
  data: object | string,
  context?: Context
) {
  if (process.env.LOG_MODE === 'console') {
    // eslint-disable-next-line no-console
    logConsole(level, id, data, context)
    return
  }

  if (process.env.LOG_MODE === 'file') {
    logFile(level, data)
    return
  }

  if (process.env.LOG_MODE === 'telegram') {
    logTelegram(id, level, data, context)
    return
  }
}
