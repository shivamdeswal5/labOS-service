import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFulfillmentGuardsToPayments1710000008008 implements MigrationInterface {
  name = 'AddFulfillmentGuardsToPayments1710000008008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create atomic sequential invoice sequence for monotonic, gapless, concurrency-safe numbering
    await queryRunner.query(`
      CREATE SEQUENCE IF NOT EXISTS "subscription_invoice_seq" START WITH 100001;
    `);

    // 2. Add unique constraint on subscription_invoices(payment_id) to physically prevent duplicate invoices
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'UQ_subscription_invoices_payment_id'
        ) THEN
          ALTER TABLE "subscription_invoices"
          ADD CONSTRAINT "UQ_subscription_invoices_payment_id" UNIQUE ("payment_id");
        END IF;
      END $$;
    `);

    // 3. Add fulfillment_status column to platform_payments (nullable, populated on SUCCESS)
    await queryRunner.query(`
      ALTER TABLE "platform_payments"
      ADD COLUMN IF NOT EXISTS "fulfillment_status" varchar(30);

      UPDATE "platform_payments"
      SET "fulfillment_status" = 'FULFILLED'
      WHERE "status" = 'SUCCESS' AND "fulfillment_status" IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "subscription_invoices"
      DROP CONSTRAINT IF EXISTS "UQ_subscription_invoices_payment_id";

      ALTER TABLE "platform_payments"
      DROP COLUMN IF EXISTS "fulfillment_status";

      DROP SEQUENCE IF EXISTS "subscription_invoice_seq";
    `);
  }
}
