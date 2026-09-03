import { MigrationInterface, QueryRunner } from 'typeorm';

export class InfoScreenMigration1786646038522 implements MigrationInterface {
  name = 'InfoScreenMigration1786646038522';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`pc_status\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`pcId\` varchar(255) NOT NULL, \`users\` text NULL, \`remote\` tinyint NOT NULL DEFAULT 0, \`lockedAt\` datetime NULL, \`status\` varchar(255) NOT NULL DEFAULT 'offline', \`overrideState\` varchar(255) NOT NULL DEFAULT 'none', UNIQUE INDEX \`IDX_bae498a3affa96972742f4c207\` (\`pcId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`keyholder\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`isBoard\` tinyint NOT NULL DEFAULT 0, \`isCandidateBoard\` tinyint NOT NULL DEFAULT 0, \`isKeyholder\` tinyint NOT NULL DEFAULT 0, \`photoUrl\` varchar(255) NULL, \`memberId\` int NULL, UNIQUE INDEX \`IDX_d77b1cc8fe4a283a33549c7da1\` (\`memberId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`room_status\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`open\` tinyint NOT NULL DEFAULT 0, \`responsible1\` varchar(255) NULL, \`responsible2\` varchar(255) NULL, \`beerTime\` varchar(255) NULL, \`lastCall\` varchar(255) NULL, \`closedMessage\` varchar(255) NULL, \`coffeeStatus\` int NOT NULL DEFAULT '0', PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`info_screen_layout\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`screenId\` int NOT NULL, \`placements\` text NULL, \`modals\` text NULL, \`background\` varchar(255) NOT NULL DEFAULT 'hexagons', \`backgroundImage\` varchar(255) NOT NULL DEFAULT '', \`backgroundColor\` varchar(255) NOT NULL DEFAULT '#0b1020', \`defaultPanelBackground\` varchar(255) NOT NULL DEFAULT '#374151|50|1|1', UNIQUE INDEX \`IDX_f4fabe606403de76f5c4b72413\` (\`screenId\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`info_layout_preset\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`placements\` text NULL, \`modals\` text NULL, \`background\` varchar(255) NOT NULL DEFAULT 'hexagons', \`backgroundImage\` varchar(255) NOT NULL DEFAULT '', \`backgroundColor\` varchar(255) NOT NULL DEFAULT '#0b1020', \`defaultPanelBackground\` varchar(255) NOT NULL DEFAULT '#374151|50|1|1', UNIQUE INDEX \`IDX_2c4041659d93d03e3ce05ecd2a\` (\`name\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`caller\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`numbers\` text NULL, \`photoUrl\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`conference_room\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`number\` varchar(255) NOT NULL, \`icalUrl\` varchar(255) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`news_source\` (\`id\` int NOT NULL AUTO_INCREMENT, \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`name\` varchar(255) NOT NULL, \`url\` varchar(255) NOT NULL, \`enabled\` tinyint NOT NULL DEFAULT 1, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`news_source\``);
    await queryRunner.query(`DROP TABLE \`conference_room\``);
    await queryRunner.query(`DROP TABLE \`caller\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_2c4041659d93d03e3ce05ecd2a\` ON \`info_layout_preset\``,
    );
    await queryRunner.query(`DROP TABLE \`info_layout_preset\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_f4fabe606403de76f5c4b72413\` ON \`info_screen_layout\``,
    );
    await queryRunner.query(`DROP TABLE \`info_screen_layout\``);
    await queryRunner.query(`DROP TABLE \`room_status\``);
    await queryRunner.query(`DROP INDEX \`IDX_d77b1cc8fe4a283a33549c7da1\` ON \`keyholder\``);
    await queryRunner.query(`DROP TABLE \`keyholder\``);
    await queryRunner.query(`DROP INDEX \`IDX_bae498a3affa96972742f4c207\` ON \`pc_status\``);
    await queryRunner.query(`DROP TABLE \`pc_status\``);
  }
}
