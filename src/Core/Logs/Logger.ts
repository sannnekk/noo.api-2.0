import winston from 'winston'

type LogLevel = 'info' | 'error' | 'warn' | 'debug'

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: process.env.LOG_ERROR_FILE,
      level: 'error',
      dirname: process.env.LOG_DIR,
      maxsize: 5 * 1024 * 1024, // 5MB
    }),
    new winston.transports.File({
      filename: process.env.LOG_DEBUG_FILE,
      level: 'debug',
      dirname: process.env.LOG_DIR,
      maxsize: 5 * 1024 * 1024, // 5MB
    }),
    new winston.transports.File({
      filename: process.env.LOG_COMBINED_FILE,
      dirname: process.env.LOG_DIR,
      maxsize: 5 * 1024 * 1024, // 5MB
    }),
  ],
})

if (process.env.APP_ENV === 'dev') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  )
}

function log(level: LogLevel, data: object | string) {
  logger.log(level, data)
}

export default log
