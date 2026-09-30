import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPrintSettingsToLabs1710000001003 implements MigrationInterface {
  name = 'AddPrintSettingsToLabs1710000001003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "labs"
      ADD COLUMN IF NOT EXISTS "print_settings" jsonb DEFAULT '{"stationeryType":"PLAIN","headerMarginMm":48,"footerMarginMm":24}';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "labs"
      DROP COLUMN IF EXISTS "print_settings";
    `);
  }
}
