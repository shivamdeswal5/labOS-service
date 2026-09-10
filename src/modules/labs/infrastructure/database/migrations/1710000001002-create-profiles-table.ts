import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateProfilesTable1710000001002 implements MigrationInterface {
  name = 'CreateProfilesTable1710000001002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "profiles" (
        "id" uuid NOT NULL,
        "lab_id" uuid NOT NULL,
        "full_name" text NOT NULL,
        "role" smallint NOT NULL DEFAULT 1,
        "qualification" varchar(100),
        "signature_url" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_profiles_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_profiles_lab_id" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS "IDX_profiles_lab_id" ON "profiles" ("lab_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "profiles";
    `);
  }
}
