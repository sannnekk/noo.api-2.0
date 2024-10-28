import Dates from '../Utils/date.js';
function logConsole(level, id, data, context) {
    const logData = {
        level,
        id,
        path: context?.path,
        method: context?.method,
        data,
    };
    const datetime = Dates.format(new Date(), 'YYYY-MM-DD HH:mm:ss');
    // eslint-disable-next-line no-console
    console.log(`\x1b[34m${datetime}\x1b[0m`, JSON.stringify(logData, null, 2));
}
export default logConsole;
