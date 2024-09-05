import { send } from '../Utils/telegram.js';
async function telegramLog(id, level, data) {
    const token = process.env.LOG_TELEGRAM_BOT_TOKEN;
    if (!token) {
        return;
    }
    const chatId = process.env.LOG_TELEGRAM_CHAT_ID;
    const eleonorChatId = process.env.LOG_TELEGRAM_ELEONOR_CHAT_ID;
    if (!chatId) {
        return;
    }
    if (data instanceof Error) {
        data = data.stack ? data.message + '\n' + data.stack : data.message;
    }
    else if (typeof data === 'object') {
        data = JSON.stringify(data, null, 2);
    }
    else {
        data = String(data);
    }
    let levelEmoji = '';
    switch (level) {
        case 'error':
            levelEmoji = '❌';
            break;
        case 'debug':
            levelEmoji = '🐛';
            break;
    }
    if (data.length > 3500) {
        data = data.slice(0, 3500);
    }
    const message = level === 'crm'
        ? `*Message: ${id}*\n\n\`\`\`\n${data}\`\`\``
        : `*Error Id: ${id}*\nLevel: ${levelEmoji}\n\n\`\`\`\n${data}\`\`\``;
    await send(chatId, message, token);
    if (level === 'crm' && eleonorChatId) {
        await send(eleonorChatId, message, token);
    }
}
export default telegramLog;
