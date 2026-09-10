import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCollectionRequestsTable1710000007001
  implements MigrationInterface
{
  name = 'CreateCollectionRequestsTable1710000007001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "collection_requests" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "lab_id" uuid NOT NULL,
        "request_number" varchar(50) NOT NULL,
        "patient_id" uuid,
        "patient_name" text NOT NULL,
        "patient_phone" varchar(20) NOT NULL,
        "patient_age" text,
        "patient_sex" smallint NOT NULL DEFAULT 0,
        "address" text NOT NULL,
        "preferred_date" date NOT NULL,
        "time_slot" varchar(50) NOT NULL,
        "status" smallint NOT NULL DEFAULT 0,
        "assigned_phlebotomist_id" uuid,
        "assigned_phlebotomist_name" text,
        "is_fasting_required" boolean NOT NULL DEFAULT false,
        "test_names" jsonb NOT NULL DEFAULT '[]',
        "special_instructions" text,
        "cancellation_reason" text,
        "collected_at" TIMESTAMP WITH TIME ZONE,
        "delivered_to_lab_at" TIMESTAMP WITH TIME ZONE,
        "report_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_collection_requests_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_collection_requests_lab_id" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_collection_requests_patient_id" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_collection_requests_report_id" FOREIGN KEY ("report_id") REFERENCES "reports"("id") ON DELETE SET NULL
      );

      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_collection_requests_lab_id_request_number" ON "collection_requests" ("lab_id", "request_number");
      CREATE INDEX IF NOT EXISTS "IDX_collection_requests_lab_id_preferred_date" ON "collection_requests" ("lab_id", "preferred_date");
      CREATE INDEX IF NOT EXISTS "IDX_collection_requests_lab_id_status" ON "collection_requests" ("lab_id", "status");
      CREATE INDEX IF NOT EXISTS "IDX_collection_requests_lab_id_assigned_phlebotomist_id" ON "collection_requests" ("lab_id", "assigned_phlebotomist_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "collection_requests";
    `);
  }
}
