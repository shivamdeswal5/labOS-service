import { Module } from '@nestjs/common';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { GetPublicPlansController } from './get-public-plans.controller';
import { GetPublicPlansHandler } from './get-public-plans.handler';

@Module({
  imports: [PlatformBillingDatabaseModule],
  controllers: [GetPublicPlansController],
  providers: [GetPublicPlansHandler],
  exports: [GetPublicPlansHandler],
})
export class GetPublicPlansModule {}
