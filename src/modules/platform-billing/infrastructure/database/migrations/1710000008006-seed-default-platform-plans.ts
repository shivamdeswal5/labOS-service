import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDefaultPlatformPlans1710000008006 implements MigrationInterface {
  name = 'SeedDefaultPlatformPlans1710000008006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "platform_plans" (
        "slug",
        "name",
        "description",
        "monthly_price_inr",
        "yearly_price_inr",
        "feature_entitlements",
        "is_active",
        "is_public"
      ) VALUES 
      (
        'STARTER',
        'Starter',
        'Built for small standalone labs run by 1–2 technicians (up to 25 samples/day)',
        499,
        4990,
        '{
          "max_staff_members": 2,
          "max_samples_per_month": 500,
          "sendout_reference_labs": false,
          "home_collection_dispatch": false,
          "custom_letterhead_calibration": true,
          "whatsapp_sharing": true,
          "barcode_generation": true,
          "doctor_referral_ledger": true
        }'::jsonb,
        true,
        true
      ),
      (
        'GROWTH',
        'Growth',
        'For established pathology labs with referral doctors & send-outs (25–75 samples/day)',
        999,
        9990,
        '{
          "max_staff_members": 6,
          "max_samples_per_month": 2000,
          "sendout_reference_labs": true,
          "home_collection_dispatch": false,
          "custom_letterhead_calibration": true,
          "whatsapp_sharing": true,
          "barcode_generation": true,
          "doctor_referral_ledger": true,
          "pnl_analytics": true
        }'::jsonb,
        true,
        true
      ),
      (
        'SCALE',
        'Scale',
        'For high-volume diagnostic centers with home collection riders (75+ samples/day)',
        1999,
        19990,
        '{
          "max_staff_members": 20,
          "max_samples_per_month": 10000,
          "sendout_reference_labs": true,
          "home_collection_dispatch": true,
          "custom_letterhead_calibration": true,
          "whatsapp_sharing": true,
          "barcode_generation": true,
          "doctor_referral_ledger": true,
          "pnl_analytics": true,
          "priority_support": true
        }'::jsonb,
        true,
        true
      )
      ON CONFLICT ("slug") DO UPDATE SET
        "name" = EXCLUDED."name",
        "description" = EXCLUDED."description",
        "monthly_price_inr" = EXCLUDED."monthly_price_inr",
        "yearly_price_inr" = EXCLUDED."yearly_price_inr",
        "feature_entitlements" = EXCLUDED."feature_entitlements",
        "updated_at" = now();
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "platform_plans" WHERE "slug" IN ('STARTER', 'GROWTH', 'SCALE');
    `);
  }
}
