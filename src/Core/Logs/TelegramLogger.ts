import { send } from '../Utils/telegram'
import { LogLevel } from './Logger'

async function telegramLog(
  id: string,
  level: LogLevel,
  data: object | Error | string
) {
  const token = process.env.LOG_TELEGRAM_BOT_TOKEN

  if (!token) {
    return
  }

  const chatId = process.env.LOG_TELEGRAM_CHAT_ID

  if (!chatId) {
    return
  }

  if (data instanceof Error) {
    data = data.stack ? data.message + '\n' + data.stack : data.message
  } else if (typeof data === 'object') {
    data = JSON.stringify(data, null, 2)
  } else {
    data = String(data)
  }

  let levelEmoji = ''

  switch (level) {
    case 'error':
      levelEmoji = '❌'
      break
    case 'debug':
      levelEmoji = '🐛'
      break
  }

  if (data.length > 4000) {
    data = data.slice(0, 500)
  }

  const message = `*Error Id: ${id}*\nLevel: ${levelEmoji}\n\n\`\`\`\n${data}\`\`\``

  await send(chatId, message, token)
}

export default telegramLog
