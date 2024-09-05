import logFile from './FileLogger'
import logTelegram from './TelegramLogger'

export type LogLevel = 'error' | 'debug' | 'crm'

export function log(level: LogLevel, id: string, data: object | string) {
  if (process.env.LOG_MODE === 'console') {
    // eslint-disable-next-line no-console
    console.log(data)
    return
  }

  if (process.env.LOG_MODE === 'file') {
    logFile(level, data)
    return
  }

  if (process.env.LOG_MODE === 'telegram') {
    logTelegram(id, level, data)
    return
  }
}
