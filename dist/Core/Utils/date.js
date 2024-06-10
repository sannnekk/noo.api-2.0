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
    if (precision === 'day') {
        a.setHours(0, 0, 0, 0);
        b.setHours(0, 0, 0, 0);
    }
    else if (precision === 'hour') {
        a.setMinutes(0, 0, 0);
        b.setMinutes(0, 0, 0);
    }
    else if (precision === 'minute') {
        a.setSeconds(0, 0);
        b.setSeconds(0, 0);
    }
    else if (precision === 'second') {
        a.setMilliseconds(0);
        b.setMilliseconds(0);
    }
    return a.getTime() - b.getTime();
}
function isInFuture(date) {
    return compare(date, new Date()) > 0;
}
function isInPast(date) {
    return compare(date, new Date()) < 0;
}
function now() {
    return new Date();
}
function addDays(date, days) {
    date.setDate(date.getDate() + days);
    return date;
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
};
