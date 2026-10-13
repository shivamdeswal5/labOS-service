import { Module } from '@nestjs/common';
import { PlatformBillingDatabaseModule } from './infrastructure/database/platform-billing-database.module';
import { GetPublicPlansModule } from './features/get-public-plans/get-public-plans.module';
import { GetTenantSubscriptionModule } from './features/get-tenant-subscription/get-tenant-subscription.module';
import { CreateSubscriptionOrderModule } from './features/create-subscription-order/create-subscription-order.module';
import { HandleRazorpayWebhookModule } from './features/handle-razorpay-webhook/handle-razorpay-webhook.module';
import { ReconcileStalePaymentsModule } from './features/reconcile-stale-payments/reconcile-stale-payments.module';
import { AdminGetTenantsModule } from './features/admin-get-tenants/admin-get-tenants.module';
import { AdminManualActivationModule } from './features/admin-manual-activation/admin-manual-activation.module';
import { AdminGetPaymentsModule } from './features/admin-get-payments/admin-get-payments.module';
import { AdminCreateTenantModule } from './features/admin-create-tenant/admin-create-tenant.module';
import { AdminExtendTrialModule } from './features/admin-extend-trial/admin-extend-trial.module';
import { AdminToggleTenantStatusModule } from './features/admin-toggle-tenant-status/admin-toggle-tenant-status.module';
import { AdminGetPlansModule } from './features/admin-get-plans/admin-get-plans.module';
import { AdminUpdatePlanModule } from './features/admin-update-plan/admin-update-plan.module';
import { AdminImpersonateTenantModule } from './features/admin-impersonate-tenant/admin-impersonate-tenant.module';
import { AdminPurgeTestDataModule } from './features/admin-purge-test-data/admin-purge-test-data.module';
import { WebsocketsModule } from '../websockets/websockets.module';
import { PaymentReconciliationCron } from './infrastructure/cron/payment-reconciliation.cron';
import { SubscriptionLifecycleCron } from './infrastructure/cron/subscription-lifecycle.cron';
import { LabCreatedProvisionSubscriptionListener } from './infrastructure/listeners/lab-created-provision-subscription.listener';
import { SubscriptionIntakeGuard } from './guards/subscription-intake.guard';

@Module({
  imports: [
    PlatformBillingDatabaseModule,
    WebsocketsModule,
    GetPublicPlansModule,
    GetTenantSubscriptionModule,
    CreateSubscriptionOrderModule,
    HandleRazorpayWebhookModule,
    ReconcileStalePaymentsModule,
    AdminGetTenantsModule,
    AdminManualActivationModule,
    AdminGetPaymentsModule,
    AdminCreateTenantModule,
    AdminExtendTrialModule,
    AdminToggleTenantStatusModule,
    AdminGetPlansModule,
    AdminUpdatePlanModule,
    AdminImpersonateTenantModule,
    AdminPurgeTestDataModule,
  ],
  providers: [
    PaymentReconciliationCron,
    SubscriptionLifecycleCron,
    LabCreatedProvisionSubscriptionListener,
    SubscriptionIntakeGuard,
  ],

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
    AdminExtendTrialModule,
    AdminToggleTenantStatusModule,
    AdminGetPlansModule,
    AdminUpdatePlanModule,
    AdminImpersonateTenantModule,
    AdminPurgeTestDataModule,
    SubscriptionIntakeGuard,
  ],
})
export class PlatformBillingModule {}

