import { UnauthorizedError } from '@modules/Core/Errors/UnauthorizedError'

export type TelegramAuthPayload = Record<string, unknown> | null

export class PollAuthService {
  public checkTelegramAuth(telegramAuthPayload: TelegramAuthPayload): void {
    // Check if the user is authenticated with Telegram and throw an error if not
    if (!telegramAuthPayload) {
      throw new UnauthorizedError(
        'Пользователь не аутентифицирован с помощью Telegram'
      )
    }

    // TODO: Implement the check for the Telegram authentication payload
  }
}
