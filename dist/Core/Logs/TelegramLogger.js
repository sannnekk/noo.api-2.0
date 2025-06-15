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
    const mashaChatId = process.env.LOG_TELEGRAM_MASHA_CHAT_ID;
    if (!chatId) {
        return;
    }
    if (typeof data === 'object') {
        let result = JSON.stringify(data, null, 2);
        if (result.length > 3750) {
            result = JSON.stringify(data);
        }
        if ('query' in data) {
            const query = data.query.slice(0, 1000);
            const code = data.code || 'Unknwown error';
            const sqlMessage = data.sqlMessage
                ? data.sqlMessage.slice(0, 1000)
                : 'Unknown sql...';
            result = `Query: ${query}\n\nCode: ${code}\n\nSQL Message: ${sqlMessage}`;
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
    try {
        await send(chatId, message, token);
        if (mashaChatId) {
            await send(mashaChatId, message, token);
        }
    }
    catch (error) {
        // eslint-disable-next-line no-console
        console.log('Telegram log error:', error);
    }
}
export default telegramLog;
