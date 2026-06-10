import { MigrationInterface, QueryRunner } from 'typeorm';
import { lookup } from 'mime-types';
import { DiskStorage } from '../modules/files/storage';
import logger from '../logger';

export class PosterMigration1781087463209 implements MigrationInterface {
  name = 'PosterMigration1781087463209';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`poster\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`enabled\` tinyint NOT NULL DEFAULT 1, \`label\` varchar(255) NULL, \`startDate\` datetime NULL, \`expirationDate\` datetime NULL, \`accentColor\` varchar(255) NULL, \`protected\` tinyint NOT NULL DEFAULT 0, \`borrelMode\` tinyint NOT NULL DEFAULT 0, \`footerSize\` varchar(255) NOT NULL DEFAULT 'full', \`defaultTimeout\` int NOT NULL DEFAULT '15', \`uri\` varchar(255) NULL, \`albums\` text NULL, \`trello\` tinyint NOT NULL DEFAULT 0, \`trelloCardId\` text NULL, \`trelloLastActivity\` text NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`carousel\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`active\` tinyint NOT NULL DEFAULT 1, \`posterOrder\` text NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`poster_files_file\` (\`posterId\` int NOT NULL, \`fileId\` int NOT NULL, INDEX \`IDX_b19b6773fc34c90a859006b2fa\` (\`posterId\`), INDEX \`IDX_445c020e803ef2f8d6778588ac\` (\`fileId\`), PRIMARY KEY (\`posterId\`, \`fileId\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`poster_files_file\` ADD CONSTRAINT \`FK_b19b6773fc34c90a859006b2fab\` FOREIGN KEY (\`posterId\`) REFERENCES \`poster\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE \`poster_files_file\` ADD CONSTRAINT \`FK_445c020e803ef2f8d6778588ac9\` FOREIGN KEY (\`fileId\`) REFERENCES \`file\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
    );

    await this.migrateLocalPosters(queryRunner);

    await queryRunner.query(
      `ALTER TABLE \`local_poster\` DROP FOREIGN KEY \`FK_148ccb05f5a86819c7dae1c03d5\``,
    );
    await queryRunner.query(`DROP INDEX \`REL_148ccb05f5a86819c7dae1c03d\` ON \`local_poster\``);
    await queryRunner.query(`DROP TABLE \`local_poster\``);
  }

  /**
   * Convert every local_poster row into a poster row. Media files are moved on disk
   * to the posters storage directory and get a fresh file record; external posters
   * keep their uri. Migrated posters start disabled.
   */
  private async migrateLocalPosters(queryRunner: QueryRunner): Promise<void> {
    const rows: {
      id: number;
      uri: string | null;
      fileId: number | null;
      relativeDirectory: string | null;
      name: string | null;
      originalName: string | null;
    }[] = await queryRunner.query(
      `SELECT lp.\`id\`, lp.\`uri\`, f.\`id\` AS \`fileId\`, f.\`relativeDirectory\`, f.\`name\`, f.\`originalName\`
       FROM \`local_poster\` lp LEFT JOIN \`file\` f ON f.\`id\` = lp.\`fileId\``,
    );
    if (rows.length === 0) return;

    const storage = new DiskStorage('posters');
    let migrated = 0;

    for (const row of rows) {
      try {
        if (row.fileId != null) {
          const oldFile = {
            relativeDirectory: row.relativeDirectory!,
            name: row.name!,
            originalName: row.originalName!,
          };
          const sourceStorage = new DiskStorage(
            oldFile.relativeDirectory.replace(/^public[\\/]/, ''),
          );
          const data = await sourceStorage.getFile(oldFile);

          const fileParams = await storage.saveFile(oldFile.originalName, data);
          const fileInsert = await queryRunner.query(
            `INSERT INTO \`file\` (\`relativeDirectory\`, \`name\`, \`originalName\`) VALUES (?, ?, ?)`,
            [fileParams.relativeDirectory, fileParams.name, fileParams.originalName],
          );

          const mimeType = lookup(oldFile.originalName);
          const posterType = mimeType && mimeType.startsWith('video/') ? 'video' : 'img';
          const posterInsert = await queryRunner.query(
            `INSERT INTO \`poster\` (\`name\`, \`type\`, \`enabled\`) VALUES (?, ?, 0)`,
            [oldFile.originalName, posterType],
          );
          await queryRunner.query(
            `INSERT INTO \`poster_files_file\` (\`posterId\`, \`fileId\`) VALUES (?, ?)`,
            [posterInsert.insertId, fileInsert.insertId],
          );

          await sourceStorage.deleteFile(oldFile);
          await queryRunner.query(`DELETE FROM \`file\` WHERE \`id\` = ?`, [row.fileId]);
        } else if (row.uri) {
          await queryRunner.query(
            `INSERT INTO \`poster\` (\`name\`, \`type\`, \`enabled\`, \`uri\`) VALUES (?, 'extern', 0, ?)`,
            [row.uri, row.uri],
          );
        } else {
          logger.warn(`Skipping local poster ${row.id}: it has neither a file nor a uri.`);
          continue;
        }
        migrated += 1;
      } catch (error) {
        logger.error(`Failed to migrate local poster ${row.id}: ${error}`);
      }
    }

    logger.info(`Migrated ${migrated} local poster(s) to posters.`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Schema-only reversal: posters migrated from local_poster are not converted back.
    await queryRunner.query(
      `ALTER TABLE \`poster_files_file\` DROP FOREIGN KEY \`FK_445c020e803ef2f8d6778588ac9\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`poster_files_file\` DROP FOREIGN KEY \`FK_b19b6773fc34c90a859006b2fab\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_445c020e803ef2f8d6778588ac\` ON \`poster_files_file\``,
    );
    await queryRunner.query(
      `DROP INDEX \`IDX_b19b6773fc34c90a859006b2fa\` ON \`poster_files_file\``,
    );
    await queryRunner.query(`DROP TABLE \`poster_files_file\``);
    await queryRunner.query(`DROP TABLE \`carousel\``);
    await queryRunner.query(`DROP TABLE \`poster\``);
    await queryRunner.query(
      `CREATE TABLE \`local_poster\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`uri\` varchar(255) NULL, \`fileId\` int NULL, UNIQUE INDEX \`REL_148ccb05f5a86819c7dae1c03d\` (\`fileId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`local_poster\` ADD CONSTRAINT \`FK_148ccb05f5a86819c7dae1c03d5\` FOREIGN KEY (\`fileId\`) REFERENCES \`file\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }
}
