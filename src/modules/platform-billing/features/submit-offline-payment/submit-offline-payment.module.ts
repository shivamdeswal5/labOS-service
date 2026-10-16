import { Module } from '@nestjs/common';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { SubmitOfflinePaymentController } from './submit-offline-payment.controller';
import { SubmitOfflinePaymentHandler } from './submit-offline-payment.handler';

@Module({
  imports: [PlatformBillingDatabaseModule],
  controllers: [SubmitOfflinePaymentController],
  providers: [SubmitOfflinePaymentHandler],
  exports: [SubmitOfflinePaymentHandler],
})
export class SubmitOfflinePaymentModule {}
