import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReportValuesTable1710000003004 implements MigrationInterface {
  name = 'CreateReportValuesTable1710000003004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "report_values" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "report_id" uuid NOT NULL,
        "parameter_id" uuid NOT NULL,
        "value" text NOT NULL,
        "is_out_of_range" boolean NOT NULL DEFAULT false,
        "remarks" text,
        CONSTRAINT "PK_report_values_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_report_values_report_id" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_report_values_parameter_id" FOREIGN KEY ("parameter_id") REFERENCES "panel_parameters"("id") ON DELETE RESTRICT
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_report_values_report_id_parameter_id" ON "report_values" ("report_id", "parameter_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "report_values";
    `);
  }
}
