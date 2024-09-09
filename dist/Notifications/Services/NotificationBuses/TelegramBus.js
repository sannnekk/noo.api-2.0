import { NotificationBus } from './NotificationBus.js';
import { send } from '../../../Core/Utils/telegram.js';
export class TelegramBus extends NotificationBus {
    BOT_TOKEN;
    constructor() {
        super();
        this.BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    }
    notify(notifications) {
        const messages = this.prepareMessages(notifications);
        return this.send(messages);
    }
    prepareMessages(notifications) {
        return notifications
            .map((notification) => {
            return {
                allowed: notification.user.telegramNotificationsEnabled,
                chatId: notification.user?.telegramId,
                text: this.formatMessage(notification),
            };
        })
            .filter((message) => message.chatId && message.allowed);
    }
    formatMessage(notification) {
        let emoji = '🔔';
        switch (notification.type) {
            case 'announcement':
                emoji = '📢';
                break;
            case 'warning':
                emoji = '⚠️';
                break;
            case 'maintenance':
                emoji = '🔧';
                break;
            case 'mentor-assigned':
                emoji = '👤';
                break;
            case 'mentor-removed':
                emoji = '👤❌';
                break;
            case 'new-feature':
                emoji = '🆕';
                break;
            case 'poll-answered':
                emoji = '📊';
                break;
            case 'work-checked':
                emoji = '📝';
                break;
            case 'work-made':
                emoji = '📝';
                break;
            case 'work-transferred':
                emoji = '🔄';
                break;
            case 'welcome':
                emoji = '👋';
                break;
            case 'other':
            default:
                emoji = '🔔';
                break;
        }
        return `
      ${emoji} <b>${notification.title}</b>\n${notification.message}
    `;
    }
    async send(messages) {
        for (const message of messages) {
            try {
                await send(message.chatId, message.text, this.BOT_TOKEN);
            }
            catch (error) { }
        }
    }
}
