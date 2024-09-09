import { log } from '../Logs/Logger'

export async function send(
  userTelegramId: string,
  message: string,
  token: string
) {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: userTelegramId,
          text: message,
          // set parse mode to the text where * is bold, _ is italic, etc.
          parse_mode: 'html',
        }),
      }
    )

    if (response.status !== 200) {
      log('error', 'Failed to send message to Telegram', await response.text())
    }
  } catch (error: any) {
    log('error', 'Thrown failed to send message to Telegram', error.message)
  }
}
