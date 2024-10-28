import { send } from '../Utils/telegram.js';
function prepareMessage(level, id, data, context) {
    if (level === 'crm') {
        return `<b>Message: ${id}</b>\n<pre expandable>${data}</pre>`;
    }
    let levelEmoji = '';
    switch (level) {
        case 'error':
            levelEmoji = '❌';
            break;
        case 'debug':
            levelEmoji = '🐛';
            break;
        case 'info':
            levelEmoji = '📃';
            break;
        case 'warning':
            levelEmoji = '⚠️';
            break;
    }
    let message = `<b>Error Id: ${id}</b>\n`;
    message += `Level: ${levelEmoji}\n`;
    if (context) {
        if (context.method) {
            message += `Method: <i>${context?.method}</i>\n`;
        }
        if (context.path) {
            message += `Route: <i>${context?.path}</i>\n`;
        }
        if (context.credentials) {
            message += `User: <i>${context?.credentials?.username}</i>\n`;
            message += `User role: <i>${context?.credentials?.role}</i>\n`;
        }
    }
    message += '\n';
    message += `<pre expandable>${data}</pre>`;
    return message;
}
async function telegramLog(id, level, data, context) {
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
        let result = JSON.stringify(data, null, 2);
        if (result.length > 3750) {
            result = JSON.stringify(data);
        }
        data = result;
    }
    else {
        data = String(data);
    }
    if (data.length > 3750) {
        data = data.slice(0, 3750);
    }
    data = data
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('&', '&amp;')
        .replaceAll('"', '&quot;')
        .replaceAll('(', '(');
    const message = prepareMessage(level, id, data, context);
    if (level === 'crm' && eleonorChatId) {
        await send(eleonorChatId, message, token);
    }
    else if (level !== 'crm') {
        await send(chatId, message, token);
    }
}
export default telegramLog;
