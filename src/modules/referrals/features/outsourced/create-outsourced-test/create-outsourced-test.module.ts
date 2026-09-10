import { Module } from '@nestjs/common';
import { ReferralsDatabaseModule } from 'src/modules/referrals/infrastructure/database/referrals-database.module';
import { CreateOutsourcedTestController } from './create-outsourced-test.controller';
import { CreateOutsourcedTestHandler } from './create-outsourced-test.handler';

@Module({
  imports: [ReferralsDatabaseModule],
  controllers: [CreateOutsourcedTestController],
  providers: [CreateOutsourcedTestHandler],
  exports: [CreateOutsourcedTestHandler],
})
export class CreateOutsourcedTestModule {}
