/*
 * All the dates on the backend are in UTC
 *
 */
function toISOString(date) {
    return date.toISOString();
}
function fromISOString(date) {
    return new Date(date);
}
function isISOString(dateStr) {
    return /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(dateStr);
}
function compare(a, b, precision = 'day') {
    const aCopy = new Date(a);
    const bCopy = new Date(b);
    if (precision === 'day') {
        aCopy.setHours(0, 0, 0, 0);
        bCopy.setHours(0, 0, 0, 0);
    }
    else if (precision === 'hour') {
        aCopy.setMinutes(0, 0, 0);
        bCopy.setMinutes(0, 0, 0);
    }
    else if (precision === 'minute') {
        aCopy.setSeconds(0, 0);
        bCopy.setSeconds(0, 0);
    }
    else if (precision === 'second') {
        aCopy.setMilliseconds(0);
        bCopy.setMilliseconds(0);
    }
    return aCopy.getTime() - bCopy.getTime();
}
function isInFuture(date, precision = 'day') {
    return compare(date, new Date(), precision) > 0;
}
function isInPast(date, precision = 'day') {
    return compare(date, new Date(), precision) < 0;
}
function isInLast(date, ms) {
    return compare(new Date(), date, 'millisecond') < ms;
}
function now() {
    return new Date();
}
function addDays(date, days) {
    date.setDate(date.getDate() + days);
    return date;
}
function format(date, formatStr) {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const seconds = ('0' + date.getSeconds()).slice(-2);
    return formatStr
        .replace('YYYY', year.toString())
        .replace('MM', month)
        .replace('DD', day)
        .replace('HH', hours)
        .replace('mm', minutes)
        .replace('ss', seconds);
}
export default {
    toISOString,
    fromISOString,
    isISOString,
    compare,
    isInFuture,
    isInPast,
    now,
    addDays,
    isInLast,
    format,
};
