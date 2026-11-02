import { NotificationBus } from './NotificationBus.js';
import { log } from '../../../Core/Logs/Logger.js';
export class ProxyTelegramBus extends NotificationBus {
    PROXY_TOKEN;
    PROXY_URL = 'https://bot.noocurator.ru/api/platform/events';
    constructor() {
        super();
        this.PROXY_TOKEN = process.env.PROXY_TELEGRAM_BOT_TOKEN;
    }
    notify(notifications) {
        const messages = this.prepareMessages(notifications);
        return this.send(messages);
    }
    prepareMessages(notifications) {
        return notifications
            .map((notification) => {
            return {
                id: notification.id,
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
        return `${emoji} <b>${notification.title}</b>\n${notification.message}`;
    }
    async send(messages) {
        for (const message of messages) {
            try {
                const response = await fetch(this.PROXY_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Token': this.PROXY_TOKEN,
                    },
                    body: JSON.stringify({
                        id: message.id,
                        receiverId: message.chatId,
                        body: { text: message.text, parse_mode: 'HTML' },
                    }),
                });
                if (!response.ok) {
                    log('warning', 'ProxyTelegramBus', {
                        notificationId: message.id,
                        status: response.status,
                        response: await response.text().catch(() => ''),
                    });
                }
            }
            catch (error) {
                log('warning', 'ProxyTelegramBus', {
                    notificationId: message.id,
                    error: String(error),
                });
            }
        }
    }
}
