import { Module } from '@nestjs/common';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { WebsocketsModule } from '../../../websockets/websockets.module';
import { CancelScheduledDowngradeController } from './cancel-scheduled-downgrade.controller';
import { CancelScheduledDowngradeHandler } from './cancel-scheduled-downgrade.handler';

@Module({
  imports: [PlatformBillingDatabaseModule, WebsocketsModule],
  controllers: [CancelScheduledDowngradeController],
  providers: [CancelScheduledDowngradeHandler],
  exports: [CancelScheduledDowngradeHandler],
})
export class CancelScheduledDowngradeModule {}
