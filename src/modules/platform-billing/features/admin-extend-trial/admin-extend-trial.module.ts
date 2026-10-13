import { Module } from '@nestjs/common';
import { PlatformBillingDatabaseModule } from '../../infrastructure/database/platform-billing-database.module';
import { WebsocketsModule } from 'src/modules/websockets/websockets.module';
import { AdminExtendTrialController } from './admin-extend-trial.controller';
import { AdminExtendTrialHandler } from './admin-extend-trial.handler';

@Module({
  imports: [PlatformBillingDatabaseModule, WebsocketsModule],
  controllers: [AdminExtendTrialController],
  providers: [AdminExtendTrialHandler],
  exports: [AdminExtendTrialHandler],
})
export class AdminExtendTrialModule {}
