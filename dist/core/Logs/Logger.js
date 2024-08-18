import logFile from './FileLogger.js';
import logTelegram from './TelegramLogger.js';
export function log(level, id, data) {
    if (process.env.LOG_MODE === 'console') {
        // eslint-disable-next-line no-console
        console.log(data);
        return;
    }
    if (process.env.LOG_MODE === 'file') {
        logFile(level, data);
        return;
    }
    if (process.env.LOG_MODE === 'telegram') {
        logTelegram(id, level, data);
        return;
    }
}
