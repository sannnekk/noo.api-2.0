export async function send(
  userTelegramId: string,
  message: string,
  token: string
) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(3000),
      body: JSON.stringify({
        chat_id: userTelegramId,
        text: message,
        parse_mode: 'html',
      }),
    })
  } catch (error: any) {}
}
