import Dates from './Core/Utils/date.js';
export const config = {
    version: '2.1.0',
    changelogPath: 'changelog.json',
    expressJson: {
        limit: process.env.MAX_REQUEST_SIZE,
        reviver: (_, value) => {
            if (Dates.isISOString(value)) {
                return Dates.fromISOString(value);
            }
            return value;
        },
    },
    expressUrlencoded: { extended: true, limit: process.env.MAX_REQUEST_SIZE },
};
