import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScenesMigration1789823036614 implements MigrationInterface {
  name = 'ScenesMigration1789823036614';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`lights_scene_effect\` DROP FOREIGN KEY \`FK_b6f3eacffe9b32448e618ab569e\``,
    );
    // MODIFY instead of the generated DROP/ADD COLUMN, so existing scene effects keep their props
    await queryRunner.query(
      `ALTER TABLE \`lights_scene_effect\` MODIFY \`effectProps\` text NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`lights_scene_effect\` ADD CONSTRAINT \`FK_b6f3eacffe9b32448e618ab569e\` FOREIGN KEY (\`sceneId\`) REFERENCES \`lights_scene\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`lights_scene_effect\` DROP FOREIGN KEY \`FK_b6f3eacffe9b32448e618ab569e\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`lights_scene_effect\` MODIFY \`effectProps\` varchar(255) NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE \`lights_scene_effect\` ADD CONSTRAINT \`FK_b6f3eacffe9b32448e618ab569e\` FOREIGN KEY (\`sceneId\`) REFERENCES \`lights_scene\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
