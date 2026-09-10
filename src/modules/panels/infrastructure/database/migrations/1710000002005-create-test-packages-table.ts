import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTestPackagesTable1710000002005 implements MigrationInterface {
  name = 'CreateTestPackagesTable1710000002005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "test_packages" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "lab_id" uuid NOT NULL,
        "name" text NOT NULL,
        "description" text,
        "price" numeric(10,2) NOT NULL DEFAULT '0.00',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_test_packages_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_test_packages_lab_id" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "test_packages";
    `);
  }
}
