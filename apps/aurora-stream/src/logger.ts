import pino, { Logger } from 'pino';

const devEnv = process.env.NODE_ENV === 'development';

const logger: Logger = pino({
  transport: devEnv ? { target: 'pino-pretty', options: { colorize: true } } : undefined,
  level: process.env.LOG_LEVEL || 'info',
});

export default logger;
