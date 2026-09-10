import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTestPanelsTable1710000002002 implements MigrationInterface {
  name = 'CreateTestPanelsTable1710000002002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "test_panels" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "lab_id" uuid NOT NULL,
        "name" text NOT NULL,
        "category" text NOT NULL,
        "price" numeric(10,2) NOT NULL DEFAULT '0.00',
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_test_panels_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_test_panels_lab_id" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS "IDX_test_panels_lab_id_category" ON "test_panels" ("lab_id", "category");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "test_panels";
    `);
  }
}
