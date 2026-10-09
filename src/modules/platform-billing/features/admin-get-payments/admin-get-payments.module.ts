import { Module } from '@nestjs/common';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { AdminGetPaymentsController } from './admin-get-payments.controller';
import { AdminGetPaymentsHandler } from './admin-get-payments.handler';

@Module({
  imports: [PlatformBillingDatabaseModule],
  controllers: [AdminGetPaymentsController],
  providers: [AdminGetPaymentsHandler],
  exports: [AdminGetPaymentsHandler],
})
export class AdminGetPaymentsModule {}
