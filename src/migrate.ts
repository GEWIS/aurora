import './env';
import dataSource from './database';
import logger from './logger';

export default async function migrate() {
  logger.info('Starting migrations');
  await dataSource.initialize();

  try {
    await dataSource.runMigrations({ transaction: 'all' });
    logger.info('Migrations complete');
  } catch (e) {
    logger.error(e, 'Migration failed');
  } finally {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  migrate();
}
