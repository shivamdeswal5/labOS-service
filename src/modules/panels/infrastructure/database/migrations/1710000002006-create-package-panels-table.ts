import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePackagePanelsTable1710000002006 implements MigrationInterface {
  name = 'CreatePackagePanelsTable1710000002006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "package_panels" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "package_id" uuid NOT NULL,
        "panel_id" uuid NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_package_panels_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_package_panels_package_id" FOREIGN KEY ("package_id") REFERENCES "test_packages"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_package_panels_panel_id" FOREIGN KEY ("panel_id") REFERENCES "test_panels"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "package_panels";
    `);
  }
}
