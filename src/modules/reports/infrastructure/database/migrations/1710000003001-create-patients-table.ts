import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePatientsTable1710000003001 implements MigrationInterface {
  name = 'CreatePatientsTable1710000003001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "patients" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "lab_id" uuid NOT NULL,
        "patient_number" varchar(50) NOT NULL,
        "name" text NOT NULL,
        "age" text,
        "date_of_birth" date,
        "sex" smallint NOT NULL DEFAULT 0,
        "phone" varchar(20),
        "address" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_patients_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_patients_lab_id" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_patients_lab_id_patient_number" ON "patients" ("lab_id", "patient_number");
      CREATE INDEX IF NOT EXISTS "IDX_patients_lab_id_phone" ON "patients" ("lab_id", "phone");
      CREATE INDEX IF NOT EXISTS "IDX_patients_lab_id_name" ON "patients" ("lab_id", "name");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "patients";
    `);
  }
}
