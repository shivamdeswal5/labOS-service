import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLabsTable1710000001001 implements MigrationInterface {
  name = 'CreateLabsTable1710000001001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "labs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "address" text NOT NULL,
        "phone_numbers" text[] NOT NULL DEFAULT '{}',
        "logo_url" text,
        "accent_color" varchar(10) NOT NULL DEFAULT '#0f172a',
        "tagline" text,
        "footer_note" text DEFAULT 'NOT VALID FOR MEDICO LEGAL PURPOSE',
        "report_language" varchar(10) NOT NULL DEFAULT 'en',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_labs_id" PRIMARY KEY ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "labs";
    `);
  }
}
