import { MigrationInterface, QueryRunner } from 'typeorm';

const OLD_KEY = 'Poster.BorrelModePresent';
const NEW_KEY = 'BorrelModePresent';

export class BorrelModeSettingMigration1791849600000 implements MigrationInterface {
  name = 'BorrelModeSettingMigration1791849600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.renameKey(queryRunner, OLD_KEY, NEW_KEY);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await this.renameKey(queryRunner, NEW_KEY, OLD_KEY);
  }

  /**
   * Move the stored value to another key.
   */
  private async renameKey(queryRunner: QueryRunner, from: string, to: string): Promise<void> {
    const rows = await queryRunner.query('SELECT `id` FROM `server_setting` WHERE `key` = ?', [
      from,
    ]);
    if (rows.length === 0) return;
    await queryRunner.query('DELETE FROM `server_setting` WHERE `key` = ?', [to]);
    await queryRunner.query('UPDATE `server_setting` SET `key` = ? WHERE `key` = ?', [to, from]);
  }
}
