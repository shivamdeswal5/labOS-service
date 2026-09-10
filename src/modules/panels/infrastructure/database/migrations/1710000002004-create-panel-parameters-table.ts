import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePanelParametersTable1710000002004 implements MigrationInterface {
  name = 'CreatePanelParametersTable1710000002004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "panel_parameters" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "section_id" uuid NOT NULL,
        "name" text NOT NULL,
        "name_local" text,
        "unit" varchar(50),
        "input_type" smallint NOT NULL DEFAULT 1,
        "options" jsonb,
        "method" text,
        "normal_range" jsonb,
        "sort_order" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_panel_parameters_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_panel_parameters_section_id" FOREIGN KEY ("section_id") REFERENCES "panel_sections"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "panel_parameters";
    `);
  }
}
