import Dates from '@modules/Core/Utils/date'

export const config = {
  version: '3.4.2',
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
  database: {
    debug: process.env.DB_DEBUG === 'true',
    charsets: {
      withEmoji: 'utf8mb4',
      default: 'utf8',
    },
    collations: {
      withEmoji: 'utf8mb4_bin',
      default: 'utf8_general_ci',
    },
  },
  heapdumpPath: 'uploads/heapdumps',
} as const
