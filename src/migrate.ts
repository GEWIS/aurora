import './env';
import dataSource from './database';
import logger from './logger';

export default async function migrate(fake: boolean) {
  logger.info('Starting migrations');
  await dataSource.initialize();

  try {
    await dataSource.runMigrations({ transaction: 'all', fake });
    logger.info('Migrations complete');
  } catch (e) {
    logger.error(e, 'Migration failed');
  } finally {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  const fake = process.argv.includes('--fake') || process.argv.includes('-f');
  migrate(fake);
}
