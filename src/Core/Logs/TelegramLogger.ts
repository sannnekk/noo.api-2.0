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
  const eleonorChatId = process.env.LOG_TELEGRAM_ELEONOR_CHAT_ID

  if (!chatId) {
    return
  }

  if (data instanceof Error) {
    data = data.stack ? data.message + '\n' + data.stack : data.message
  } else if (typeof data === 'object') {
    let result = JSON.stringify(data, null, 2)

    if (result.length > 3750) {
      result = JSON.stringify(data)
    }

    data = result
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

  if (data.length > 3750) {
    data = data.slice(0, 3750)
  }

  data = data
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('(', '(')

  const message =
    level === 'crm'
      ? `<b>Message: ${id}</b>\n<pre expandable>${data}</pre>`
      : `<b>Error Id: ${id}</b>\nLevel: ${levelEmoji}\n\n<pre expandable>${data}</pre>`

  await send(chatId, message, token)

  if (level === 'crm' && eleonorChatId) {
    await send(eleonorChatId, message, token)
  }
}

export default telegramLog
