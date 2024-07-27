import Dates from '@modules/Core/Utils/date'

export const config = {
  version: '2.1.0',
  changelogPath: 'changelog.json',
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
