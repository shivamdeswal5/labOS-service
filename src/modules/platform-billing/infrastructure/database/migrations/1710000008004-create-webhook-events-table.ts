import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateWebhookEventsTable1710000008004 implements MigrationInterface {
  name = 'CreateWebhookEventsTable1710000008004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "webhook_events" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "event_id" varchar(100) NOT NULL,
        "provider" varchar(30) NOT NULL,
        "event_type" varchar(100) NOT NULL,
        "payload" jsonb NOT NULL,
        "status" varchar(30) NOT NULL DEFAULT 'PENDING',
        "error_message" text,
        "processed_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_webhook_events_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_webhook_events_event_id" UNIQUE ("event_id")
      );

      CREATE INDEX IF NOT EXISTS "IDX_webhook_events_event_id" ON "webhook_events" ("event_id");
      CREATE INDEX IF NOT EXISTS "IDX_webhook_events_status" ON "webhook_events" ("status");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "webhook_events";
    `);
  }
}
