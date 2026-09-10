import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePanelTemplatesTable1710000002001 implements MigrationInterface {
  name = 'CreatePanelTemplatesTable1710000002001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "panel_templates" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "category" text NOT NULL,
        "description" text,
        "default_price" numeric(10,2) NOT NULL DEFAULT '0.00',
        "template_data" jsonb NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_panel_templates_id" PRIMARY KEY ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "panel_templates";
    `);
  }
}
