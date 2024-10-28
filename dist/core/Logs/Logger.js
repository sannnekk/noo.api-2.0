import logConsole from './ConsoleLogger.js';
import logFile from './FileLogger.js';
import logTelegram from './TelegramLogger.js';
export function log(level, id, data, context) {
    if (process.env.LOG_MODE === 'console') {
        // eslint-disable-next-line no-console
        logConsole(level, id, data, context);
        return;
    }
    if (process.env.LOG_MODE === 'file') {
        logFile(level, data);
        return;
    }
    if (process.env.LOG_MODE === 'telegram') {
        logTelegram(id, level, data, context);
        return;
    }
}
