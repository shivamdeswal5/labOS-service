import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTenantSubscriptionsTable1710000008002 implements MigrationInterface {
  name = 'CreateTenantSubscriptionsTable1710000008002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tenant_subscriptions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "lab_id" uuid NOT NULL,
        "plan_id" uuid NOT NULL,
        "status" varchar(30) NOT NULL DEFAULT 'TRIALING',
        "billing_cycle" varchar(20) NOT NULL DEFAULT 'MONTHLY',
        "trial_start" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "trial_end" TIMESTAMP WITH TIME ZONE NOT NULL,
        "current_period_start" TIMESTAMP WITH TIME ZONE,
        "current_period_end" TIMESTAMP WITH TIME ZONE,
        "grace_period_end" TIMESTAMP WITH TIME ZONE,
        "custom_entitlement_overrides" jsonb DEFAULT '{}',
        "canceled_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_tenant_subscriptions_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tenant_subscriptions_lab_id" UNIQUE ("lab_id"),
        CONSTRAINT "FK_tenant_subscriptions_lab_id" FOREIGN KEY ("lab_id") REFERENCES "labs"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_tenant_subscriptions_plan_id" FOREIGN KEY ("plan_id") REFERENCES "platform_plans"("id") ON DELETE RESTRICT
      );

      CREATE INDEX IF NOT EXISTS "IDX_tenant_subscriptions_lab_id" ON "tenant_subscriptions" ("lab_id");
      CREATE INDEX IF NOT EXISTS "IDX_tenant_subscriptions_status" ON "tenant_subscriptions" ("status");
      CREATE INDEX IF NOT EXISTS "IDX_tenant_subscriptions_current_period_end" ON "tenant_subscriptions" ("current_period_end");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "tenant_subscriptions";
    `);
  }
}
