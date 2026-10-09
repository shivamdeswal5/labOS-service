import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePlatformPlansTable1710000008001 implements MigrationInterface {
  name = 'CreatePlatformPlansTable1710000008001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_plans" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "slug" varchar(50) NOT NULL,
        "name" varchar(100) NOT NULL,
        "description" text,
        "monthly_price_inr" integer NOT NULL,
        "yearly_price_inr" integer NOT NULL,
        "feature_entitlements" jsonb NOT NULL DEFAULT '{}',
        "is_active" boolean NOT NULL DEFAULT true,
        "is_public" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "version" integer NOT NULL DEFAULT 1,
        CONSTRAINT "PK_platform_plans_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_platform_plans_slug" UNIQUE ("slug")
      );

      CREATE INDEX IF NOT EXISTS "IDX_platform_plans_slug" ON "platform_plans" ("slug");
      CREATE INDEX IF NOT EXISTS "IDX_platform_plans_is_active_is_public" ON "platform_plans" ("is_active", "is_public");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "platform_plans";
    `);
  }
}
