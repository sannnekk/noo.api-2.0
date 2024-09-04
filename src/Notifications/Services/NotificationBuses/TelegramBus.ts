import { NotificationBus } from './NotificationBus'
import type { Notification } from '../../Data/Notification'
import { send } from '@modules/Core/Utils/telegram'

type TelegramMessage = {
  allowed: boolean
  chatId: string
  text: string
}

export class TelegramBus extends NotificationBus {
  private BOT_TOKEN: string

  public constructor() {
    super()

    this.BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!
  }

  public notify(notifications: Notification[]): Promise<void> {
    const messages = this.prepareMessages(notifications)
    return this.send(messages)
  }

  private prepareMessages(notifications: Notification[]) {
    return notifications
      .map((notification) => {
        return {
          allowed: notification.user.telegramNotificationsEnabled,
          chatId: notification.user?.telegramId,
          text: this.formatMessage(notification),
        }
      })
      .filter(
        (message) => message.chatId && message.allowed
      ) as TelegramMessage[]
  }

  private formatMessage(notification: Notification) {
    let emoji = '🔔'

    switch (notification.type) {
      case 'announcement':
        emoji = '📢'
        break
      case 'warning':
        emoji = '⚠️'
        break
      case 'maintenance':
        emoji = '🔧'
        break
      case 'mentor-assigned':
        emoji = '👤'
        break
      case 'mentor-removed':
        emoji = '👤❌'
        break
      case 'new-feature':
        emoji = '🆕'
        break
      case 'poll-answered':
        emoji = '📊'
        break
      case 'work-checked':
        emoji = '📝'
        break
      case 'work-made':
        emoji = '📝'
        break
      case 'work-transferred':
        emoji = '🔄'
        break
      case 'welcome':
        emoji = '👋'
        break
      case 'other':
      default:
        emoji = '🔔'
        break
    }

    return `${emoji} *${notification.title}*\n${notification.message}`
  }

  private async send(messages: TelegramMessage[]) {
    for (const message of messages) {
      try {
        await send(message.chatId, message.text, this.BOT_TOKEN)
      } catch (error) {}
    }
  }
}
