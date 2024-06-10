import Dates from '@modules/Core/Utils/date'

export const config = {
  expressJson: {
    limit: process.env.MAX_REQUEST_SIZE,
    reviver: (_: never, value: any) => {
      if (Dates.isISOString(value)) {
        return Dates.fromISOString(value)
      }

      return value
    },
  },
  expressUrlencoded: { extended: true, limit: process.env.MAX_REQUEST_SIZE },
}
