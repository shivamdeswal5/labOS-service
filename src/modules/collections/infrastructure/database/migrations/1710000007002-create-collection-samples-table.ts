import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCollectionSamplesTable1710000007002
  implements MigrationInterface
{
  name = 'CreateCollectionSamplesTable1710000007002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "collection_samples" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "collection_request_id" uuid NOT NULL,
        "tube_type" varchar(50) NOT NULL DEFAULT 'EDTA',
        "barcode" varchar(100) NOT NULL,
        "notes" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_collection_samples_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_collection_samples_collection_request_id" FOREIGN KEY ("collection_request_id") REFERENCES "collection_requests"("id") ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS "IDX_collection_samples_collection_request_id" ON "collection_samples" ("collection_request_id");
      CREATE INDEX IF NOT EXISTS "IDX_collection_samples_barcode" ON "collection_samples" ("barcode");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "collection_samples";
    `);
  }
}
