import pino, { Logger } from 'pino';

const logger: Logger<'audit'> = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
  level: process.env.LOG_LEVEL || 'info',
  customLevels: {
    audit: 39,
  },
});

export default logger;
