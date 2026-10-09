import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlatformPaymentsTable1710000008003 implements MigrationInterface {
  name = 'CreatePlatformPaymentsTable1710000008003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_payments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "lab_id" uuid NOT NULL,
        "subscription_id" uuid,
        "provider" varchar(30) NOT NULL,
        "provider_order_id" varchar(100),
        "provider_payment_id" varchar(100),
        "amount_in_paise" integer NOT NULL,
        "currency" varchar(10) NOT NULL DEFAULT 'INR',
        "status" varchar(30) NOT NULL DEFAULT 'PENDING',
        "payment_method" varchar(50),
        "payment_details" jsonb DEFAULT '{}',
        "idempotency_key" varchar(100),
        "failure_reason" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_platform_payments_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_platform_payments_idempotency_key" UNIQUE ("idempotency_key"),
        CONSTRAINT "FK_platform_payments_lab_id" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_platform_payments_subscription_id" FOREIGN KEY ("subscription_id") REFERENCES "tenant_subscriptions"("id") ON DELETE SET NULL
      );

      CREATE INDEX IF NOT EXISTS "IDX_platform_payments_lab_id" ON "platform_payments" ("lab_id");
      CREATE INDEX IF NOT EXISTS "IDX_platform_payments_provider_order_id" ON "platform_payments" ("provider_order_id");
      CREATE INDEX IF NOT EXISTS "IDX_platform_payments_provider_payment_id" ON "platform_payments" ("provider_payment_id");
      CREATE INDEX IF NOT EXISTS "IDX_platform_payments_status_created_at" ON "platform_payments" ("status", "created_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "platform_payments";
    `);
  }
}
