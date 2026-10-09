import { Module } from '@nestjs/common';
import { PlatformBillingDatabaseModule } from './infrastructure/database/platform-billing-database.module';
import { GetPublicPlansModule } from './features/get-public-plans/get-public-plans.module';
import { GetTenantSubscriptionModule } from './features/get-tenant-subscription/get-tenant-subscription.module';
import { CreateSubscriptionOrderModule } from './features/create-subscription-order/create-subscription-order.module';
import { HandleRazorpayWebhookModule } from './features/handle-razorpay-webhook/handle-razorpay-webhook.module';
import { ReconcileStalePaymentsModule } from './features/reconcile-stale-payments/reconcile-stale-payments.module';
import { PaymentReconciliationCron } from './infrastructure/cron/payment-reconciliation.cron';

import { AdminGetTenantsModule } from './features/admin-get-tenants/admin-get-tenants.module';
import { AdminManualActivationModule } from './features/admin-manual-activation/admin-manual-activation.module';
import { AdminGetPaymentsModule } from './features/admin-get-payments/admin-get-payments.module';
import { AdminCreateTenantModule } from './features/admin-create-tenant/admin-create-tenant.module';

@Module({
  imports: [
    PlatformBillingDatabaseModule,
    GetPublicPlansModule,
    GetTenantSubscriptionModule,
    CreateSubscriptionOrderModule,
    HandleRazorpayWebhookModule,
    ReconcileStalePaymentsModule,
    AdminGetTenantsModule,
    AdminManualActivationModule,
    AdminGetPaymentsModule,
    AdminCreateTenantModule,
  ],
  providers: [PaymentReconciliationCron],
  exports: [
    PlatformBillingDatabaseModule,
    GetPublicPlansModule,
    GetTenantSubscriptionModule,
    CreateSubscriptionOrderModule,
    HandleRazorpayWebhookModule,
    ReconcileStalePaymentsModule,
    AdminGetTenantsModule,
    AdminManualActivationModule,
    AdminGetPaymentsModule,
    AdminCreateTenantModule,
  ],
})
export class PlatformBillingModule {}
