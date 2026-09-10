import { Module } from '@nestjs/common';
import { CreateOutsourcedTestModule } from './create-outsourced-test/create-outsourced-test.module';
import { UpdateOutsourcedStatusModule } from './update-outsourced-status/update-outsourced-status.module';
import { ListOutsourcedTestsModule } from './list-outsourced-tests/list-outsourced-tests.module';

@Module({
  imports: [
    CreateOutsourcedTestModule,
    UpdateOutsourcedStatusModule,
    ListOutsourcedTestsModule,
  ],
  exports: [
    CreateOutsourcedTestModule,
    UpdateOutsourcedStatusModule,
    ListOutsourcedTestsModule,
  ],
})
export class OutsourcedFeatureModule {}
