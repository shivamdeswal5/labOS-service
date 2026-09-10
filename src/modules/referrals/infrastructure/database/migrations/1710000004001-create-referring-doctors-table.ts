import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReferringDoctorsTable1710000004001 implements MigrationInterface {
  name = 'CreateReferringDoctorsTable1710000004001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "referring_doctors" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "lab_id" uuid NOT NULL,
        "name" text NOT NULL,
        "clinic" text,
        "phone" varchar(20),
        "email" varchar(255),
        "commission_type" smallint NOT NULL DEFAULT 0,
        "commission_value" numeric(10,2) NOT NULL DEFAULT 0,
        "notes" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_referring_doctors_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_referring_doctors_lab_id" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS "IDX_referring_doctors_lab_id_name" ON "referring_doctors" ("lab_id", "name");
      CREATE INDEX IF NOT EXISTS "IDX_referring_doctors_lab_id_phone" ON "referring_doctors" ("lab_id", "phone");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "referring_doctors";
    `);
  }
}
