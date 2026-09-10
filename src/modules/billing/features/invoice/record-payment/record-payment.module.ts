import { Module } from '@nestjs/common';
import { BillingDatabaseModule } from 'src/modules/billing/infrastructure/database/billing-database.module';
import { RecordPaymentController } from './record-payment.controller';
import { RecordPaymentHandler } from './record-payment.handler';

@Module({
  imports: [BillingDatabaseModule],
  controllers: [RecordPaymentController],
  providers: [RecordPaymentHandler],
  exports: [RecordPaymentHandler],
})
export class RecordPaymentModule {}
