import 'reflect-metadata';
import type { DataSource } from 'typeorm';
import logger from './logger';
import { getDataSource } from './database';

/**
 * Check for and execute any pending migrations. Skipped for SQLite and
 * synchronized databases, as the migrations are written for MySQL/MariaDB.
 */
export async function runPendingMigrations(dataSource: DataSource): Promise<void> {
  if (process.env.TYPEORM_MIGRATIONS_RUN === 'false') {
    logger.info('Skipping migrations (TYPEORM_MIGRATIONS_RUN=false)');
    return;
  }
  if (dataSource.options.synchronize) {
    logger.info('Skipping migrations (TYPEORM_SYNCHRONIZE=true)');
    return;
  }
  if (dataSource.options.type === 'sqlite') {
    logger.info('Skipping migrations (SQLite database)');
    return;
  }

  const pending = await dataSource.showMigrations();
  if (!pending) {
    logger.info('Database schema up to date');
    return;
  }

  logger.info('Pending migrations found, running migrations...');
  const executed = await dataSource.runMigrations({ transaction: 'all' });
  executed.forEach((m) => logger.info(`Executed migration ${m.name}`));
  logger.info(`Finished running ${executed.length} migration(s)`);
}

if (require.main === module) {
  (async () => {
    const dataSource = await getDataSource().initialize();
    try {
      await runPendingMigrations(dataSource);
    } finally {
      await dataSource.destroy();
    }
  })().catch((e) => {
    logger.fatal(e);
    process.exitCode = 1;
    logger.flush(() => process.exit());
  });
}
