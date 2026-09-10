import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotificationLogsTable1710000006001 implements MigrationInterface {
  name = 'CreateNotificationLogsTable1710000006001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notification_logs" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "lab_id" uuid NOT NULL,
        "recipient_type" smallint NOT NULL DEFAULT 0,
        "recipient_name" text NOT NULL,
        "destination" varchar(255) NOT NULL,
        "channel" smallint NOT NULL DEFAULT 0,
        "notification_type" smallint NOT NULL DEFAULT 0,
        "status" smallint NOT NULL DEFAULT 0,
        "message_content" text NOT NULL,
        "payload" jsonb,
        "provider" varchar(50) NOT NULL DEFAULT 'mock',
        "provider_message_id" varchar(255),
        "sent_at" TIMESTAMP WITH TIME ZONE,
        "delivered_at" TIMESTAMP WITH TIME ZONE,
        "failure_reason" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP WITH TIME ZONE,
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_notification_logs_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_notification_logs_lab_id" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS "IDX_notification_logs_lab_id_created_at" ON "notification_logs" ("lab_id", "created_at");
      CREATE INDEX IF NOT EXISTS "IDX_notification_logs_lab_id_status" ON "notification_logs" ("lab_id", "status");
      CREATE INDEX IF NOT EXISTS "IDX_notification_logs_lab_id_destination" ON "notification_logs" ("lab_id", "destination");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "notification_logs";
    `);
  }
}
