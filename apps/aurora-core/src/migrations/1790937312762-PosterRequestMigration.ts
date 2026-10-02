import { MigrationInterface, QueryRunner } from 'typeorm';

export class PosterRequestMigration1790937312762 implements MigrationInterface {
  name = 'PosterRequestMigration1790937312762';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`poster_request\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`requesterName\` varchar(255) NOT NULL, \`requesterEmail\` varchar(255) NOT NULL, \`requesterAssociation\` varchar(255) NULL, \`message\` text NULL, \`name\` varchar(255) NOT NULL, \`type\` varchar(255) NOT NULL, \`label\` varchar(255) NULL, \`startDate\` datetime NULL, \`expirationDate\` datetime NULL, \`accentColor\` varchar(255) NULL, \`footerSize\` varchar(255) NOT NULL DEFAULT 'full', \`defaultTimeout\` int NOT NULL DEFAULT '15', \`borrelMode\` tinyint NOT NULL DEFAULT 0, \`integrationUserId\` int NULL, \`fileId\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`poster_request\` ADD CONSTRAINT \`FK_2f707accceaf03adaa860f4f718\` FOREIGN KEY (\`integrationUserId\`) REFERENCES \`integration_user\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`poster_request\` ADD CONSTRAINT \`FK_f8d0f386d4da87041e88a3fa921\` FOREIGN KEY (\`fileId\`) REFERENCES \`file\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`poster_request\` DROP FOREIGN KEY \`FK_f8d0f386d4da87041e88a3fa921\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`poster_request\` DROP FOREIGN KEY \`FK_2f707accceaf03adaa860f4f718\``,
    );
    await queryRunner.query(`DROP TABLE \`poster_request\``);
  }
}
