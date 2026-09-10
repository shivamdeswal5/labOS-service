import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePanelSectionsTable1710000002003 implements MigrationInterface {
  name = 'CreatePanelSectionsTable1710000002003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "panel_sections" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "panel_id" uuid NOT NULL,
        "name" text NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_panel_sections_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_panel_sections_panel_id" FOREIGN KEY ("panel_id") REFERENCES "test_panels"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "panel_sections";
    `);
  }
}
