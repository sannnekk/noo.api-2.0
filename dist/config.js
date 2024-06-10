import Dates from './Core/Utils/date.js';
export const config = {
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
