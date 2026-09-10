import { Module } from '@nestjs/common';
import { ReferralsDatabaseModule } from 'src/modules/referrals/infrastructure/database/referrals-database.module';
import { ListOutsourcedTestsController } from './list-outsourced-tests.controller';
import { ListOutsourcedTestsHandler } from './list-outsourced-tests.handler';

@Module({
  imports: [ReferralsDatabaseModule],
  controllers: [ListOutsourcedTestsController],
  providers: [ListOutsourcedTestsHandler],
  exports: [ListOutsourcedTestsHandler],
})
export class ListOutsourcedTestsModule {}
