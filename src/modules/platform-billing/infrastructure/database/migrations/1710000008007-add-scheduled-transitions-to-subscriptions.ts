import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScheduledTransitionsToSubscriptions1710000008007 implements MigrationInterface {
  name = 'AddScheduledTransitionsToSubscriptions1710000008007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "tenant_subscriptions"
      ADD COLUMN IF NOT EXISTS "scheduled_plan_id" uuid,
      ADD COLUMN IF NOT EXISTS "scheduled_billing_cycle" varchar(20),
      ADD COLUMN IF NOT EXISTS "scheduled_at" TIMESTAMP WITH TIME ZONE,
      ADD COLUMN IF NOT EXISTS "customer_gstin" varchar(15);

      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_tenant_subscriptions_scheduled_plan_id'
        ) THEN
          ALTER TABLE "tenant_subscriptions"
          ADD CONSTRAINT "FK_tenant_subscriptions_scheduled_plan_id"
          FOREIGN KEY ("scheduled_plan_id") REFERENCES "platform_plans"("id") ON DELETE SET NULL;
        END IF;
      END $$;

      CREATE INDEX IF NOT EXISTS "IDX_tenant_subscriptions_scheduled_at"
      ON "tenant_subscriptions" ("scheduled_at");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "IDX_tenant_subscriptions_scheduled_at";

      ALTER TABLE "tenant_subscriptions"
      DROP CONSTRAINT IF EXISTS "FK_tenant_subscriptions_scheduled_plan_id",
      DROP COLUMN IF EXISTS "scheduled_plan_id",
      DROP COLUMN IF EXISTS "scheduled_billing_cycle",
      DROP COLUMN IF EXISTS "scheduled_at",
      DROP COLUMN IF EXISTS "customer_gstin";
    `);
  }
}
