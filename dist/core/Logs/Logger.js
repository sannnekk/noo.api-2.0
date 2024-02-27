import fs from 'fs';
import path from 'path';
const logFile = `${new Date().toUTCString()}.txt`;
const logFolder = path.join(process.cwd(), logFile);
function log(data) {
    fs.appendFile(logFolder, toLog(data), (err) => { });
}
function toLog(data) {
    const str = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;
    return `${new Date().toUTCString()}: ${str}`;
}
export { log };
